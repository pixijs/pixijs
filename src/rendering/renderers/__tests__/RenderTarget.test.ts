import { GlRenderTarget } from '../gl/GlRenderTarget';
import { isRenderingToScreen } from '../shared/renderTarget/isRenderingToScreen';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { RenderTexture } from '../shared/texture/RenderTexture';
import { CanvasSource } from '../shared/texture/sources/CanvasSource';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { DOMAdapter } from '~/environment';

describe('isRenderingToScreen', () =>
{
    type SetupOptions = {
        width: number;
        height: number;
        resolution: number;
    };

    const setup = (opts: Partial<SetupOptions> = {}) =>
    {
        const width = opts.width || RenderTarget.defaultOptions.width;
        const height = opts.height || RenderTarget.defaultOptions.height;
        const resolution = opts.resolution || RenderTarget.defaultOptions.resolution;
        const canvas = DOMAdapter.get().createCanvas(width, height);
        const texture = new Texture({
            source: new CanvasSource({
                resource: canvas,
                resolution,
                width,
                height,
            }),
        });

        return new RenderTarget({
            width,
            height,
            resolution,
            colorTextures: [
                texture
            ]
        });
    };

    it('returns true for a canvas attached to the dom', () =>
    {
        const renderTarget = setup();
        const canvas = renderTarget.colorTexture.source.resource;

        document.body.appendChild(canvas);

        expect(isRenderingToScreen(renderTarget)).toBe(true);
    });

    it('returns false for canvas not attached to the dom', () =>
    {
        const renderTarget = setup();

        expect(isRenderingToScreen(renderTarget)).toBe(false);
    });

    it('returns false if the texture is not a canvas', () =>
    {
        const renderTarget = new RenderTarget({
            colorTextures: [
                Texture.EMPTY
            ]
        });

        expect(isRenderingToScreen(renderTarget)).toBe(false);
    });

    it('should create with default resolution', () =>
    {
        const width = 2;
        const height = 1;
        const renderTarget = setup({ width, height });

        expect(renderTarget.colorTexture.source.resource).toBeInstanceOf(HTMLCanvasElement);
        expect(renderTarget.width).toEqual(width);
        expect(renderTarget.height).toEqual(height);
        expect(renderTarget.resolution).toEqual(RenderTarget.defaultOptions.resolution);
        expect(renderTarget.colorTexture.source.resource.width).toEqual(width * RenderTarget.defaultOptions.resolution);
        expect(renderTarget.colorTexture.source.resource.height).toEqual(height * RenderTarget.defaultOptions.resolution);
    });

    it('should create with custom resolution', () =>
    {
        const width = 2;
        const height = 1;
        const resolution = 2;
        const renderTarget = setup({ width, height, resolution });

        expect(renderTarget.width).toEqual(width);
        expect(renderTarget.height).toEqual(height);
        expect(renderTarget.resolution).toEqual(resolution);
        expect(renderTarget.colorTexture.source.resource.width).toEqual(width * resolution);
        expect(renderTarget.colorTexture.source.resource.height).toEqual(height * resolution);
    });

    it('should manually set width and height', () =>
    {
        const width = 2;
        const height = 1;
        const renderTarget = setup({ width, height });

        renderTarget.resize(width * 3, height * 3);

        expect(renderTarget.colorTexture.source.resource.width).toEqual(width * 3);
        expect(renderTarget.colorTexture.source.resource.height).toEqual(height * 3);
    });

    it('should destroy gpu counterpart correctly', async () =>
    {
        const renderer = await getWebGLRenderer();

        const renderTexture = RenderTexture.create({ width: 100, height: 100 });

        renderer.renderTarget.bind(renderTexture);

        const renderTarget = renderer.renderTarget.getRenderTarget(renderTexture);

        const glRenderTarget = renderer.renderTarget.getGpuRenderTarget(renderTarget);

        renderTexture.destroy(true);

        expect(glRenderTarget.framebuffer).toBeNull();
        expect(glRenderTarget.resolveTargetFramebuffer).toBeNull();
        expect(glRenderTarget.msaaRenderBuffer).toBeNull();

        expect(glRenderTarget).toBeInstanceOf(GlRenderTarget);
    });

    it('should not destroy the original texture if the  renderTarget is destroyed', async () =>
    {
        const renderer = await getWebGLRenderer();

        const renderTexture = RenderTexture.create({ width: 100, height: 100 });

        renderer.renderTarget.bind(renderTexture);

        const renderTarget = renderer.renderTarget.getRenderTarget(renderTexture);

        renderTarget.destroy();

        expect(renderTexture.source.destroyed).toBe(false);
    });
});

