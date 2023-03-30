import { ALPHA_MODES, Rectangle, Renderer, RenderTexture, Texture } from '@pixi/core';
import { Extract } from '@pixi/extract';
import { Sprite } from '@pixi/sprite';

describe('Extract', () =>
{
    it('should access extract on renderer', () =>
    {
        const renderer = new Renderer();

        expect(renderer.plugins.extract).toBeInstanceOf(Extract);
        expect(renderer.extract).toBeInstanceOf(Extract);

        renderer.destroy();
    });

    it('should extract an sprite', async () =>
    {
        const renderer = new Renderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract;

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8Array);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract with no arguments', async () =>
    {
        const renderer = new Renderer();
        const extract = renderer.extract;

        expect(extract.canvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64()).toBeString();
        expect(extract.pixels()).toBeInstanceOf(Uint8Array);
        expect(await extract.image()).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
    });

    it('should extract a render texture', async () =>
    {
        const renderer = new Renderer();
        const extract = renderer.extract;
        const renderTexture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(Texture.WHITE);
        const frame = new Rectangle(1, 2, 5, 6);

        renderer.render(sprite, { renderTexture });

        expect(extract.canvas(renderTexture)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(renderTexture)).toBeString();
        expect(extract.pixels(renderTexture, frame)).toBeInstanceOf(Uint8Array);
        expect(await extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        renderTexture.destroy();
        sprite.destroy();
    });

    it('should extract with multisample', async () =>
    {
        const renderer = new Renderer({ antialias: true });
        const extract = renderer.extract;
        const sprite = new Sprite(Texture.WHITE);

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8Array);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should unpremultiply if premultiplied alpha', async () =>
    {
        const renderer = new Renderer({
            width: 1,
            height: 1,
            backgroundColor: 0xFFFFFF,
            backgroundAlpha: 0.4,
            premultipliedAlpha: true
        });
        const extract = renderer.extract;
        const renderTexture = RenderTexture.create({
            width: 1,
            height: 1,
            alphaMode: ALPHA_MODES.PREMULTIPLIED_ALPHA
        });

        renderer.renderTexture.bind();
        renderer.renderTexture.clear([0.4, 0.4, 0.4, 0.4]);

        const rendererPixels = extract.pixels();

        expect(rendererPixels[0]).toBe(255);
        expect(rendererPixels[1]).toBe(255);
        expect(rendererPixels[2]).toBe(255);
        expect(rendererPixels[3]).toBe(102);

        renderer.renderTexture.bind(renderTexture);
        renderer.renderTexture.clear([0.4, 0.4, 0.4, 0.4]);

        const renderTexturePixels = extract.pixels(renderTexture);

        expect(renderTexturePixels[0]).toBe(255);
        expect(renderTexturePixels[1]).toBe(255);
        expect(renderTexturePixels[2]).toBe(255);
        expect(renderTexturePixels[3]).toBe(102);

        renderer.destroy();
        renderTexture.destroy();
    });

    it('should not unpremultiply if no premultiplied alpha', async () =>
    {
        const renderer = new Renderer({
            width: 1,
            height: 1,
            backgroundColor: 0xCCCCCC,
            backgroundAlpha: 0.4,
            premultipliedAlpha: false
        });
        const extract = renderer.extract;
        const renderTexture = RenderTexture.create({
            width: 1,
            height: 1,
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
        });

        renderer.renderTexture.bind();
        renderer.renderTexture.clear([0.8, 0.8, 0.8, 0.4]);

        const rendererPixels = extract.pixels();

        expect(rendererPixels[0]).toBe(204);
        expect(rendererPixels[1]).toBe(204);
        expect(rendererPixels[2]).toBe(204);
        expect(rendererPixels[3]).toBe(102);

        renderer.renderTexture.bind(renderTexture);
        renderer.renderTexture.clear([0.8, 0.8, 0.8, 0.4]);

        const renderTexturePixels = extract.pixels(renderTexture);

        expect(renderTexturePixels[0]).toBe(204);
        expect(renderTexturePixels[1]).toBe(204);
        expect(renderTexturePixels[2]).toBe(204);
        expect(renderTexturePixels[3]).toBe(102);

        renderer.destroy();
        renderTexture.destroy();
    });
});
