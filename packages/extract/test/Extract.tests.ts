import { ALPHA_MODES, FORMATS, Rectangle, Renderer, RenderTexture, Texture, TYPES } from '@pixi/core';
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

    it('should extract pixels from renderer correctly (without y-flipping)', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        renderer.render(sprite);

        const extractedPixels = extract.pixels();

        expect(extractedPixels).toEqual(new Uint8Array([
            0, 0, 102, 255, 51, 51, 0, 255,
            255, 0, 0, 255, 0, 153, 0, 255
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract canvas from renderer correctly (with y-flipping)', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        renderer.render(sprite);

        const canvas = extract.canvas();
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, 2, 2);

        expect(imageData.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 153, 0, 255,
            0, 0, 102, 255, 51, 51, 0, 255
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract pixels from render texture correctly', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        const extractedPixels = extract.pixels(sprite);

        expect(extractedPixels).toEqual(texturePixels);

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract canvas from render texture correctly', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        const canvas = extract.canvas(sprite);
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, 2, 2);

        expect(imageData.data).toEqual(new Uint8ClampedArray(texturePixels.buffer));

        texture.destroy(true);
        sprite.destroy();
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
});
