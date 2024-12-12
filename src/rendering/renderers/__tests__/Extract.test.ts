import '~/scene/graphics/init';
import { ExtractSystem } from '../shared/extract/ExtractSystem';
import { RenderTexture } from '../shared/texture/RenderTexture';
import { ImageSource } from '../shared/texture/sources/ImageSource';
import { Texture } from '../shared/texture/Texture';
import '../../init';
import { getTexture, getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { Container, Graphics, Sprite } from '~/scene';

import type { WebGLRenderer } from '../gl/WebGLRenderer';

describe('GenerateTexture', () =>
{
    describe('Container as source', () =>
    {
        it('should generate canvas from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const container = new Container();
            const canvas = renderer.extract.canvas(container);

            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        });

        it('should generate base64 from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const container = new Container();
            const base64 = await renderer.extract.base64(container);

            expect(typeof base64).toBe('string');
        });

        it('should generate image from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const container = new Container();
            const image = await renderer.extract.image(container);

            expect(image).toBeInstanceOf(HTMLImageElement);
        });

        it('should generate pixels from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const container = new Container();
            const pixels = renderer.extract.pixels(container);

            expect(pixels.pixels.length).toBeGreaterThan(0);
            expect(pixels.width).toBeGreaterThan(0);
            expect(pixels.height).toBeGreaterThan(0);
        });

        it('should generate texture from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const container = new Container();
            const texture = renderer.extract.texture(container);

            expect(texture).toBeInstanceOf(Texture);
        });
    });

    describe('Texture as source', () =>
    {
        it('should generate canvas from Texture', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const canvas = renderer.extract.canvas(renderTexture);

            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        });

        it('should generate base64 from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const base64 = await renderer.extract.base64(renderTexture);

            expect(typeof base64).toBe('string');
        });

        it('should generate image from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const image = await renderer.extract.image(renderTexture);

            expect(image).toBeInstanceOf(HTMLImageElement);
        });

        it('should generate pixels from Container', async () =>
        {
            const renderer = (await getWebGLRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const pixels = renderer.extract.pixels(renderTexture);

            expect(pixels.pixels).toHaveLength(renderTexture.width * renderTexture.height * 4);
            expect(pixels.width).toBe(renderTexture.width);
            expect(pixels.height).toBe(renderTexture.height);
        });
    });

    it('should access extract on renderer', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        expect(renderer.extract).toBeInstanceOf(ExtractSystem);

        renderer.destroy();
    });

    it('should extract the same pixels', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 2, height: 2 })) as WebGLRenderer;

        const graphics = new Graphics()
            .rect(0, 0, 1, 1)
            .fill(0xFF0000)
            .rect(1, 0, 1, 1)
            .fill(0x00FF00)
            .rect(0, 1, 1, 1)
            .fill(0x0000FF)
            .rect(1, 1, 1, 1)
            .fill(0xFFFF00);

        const expectedPixels = new Uint8ClampedArray([
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255,
            255, 255, 0, 255
        ]);

        const pixelsGraphics = renderer.extract.pixels(graphics);

        expect(pixelsGraphics.pixels).toEqual(expectedPixels);
    });

    it('should extract pixels from renderer correctly', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 2, height: 2 })) as WebGLRenderer;
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);

        const texture = Texture.from({
            resource: texturePixels,
            width: 2,
            height: 2,
            alphaMode: 'premultiply-alpha-on-upload',
        });

        const sprite = new Sprite(texture);

        const extractedPixels = renderer.extract.pixels(sprite).pixels;

        expect(extractedPixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]));
    });

    it('should extract canvas from renderer correctly', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 2, height: 2 })) as WebGLRenderer;

        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);

        const texture = Texture.from({
            resource: texturePixels,
            width: 2,
            height: 2,
            alphaMode: 'premultiply-alpha-on-upload',
        });

        const sprite = new Sprite(texture);

        renderer.render(sprite);

        const canvas = renderer.extract.canvas(sprite);
        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255,
            0, 255, 0, 153,
            0, 0, 255, 102,
            255, 255, 0, 51
        ]));
    });

    it('should extract pixels from render texture correctly', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 2, height: 2 })) as WebGLRenderer;

        const texturePixels = new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);

        const texture = Texture.from({
            resource: texturePixels,
            width: 2,
            height: 2,
            alphaMode: 'premultiply-alpha-on-upload',
        });

        const sprite = new Sprite(texture);

        const { pixels, width, height } = renderer.extract.pixels(sprite);

        expect(pixels).toEqual(texturePixels);
        expect(width).toEqual(2);
        expect(height).toEqual(2);
    });

    it('should extract canvas from render texture correctly', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 2, height: 2 })) as WebGLRenderer;
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.from({
            resource: texturePixels,
            width: 2,
            height: 2,
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        const canvas = extract.canvas(sprite);
        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray(texturePixels.buffer));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract pixels with resolution !== 1', async () =>
    {
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51,
        ]);

        const texture = Texture.from({
            width: 2,
            height: 2,
            resource: texturePixels,
            alphaMode: 'premultiply-alpha-on-upload',
            scaleMode: 'nearest'
        });

        const renderer = await getWebGLRenderer({ width: 2, height: 2, resolution: 2 });

        const sprite = new Sprite(texture);

        renderer.render(sprite);

        const pixels = renderer.extract.pixels(sprite);

        expect(pixels.width).toEqual(4);
        expect(pixels.height).toEqual(4);

        expect(pixels.pixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 153, 0, 255, 0, 153,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 153, 0, 255, 0, 153,
            0, 0, 255, 102, 0, 0, 255, 102, 255, 255, 0, 51, 255, 255, 0, 51,
            0, 0, 255, 102, 0, 0, 255, 102, 255, 255, 0, 51, 255, 255, 0, 51,
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract canvas with resolution !== 1', async () =>
    {
        const renderer = (await getWebGLRenderer({ width: 2, height: 2, resolution: 2 })) as WebGLRenderer;

        const texturePixels = new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51,
        ]);

        const texture = Texture.from({
            width: 2,
            height: 2,
            resource: texturePixels,
            alphaMode: 'premultiply-alpha-on-upload',
            scaleMode: 'nearest'
        });

        const sprite = new Sprite(texture);
        const canvas = renderer.extract.canvas(sprite);

        expect(canvas.width).toEqual(4);
        expect(canvas.height).toEqual(4);

        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 4, 4);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 153, 0, 255, 0, 153,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 153, 0, 255, 0, 153,
            0, 0, 255, 102, 0, 0, 255, 102, 255, 255, 0, 51, 255, 255, 0, 51,
            0, 0, 255, 102, 0, 0, 255, 102, 255, 255, 0, 51, 255, 255, 0, 51,
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract an sprite', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract;

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite).pixels).toBeInstanceOf(Uint8ClampedArray);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract a render texture', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const extract = renderer.extract;
        const renderTexture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(Texture.WHITE);
        const frame = new Rectangle(1, 2, 5, 6);

        expect(extract.canvas(renderTexture)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(renderTexture)).toBeString();
        expect(extract.pixels({ target: renderTexture, frame }).pixels).toBeInstanceOf(Uint8ClampedArray);
        expect(await extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        renderTexture.destroy();
        sprite.destroy();
    });

    it('should extract with multisample', async () =>
    {
        const renderer = (await getWebGLRenderer({ antialias: true })) as WebGLRenderer;
        const extract = renderer.extract;
        const sprite = new Sprite(Texture.WHITE);

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite).pixels).toBeInstanceOf(Uint8ClampedArray);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract from object with frame correctly', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const graphics = new Graphics();

        graphics.context
            .beginPath()
            .rect(0, 0, 1, 1)
            .fill(0xFF0000)
            .closePath()
            .beginPath()
            .rect(1, 0, 1, 1)
            .fill(0x00FF00)
            .closePath()
            .beginPath()
            .rect(0, 1, 1, 1)
            .fill(0x0000FF)
            .closePath()
            .beginPath()
            .rect(1, 1, 1, 1)
            .fill(0xFFFF00)
            .closePath();

        const extract = renderer.extract;

        const pixels = extract.pixels({ target: graphics, frame: new Rectangle(0, 0, 2, 2) }).pixels;
        const pixels00 = extract.pixels({ target: graphics, frame: new Rectangle(0, 0, 1, 1) }).pixels;
        const pixels10 = extract.pixels({ target: graphics, frame: new Rectangle(1, 0, 1, 1) }).pixels;
        const pixels01 = extract.pixels({ target: graphics, frame: new Rectangle(0, 1, 1, 1) }).pixels;
        const pixels11 = extract.pixels({ target: graphics, frame: new Rectangle(1, 1, 1, 1) }).pixels;

        expect(pixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 255, 255, 0, 255
        ]));
        expect(pixels00).toEqual(new Uint8ClampedArray([255, 0, 0, 255]));
        expect(pixels10).toEqual(new Uint8ClampedArray([0, 255, 0, 255]));
        expect(pixels01).toEqual(new Uint8ClampedArray([0, 0, 255, 255]));
        expect(pixels11).toEqual(new Uint8ClampedArray([255, 255, 0, 255]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract from multisampled render texture', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const extract = renderer.extract;
        const sprite = new Sprite(Texture.WHITE);

        const renderTexture = renderer.textureGenerator.generateTexture({
            target: sprite,
            textureSourceOptions: { antialias: true },
        });

        const pixels = extract.pixels(renderTexture).pixels;

        expect(pixels).toBeInstanceOf(Uint8ClampedArray);
        expect(pixels[0]).toBe(255);
        expect(pixels[1]).toBe(255);
        expect(pixels[2]).toBe(255);
        expect(pixels[3]).toBe(255);

        renderer.destroy();
        sprite.destroy();
    });

    it('should not throw an error if frame is empty', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const extract = renderer.extract;
        const emptyFrame = new Rectangle(0, 0, 0, 0);

        const graphics = new Graphics();

        graphics.context
            .beginPath()
            .rect(0, 0, 1, 1)
            .fill(0xFF00FF)
            .closePath();

        expect(() => extract.canvas({ target: graphics, frame: emptyFrame })).not.toThrow();
        await expect(extract.base64({ target: graphics, frame: emptyFrame })).toResolve();
        expect(() => extract.pixels({ target: graphics, frame: emptyFrame })).not.toThrow();
        await expect(extract.image({ target: graphics, frame: emptyFrame })).toResolve();

        const canvas = extract.canvas({ target: graphics, frame: emptyFrame });

        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(1);

        const pixels = extract.pixels({ target: graphics, frame: emptyFrame }).pixels;

        expect(pixels).toEqual(new Uint8ClampedArray([255, 0, 255, 255]));

        const image = extract.canvas({ target: graphics, frame: emptyFrame });

        expect(image.width).toBe(1);
        expect(image.height).toBe(1);

        graphics.destroy();
        renderer.destroy();
    });

    it('should convert image element to canvas resource and warn user', async () =>
    {
        const spy = jest.spyOn(console, 'warn');
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const sprite = new Sprite(Texture.WHITE);
        const image = await renderer.extract.image(sprite);
        const imageSource = new ImageSource({ resource: image });

        expect(imageSource.resource).toBeInstanceOf(HTMLCanvasElement);
        expect(spy)
            .toHaveBeenCalledWith(
                'PixiJS Warning: ',
                'ImageSource: Image element passed, converting to canvas. Use CanvasSource instead.'
            );
    });
});
