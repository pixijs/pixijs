import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { RenderTexture, Texture } from '@pixi/core';
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

    it('should throw error if renderer is destroyed', async () =>
    {
        const renderer = new CanvasRenderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract as CanvasExtract;

        renderer.destroy();

        expect(() => extract.canvas(sprite)).toThrow();
        await expect(extract.base64(sprite)).toReject();
        expect(() => extract.pixels(sprite)).toThrow();
        await expect(extract.image(sprite)).toReject();

        sprite.destroy();
    });

    it('should return promise if async', async () =>
    {
        const renderer = new CanvasRenderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract as CanvasExtract;

        const base64Promise1 = extract.base64(sprite);

        expect(base64Promise1).toBeInstanceOf(Promise);
        await expect(base64Promise1).toResolve();

        const canvasPromise1 = extract.canvas(sprite, undefined, true);

        expect(canvasPromise1).toBeInstanceOf(Promise);
        await expect(canvasPromise1).toResolve();

        const imagePromise1 = extract.image(sprite);

        expect(imagePromise1).toBeInstanceOf(Promise);
        await expect(imagePromise1).toResolve();

        const pixelsPromise1 = extract.pixels(sprite, undefined, true);

        expect(pixelsPromise1).toBeInstanceOf(Promise);
        await expect(pixelsPromise1).toResolve();

        renderer.destroy();

        const base64Promise2 = extract.base64(sprite);

        expect(base64Promise2).toBeInstanceOf(Promise);
        await expect(base64Promise2).toReject();

        const canvasPromise2 = extract.canvas(sprite, undefined, true);

        expect(canvasPromise2).toBeInstanceOf(Promise);
        await expect(canvasPromise2).toReject();

        const imagePromise2 = extract.image(sprite);

        expect(imagePromise2).toBeInstanceOf(Promise);
        await expect(imagePromise2).toReject();

        const pixelsPromise2 = extract.pixels(sprite, undefined, true);

        expect(pixelsPromise2).toBeInstanceOf(Promise);
        await expect(pixelsPromise2).toReject();

        sprite.destroy();
    });

    it('should extract base64 correctly', async () =>
    {
        const renderer = new CanvasRenderer({ width: 2, height: 2 });

        renderer.plugins.graphics = new CanvasGraphicsRenderer(renderer);

        const graphics = new Graphics()
            .beginFill(0xFF0000, 0.4)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00, 1.0)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF, 1.0)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00, 0.8)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const extract = renderer.extract;

        renderer.render(graphics);

        const base64 = await extract.base64(graphics);

        expect(base64).toStartWith('data:image/png;base64,');

        const imagePromise = new Promise<HTMLImageElement>((resolve, reject) =>
        {
            const image = document.createElement('img');

            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = base64;
        });

        await expect(imagePromise).toResolve();

        const image = await imagePromise;

        expect(image.naturalWidth).toBe(2);
        expect(image.naturalHeight).toBe(2);

        const canvas = document.createElement('canvas');

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext('2d');

        context?.drawImage(image, 0, 0);

        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 102, 0, 255, 0, 255,
            0, 0, 255, 255, 255, 255, 0, 204
        ]));

        graphics.destroy();
        renderer.destroy();
    });
});
