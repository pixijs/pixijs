import { DOMAdapter } from '../../../src/environment/adapter';
import { isRenderingToScreen } from '../../../src/rendering/renderers/shared/renderTarget/isRenderingToScreen';
import { RenderTarget } from '../../../src/rendering/renderers/shared/renderTarget/RenderTarget';
import { CanvasSource } from '../../../src/rendering/renderers/shared/texture/sources/CanvasSource';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';

describe('isRenderingToScreen', () =>
{
    type SetupOptions = {
        width: number;
        height: number;
        resolution: number;
    };

    const setup = (opts: Partial<SetupOptions> = {}) =>
    {
        const width = opts.width || RenderTarget.defaultDescriptor.width;
        const height = opts.height || RenderTarget.defaultDescriptor.height;
        const resolution = opts.resolution || RenderTarget.defaultDescriptor.resolution;
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
        expect(renderTarget.resolution).toEqual(RenderTarget.defaultDescriptor.resolution);
        expect(renderTarget.colorTexture.source.resource.width).toEqual(width * RenderTarget.defaultDescriptor.resolution);
        expect(renderTarget.colorTexture.source.resource.height).toEqual(height * RenderTarget.defaultDescriptor.resolution);
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
});