describe('Depth-only RenderTarget', () =>
{
    it('should create a depth-only target with colorTextures: 0', () =>
    {
        const renderTarget = new RenderTarget({
            width: 512,
            height: 512,
            colorTextures: 0,
            depth: true,
        });

        expect(renderTarget.colorTextures.length).toBe(0);
        expect(renderTarget.colorTexture).toBeUndefined();
        expect(renderTarget.depthStencilTexture).toBeInstanceOf(TextureSource);
        expect(renderTarget.width).toBe(512);
        expect(renderTarget.height).toBe(512);
        expect(renderTarget.pixelWidth).toBe(512);
        expect(renderTarget.pixelHeight).toBe(512);
        expect(renderTarget.resolution).toBe(1);
    });

    it('should throw when colorTextures: 0 and no depth texture provided', () =>
    {
        expect(() => new RenderTarget({
            width: 256,
            height: 256,
            colorTextures: 0,
        })).toThrow('[RenderTarget]');
    });

    it('should accept a custom depth texture source', () =>
    {
        const depthSource = new TextureSource({
            width: 1024,
            height: 1024,
            format: 'depth24plus',
        });

        const renderTarget = new RenderTarget({
            colorTextures: 0,
            depthStencilTexture: depthSource,
        });

        expect(renderTarget.depthStencilTexture).toBe(depthSource);
        expect(renderTarget.width).toBe(1024);
        expect(renderTarget.height).toBe(1024);
    });

    it('should resize via depth texture for depth-only targets', () =>
    {
        const renderTarget = new RenderTarget({
            width: 128,
            height: 128,
            colorTextures: 0,
            depth: true,
        });

        renderTarget.resize(256, 256);

        expect(renderTarget.width).toBe(256);
        expect(renderTarget.height).toBe(256);
        expect(renderTarget.depthStencilTexture.width).toBe(256);
        expect(renderTarget.depthStencilTexture.height).toBe(256);
    });

    it('should report isRenderingToScreen as false', () =>
    {
        const renderTarget = new RenderTarget({
            width: 64,
            height: 64,
            colorTextures: 0,
            depth: true,
        });

        expect(isRenderingToScreen(renderTarget)).toBe(false);
    });

    it('should destroy cleanly', () =>
    {
        const renderTarget = new RenderTarget({
            width: 64,
            height: 64,
            colorTextures: 0,
            depth: true,
        });

        expect(() => renderTarget.destroy()).not.toThrow();
        expect(renderTarget.depthStencilTexture).toBeUndefined();
    });

    it('should still create a normal target with colorTextures: 1 (default)', () =>
    {
        const renderTarget = new RenderTarget({
            width: 100,
            height: 100,
        });

        expect(renderTarget.colorTextures.length).toBe(1);
        expect(renderTarget.colorTexture).toBeInstanceOf(TextureSource);
        expect(renderTarget.width).toBe(100);
        expect(renderTarget.height).toBe(100);
    });

    it('should bind a depth-only target in WebGL', async () =>
    {
        const renderer = await getWebGLRenderer();

        const renderTarget = new RenderTarget({
            width: 256,
            height: 256,
            colorTextures: 0,
            depth: true,
        });

        expect(() => renderer.renderTarget.bind(renderTarget, true)).not.toThrow();

        renderTarget.destroy();
    });
});
