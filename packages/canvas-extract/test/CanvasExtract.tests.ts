import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Sprite } from '@pixi/sprite';
import { skipHello } from '@pixi/utils';
import { Texture, RenderTexture } from '@pixi/core';

import '@pixi/canvas-display';

skipHello();

describe('CanvasExtract', () =>
{
    it('should access extract on renderer', () =>
    {
        const renderer = new CanvasRenderer();

        expect(renderer.extract).toBeInstanceOf(CanvasExtract);

        renderer.destroy();
    });

    it('should extract an sprite', () =>
    {
        const renderer = new CanvasRenderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract as CanvasExtract;

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8ClampedArray);
        expect(extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract with no arguments', () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.extract as CanvasExtract;

        expect(extract.canvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(extract.base64()).toBeString();
        expect(extract.pixels()).toBeInstanceOf(Uint8ClampedArray);
        expect(extract.image()).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
    });

    it('should extract a render texture', () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.extract as CanvasExtract;
        const renderTexture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(Texture.WHITE);

        renderer.render(sprite, { renderTexture });

        expect(extract.canvas(renderTexture)).toBeInstanceOf(HTMLCanvasElement);
        expect(extract.base64(renderTexture)).toBeString();
        expect(extract.pixels(renderTexture)).toBeInstanceOf(Uint8ClampedArray);
        expect(extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        renderTexture.destroy();
        sprite.destroy();
    });
});
