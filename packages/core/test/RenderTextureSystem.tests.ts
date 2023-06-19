import { ALPHA_MODES, Renderer, RenderTexture } from '@pixi/core';
import { Rectangle } from '@pixi/math';

describe('RenderTextureSystem', () =>
{
    let renderer: Renderer;

    beforeAll(() =>
    {
        renderer = new Renderer({ resolution: 4, width: 1024, height: 1024 });
    });

    afterAll(() =>
    {
        renderer = null;
    });

    it('the default viewport should have a width/height equal to that of the renderer', () =>
    {
        renderer.renderTexture.bind();

        const viewport = renderer.framebuffer.viewport;

        expect(viewport.x).toEqual(0);
        expect(viewport.y).toEqual(0);
        expect(viewport.width).toEqual(renderer.width);
        expect(viewport.height).toEqual(renderer.height);

        const destinationFrame = renderer.renderTexture.destinationFrame;

        expect(destinationFrame.x).toEqual(0);
        expect(destinationFrame.y).toEqual(0);
        expect(destinationFrame.width).toEqual(renderer.width / renderer.resolution);
        expect(destinationFrame.height).toEqual(renderer.height / renderer.resolution);
    });

    it('rebinding with the same source & destination frame should change nothing', () =>
    {
        const sourceFrame = new Rectangle(16, 16, 512, 512);
        const destinationFrame = new Rectangle(24, 24, 64, 64);
        const renderTextureSystem = renderer.renderTexture;

        renderTextureSystem.bind(null, sourceFrame, destinationFrame);
        renderTextureSystem.bind(null, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame);

        expect(destinationFrame.x).toEqual(renderTextureSystem.destinationFrame.x);
        expect(destinationFrame.y).toEqual(renderTextureSystem.destinationFrame.y);
        expect(destinationFrame.width).toEqual(renderTextureSystem.destinationFrame.width);
        expect(destinationFrame.height).toEqual(renderTextureSystem.destinationFrame.height);

        expect(sourceFrame.x).toEqual(renderTextureSystem.sourceFrame.x);
        expect(sourceFrame.y).toEqual(renderTextureSystem.sourceFrame.y);
        expect(sourceFrame.width).toEqual(renderTextureSystem.sourceFrame.width);
        expect(sourceFrame.height).toEqual(renderTextureSystem.sourceFrame.height);
    });

    it('should clear renderer (alpha=false) correctly', () =>
    {
        const renderer = new Renderer({
            width: 1,
            height: 1,
            backgroundColor: 0xFF0000
        });

        renderer.renderTexture.bind();
        renderer.renderTexture.clear();

        const gl = renderer.gl;
        const pixel = new Uint8Array(4);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toBe(255);
        expect(pixel[1]).toBe(0);
        expect(pixel[2]).toBe(0);
        expect(pixel[3]).toBe(255);

        renderer.destroy();
    });

    it('should clear renderer (alpha=true, premultipliedAlpha=false) correctly', () =>
    {
        const renderer = new Renderer({
            width: 1,
            height: 1,
            backgroundColor: 0xFF0000,
            backgroundAlpha: 0.4,
            premultipliedAlpha: false
        });

        renderer.renderTexture.bind();
        renderer.renderTexture.clear();

        const gl = renderer.gl;
        const pixel = new Uint8Array(4);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toBe(255);
        expect(pixel[1]).toBe(0);
        expect(pixel[2]).toBe(0);
        expect(pixel[3]).toBe(102);

        renderer.destroy();
    });

    it('should clear renderer (alpha=true, premultipliedAlpha=true) correctly', () =>
    {
        const renderer = new Renderer({
            width: 1,
            height: 1,
            backgroundColor: 0xFF0000,
            backgroundAlpha: 0.4,
            premultipliedAlpha: true
        });

        renderer.renderTexture.bind();
        renderer.renderTexture.clear();

        const gl = renderer.gl;
        const pixel = new Uint8Array(4);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toBe(102);
        expect(pixel[1]).toBe(0);
        expect(pixel[2]).toBe(0);
        expect(pixel[3]).toBe(102);

        renderer.destroy();
    });

    it('should clear render texture (NPM) correctly', () =>
    {
        const renderer = new Renderer();
        const renderTexture = RenderTexture.create({
            width: 1,
            height: 1,
            alphaMode: ALPHA_MODES.NPM
        });

        renderTexture.baseTexture.clearColor = 'rgba(255, 0, 0, 0.4)';
        renderer.renderTexture.bind(renderTexture);
        renderer.renderTexture.clear();

        const gl = renderer.gl;
        const pixel = new Uint8Array(4);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toBe(255);
        expect(pixel[1]).toBe(0);
        expect(pixel[2]).toBe(0);
        expect(pixel[3]).toBe(102);

        renderer.destroy();
    });

    it('should clear render texture (PMA/UNPACK) correctly', () =>
    {
        const renderer = new Renderer();
        const renderTexture = RenderTexture.create({
            width: 1,
            height: 1,
            alphaMode: ALPHA_MODES.PMA
        });

        renderTexture.baseTexture.clearColor = 'rgba(255, 0, 0, 0.4)';
        renderer.renderTexture.bind(renderTexture);
        renderer.renderTexture.clear();

        const gl = renderer.gl;
        const pixel = new Uint8Array(4);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toBe(102);
        expect(pixel[1]).toBe(0);
        expect(pixel[2]).toBe(0);
        expect(pixel[3]).toBe(102);

        renderer.destroy();
    });
});
