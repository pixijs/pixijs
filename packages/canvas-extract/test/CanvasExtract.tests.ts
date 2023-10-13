import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Rectangle, RenderTexture, Texture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
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

    it('should extract the same pixels', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const expectedPixels = new Uint8ClampedArray([
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255,
            255, 255, 0, 255
        ]);
        const renderTexture = renderer.generateTexture(graphics);
        const extract = renderer.extract;

        renderer.render(graphics);

        const pixelsRenderer = extract.pixels();
        const pixelsRenderTexture = extract.pixels(renderTexture);
        const pixelsGraphics = extract.pixels(graphics);

        expect(pixelsRenderer).toEqual(expectedPixels);
        expect(pixelsRenderTexture).toEqual(expectedPixels);
        expect(pixelsGraphics).toEqual(expectedPixels);

        renderTexture.destroy(true);
        graphics.destroy();
        renderer.destroy();
    });

    it('should extract pixels from renderer correctly', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const extractedPixels = extract.pixels();

        expect(extractedPixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 255, 255, 0, 255
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract canvas from renderer correctly', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const canvas = extract.canvas();
        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 255, 255, 0, 255
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract pixels from render texture correctly', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const extractedPixels = extract.pixels(graphics);

        expect(extractedPixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 255, 255, 0, 255
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract canvas from render texture correctly', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const canvas = extract.canvas(graphics);
        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 255, 255, 0, 255
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract pixels from renderer with resolution !== 1', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2, resolution: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const extractedPixels = extract.pixels();

        expect(extractedPixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract canvas from renderer with resolution !== 1', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2, resolution: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const canvas = extract.canvas();

        expect(canvas.width).toEqual(4);
        expect(canvas.height).toEqual(4);

        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 4, 4);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract pixels from render texture with resolution !== 1', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2, resolution: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const extractedPixels = extract.pixels(graphics);

        expect(extractedPixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should extract canvas from render texture with resolution !== 1', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2, resolution: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const canvas = extract.canvas(graphics);

        expect(canvas.width).toEqual(4);
        expect(canvas.height).toEqual(4);

        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 4, 4);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255,
        ]));

        graphics.destroy();
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

    it('should extract from object with frame correctly', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        const pixels = extract.pixels(graphics, new Rectangle(0, 0, 2, 2));
        const pixels00 = extract.pixels(graphics, new Rectangle(0, 0, 1, 1));
        const pixels10 = extract.pixels(graphics, new Rectangle(1, 0, 1, 1));
        const pixels01 = extract.pixels(graphics, new Rectangle(0, 1, 1, 1));
        const pixels11 = extract.pixels(graphics, new Rectangle(1, 1, 1, 1));

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

    it('should not throw an error if frame is empty', async () =>
    {
        const renderer = new CanvasRenderer();
        const extract = renderer.extract as CanvasExtract;
        const emptyFrame = new Rectangle(0, 0, 0, 0);

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF00FF)
            .drawRect(0, 0, 1, 1)
            .endFill();

        expect(() => extract.canvas(graphics, emptyFrame)).not.toThrow();
        await expect(extract.base64(graphics, undefined, undefined, emptyFrame)).toResolve();
        expect(() => extract.pixels(graphics, emptyFrame)).not.toThrow();
        await expect(extract.image(graphics, undefined, undefined, emptyFrame)).toResolve();

        const canvas = extract.canvas(graphics, emptyFrame);

        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(1);

        const pixels = extract.pixels(graphics, emptyFrame);

        expect(pixels).toEqual(new Uint8ClampedArray([255, 0, 255, 255]));

        const image = extract.canvas(graphics, emptyFrame);

        expect(image.width).toBe(1);
        expect(image.height).toBe(1);

        graphics.destroy();
        renderer.destroy();
    });
});
