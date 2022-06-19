import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Sprite } from '@pixi/sprite';
import { skipHello } from '@pixi/utils';
import { Texture, RenderTexture, extensions } from '@pixi/core';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';

import '@pixi/canvas-display';

skipHello();

describe('CanvasExtract', () =>
{
    beforeAll(() => extensions.add(CanvasExtract, CanvasSpriteRenderer));
    afterAll(() => extensions.remove(CanvasExtract, CanvasSpriteRenderer));

    it('should access extract on renderer', () =>
    {
        const renderer = new CanvasRenderer();

        expect(renderer.plugins.extract).to.be.an.instanceof(CanvasExtract);

        renderer.destroy();
    });

    it('should extract an sprite', () =>
    {
        const renderer = new CanvasRenderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.plugins.extract as CanvasExtract;

        expect(extract.canvas(sprite)).to.be.an.instanceof(HTMLCanvasElement);
        expect(extract.base64(sprite)).to.be.a('string');
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8ClampedArray);
        expect(extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract with no arguments', () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.plugins.extract as CanvasExtract;

        expect(extract.canvas()).to.be.an.instanceof(HTMLCanvasElement);
        expect(extract.base64()).to.be.a('string');
        expect(extract.pixels()).toBeInstanceOf(Uint8ClampedArray);
        expect(extract.image()).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
    });

    it('should extract a render texture', () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.plugins.extract as CanvasExtract;
        const renderTexture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(Texture.WHITE);

        renderer.render(sprite, { renderTexture });

        expect(extract.canvas(renderTexture)).to.be.an.instanceof(HTMLCanvasElement);
        expect(extract.base64(renderTexture)).to.be.a('string');
        expect(extract.pixels(renderTexture)).toBeInstanceOf(Uint8ClampedArray);
        expect(extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        renderTexture.destroy();
        sprite.destroy();
    });
});
