import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { RenderTexture, Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import '@pixi/canvas-display';

describe('CanvasExtract', () =>
{
    it('should access extract on renderer', () =>
    {
        const renderer = new CanvasRenderer();

        expect(renderer.extract).toBeInstanceOf(CanvasExtract);

        renderer.destroy();
    });

    it('should extract an sprite', async () =>
    {
        const renderer = new CanvasRenderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract as CanvasExtract;

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8ClampedArray);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract with no arguments', async () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.extract as CanvasExtract;

        expect(extract.canvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64()).toBeString();
        expect(extract.pixels()).toBeInstanceOf(Uint8ClampedArray);
        expect(await extract.image()).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
    });

    it('should extract a render texture', async () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.extract as CanvasExtract;
        const renderTexture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(Texture.WHITE);

        renderer.render(sprite, { renderTexture });

        expect(extract.canvas(renderTexture)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(renderTexture)).toBeString();
        expect(extract.pixels(renderTexture)).toBeInstanceOf(Uint8ClampedArray);
        expect(await extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        renderTexture.destroy();
        sprite.destroy();
    });
});
