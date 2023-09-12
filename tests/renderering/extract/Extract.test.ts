import { ExtractSystem } from '../../../src/rendering/renderers/shared/ExtractSystem';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../../src/rendering/scene/Container';
import { getRenderer } from '../../utils/getRenderer';
import { getTexture } from '../../utils/getTexture';

import type { WebGLRenderer } from '../../../src/rendering/renderers/gl/WebGLRenderer';

describe('GenerateTexture', () =>
{
    describe('Container as source', () =>
    {
        it('should generate canvas from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const container = new Container();
            const canvas = renderer.extract.canvas(container);

            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        });

        it('should generate base64 from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const container = new Container();
            const base64 = await renderer.extract.base64(container);

            expect(typeof base64).toBe('string');
        });

        it('should generate image from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const container = new Container();
            const image = await renderer.extract.image(container);

            expect(image).toBeInstanceOf(HTMLImageElement);
        });

        it('should generate pixels from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const container = new Container();
            const pixels = renderer.extract.pixels(container);

            expect(pixels.pixels.length).toBeGreaterThan(0);
            expect(pixels.width).toBeGreaterThan(0);
            expect(pixels.height).toBeGreaterThan(0);
        });

        it('should generate texture from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const container = new Container();
            const texture = renderer.extract.texture(container);

            expect(texture).toBeInstanceOf(Texture);
        });
    });

    describe('Texture as source', () =>
    {
        it('should generate canvas from Texture', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const canvas = renderer.extract.canvas(renderTexture);

            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        });

        it('should generate base64 from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const base64 = await renderer.extract.base64(renderTexture);

            expect(typeof base64).toBe('string');
        });

        it('should generate image from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const image = await renderer.extract.image(renderTexture);

            expect(image).toBeInstanceOf(HTMLImageElement);
        });

        it('should generate pixels from Container', async () =>
        {
            const renderer = (await getRenderer()) as WebGLRenderer;
            const renderTexture = getTexture({ width: 10, height: 10 });
            const pixels = renderer.extract.pixels(renderTexture);

            expect(pixels.pixels.length).toBe(renderTexture.width * renderTexture.height * 4);
            expect(pixels.width).toBe(renderTexture.width);
            expect(pixels.height).toBe(renderTexture.height);
        });
    });

    it('should access extract on renderer', async () =>
    {
        const renderer = (await getRenderer()) as WebGLRenderer;

        expect(renderer.extract).toBeInstanceOf(ExtractSystem);

        renderer.destroy();
    });

    // it('should extract the same pixels', async () =>
    // {
    //     const renderer = (await getRenderer('webgl', { width: 2, height: 2 })) as WebGLRenderer;
    //     const graphics = new Graphics()
    //         .context.
    //         // .beginFill(0xFF0000)
    //         .drawRect(0, 0, 1, 1)
    //         .endFill()
    //         .beginFill(0x00FF00)
    //         .drawRect(1, 0, 1, 1)
    //         .endFill()
    //         .beginFill(0x0000FF)
    //         .drawRect(0, 1, 1, 1)
    //         .endFill()
    //         .beginFill(0xFFFF00)
    //         .drawRect(1, 1, 1, 1)
    //         .endFill();
    //     const expectedPixels = new Uint8Array([
    //         255, 0, 0, 255,
    //         0, 255, 0, 255,
    //         0, 0, 255, 255,
    //         255, 255, 0, 255
    //     ]);
    //     const renderTexture = renderer.generateTexture(graphics);
    //     const extract = renderer.extract;

    //     renderer.render(graphics);

    //     const pixelsRenderer = extract.pixels();
    //     const pixelsRenderTexture = extract.pixels(renderTexture);
    //     const pixelsGraphics = extract.pixels(graphics);

    //     expect(pixelsRenderer).toEqual(expectedPixels);
    //     expect(pixelsRenderTexture).toEqual(expectedPixels);
    //     expect(pixelsGraphics).toEqual(expectedPixels);

    //     renderTexture.destroy(true);
    //     graphics.destroy();
    //     renderer.destroy();
    // });

    // it('should extract pixels from renderer correctly', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2 });
    //     const texturePixels = new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 153,
    //         0, 0, 255, 102, 255, 255, 0, 51
    //     ]);
    //     const texture = Texture.fromBuffer(texturePixels, 2, 2, {
    //         width: 2,
    //         height: 2,
    //         format: FORMATS.RGBA,
    //         type: TYPES.UNSIGNED_BYTE,
    //         alphaMode: ALPHA_MODES.UNPACK
    //     });
    //     const sprite = new Sprite(texture);
    //     const extract = renderer.extract;

    //     renderer.render(sprite);

    //     const extractedPixels = extract.pixels();

    //     expect(extractedPixels).toEqual(new Uint8Array([
    //         255, 0, 0, 255, 0, 153, 0, 255,
    //         0, 0, 102, 255, 51, 51, 0, 255
    //     ]));

    //     texture.destroy(true);
    //     sprite.destroy();
    //     renderer.destroy();
    // });

    // it('should extract canvas from renderer correctly', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2 });
    //     const texturePixels = new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 153,
    //         0, 0, 255, 102, 255, 255, 0, 51
    //     ]);
    //     const texture = Texture.fromBuffer(texturePixels, 2, 2, {
    //         width: 2,
    //         height: 2,
    //         format: FORMATS.RGBA,
    //         type: TYPES.UNSIGNED_BYTE,
    //         alphaMode: ALPHA_MODES.UNPACK
    //     });
    //     const sprite = new Sprite(texture);
    //     const extract = renderer.extract;

    //     renderer.render(sprite);

    //     const canvas = extract.canvas();
    //     const context = canvas.getContext('2d');
    //     const imageData = context?.getImageData(0, 0, 2, 2);

    //     expect(imageData?.data).toEqual(new Uint8ClampedArray([
    //         255, 0, 0, 255, 0, 153, 0, 255,
    //         0, 0, 102, 255, 51, 51, 0, 255
    //     ]));

    //     texture.destroy(true);
    //     sprite.destroy();
    //     renderer.destroy();
    // });

    // it('should extract pixels from render texture correctly', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2 });
    //     const texturePixels = new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 153,
    //         0, 0, 255, 102, 255, 255, 0, 51
    //     ]);
    //     const texture = Texture.fromBuffer(texturePixels, 2, 2, {
    //         width: 2,
    //         height: 2,
    //         format: FORMATS.RGBA,
    //         type: TYPES.UNSIGNED_BYTE,
    //         alphaMode: ALPHA_MODES.UNPACK
    //     });
    //     const sprite = new Sprite(texture);
    //     const extract = renderer.extract;

    //     const extractedPixels = extract.pixels(sprite);

    //     expect(extractedPixels).toEqual(texturePixels);

    //     texture.destroy(true);
    //     sprite.destroy();
    //     renderer.destroy();
    // });

    // it('should extract canvas from render texture correctly', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2 });
    //     const texturePixels = new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 153,
    //         0, 0, 255, 102, 255, 255, 0, 51
    //     ]);
    //     const texture = Texture.fromBuffer(texturePixels, 2, 2, {
    //         width: 2,
    //         height: 2,
    //         format: FORMATS.RGBA,
    //         type: TYPES.UNSIGNED_BYTE,
    //         alphaMode: ALPHA_MODES.UNPACK
    //     });
    //     const sprite = new Sprite(texture);
    //     const extract = renderer.extract;

    //     const canvas = extract.canvas(sprite);
    //     const context = canvas.getContext('2d');
    //     const imageData = context?.getImageData(0, 0, 2, 2);

    //     expect(imageData?.data).toEqual(new Uint8ClampedArray(texturePixels.buffer));

    //     texture.destroy(true);
    //     sprite.destroy();
    //     renderer.destroy();
    // });

    // it('should extract pixels with resolution !== 1', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2, resolution: 2 });
    //     const texturePixels = new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 153,
    //         0, 0, 255, 102, 255, 255, 0, 51,
    //     ]);
    //     const texture = Texture.fromBuffer(texturePixels, 2, 2, {
    //         width: 2,
    //         height: 2,
    //         format: FORMATS.RGBA,
    //         type: TYPES.UNSIGNED_BYTE,
    //         alphaMode: ALPHA_MODES.UNPACK,
    //         scaleMode: SCALE_MODES.NEAREST,
    //     });
    //     const sprite = new Sprite(texture);

    //     renderer.render(sprite);

    //     const extractedPixels = renderer.extract.pixels();

    //     expect(extractedPixels).toEqual(new Uint8Array([
    //         255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
    //         255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
    //         0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
    //         0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
    //     ]));

    //     texture.destroy(true);
    //     sprite.destroy();
    //     renderer.destroy();
    // });

    // it('should extract canvas with resolution !== 1', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2, resolution: 2 });
    //     const texturePixels = new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 153,
    //         0, 0, 255, 102, 255, 255, 0, 51,
    //     ]);
    //     const texture = Texture.fromBuffer(texturePixels, 2, 2, {
    //         width: 2,
    //         height: 2,
    //         format: FORMATS.RGBA,
    //         type: TYPES.UNSIGNED_BYTE,
    //         alphaMode: ALPHA_MODES.UNPACK,
    //         scaleMode: SCALE_MODES.NEAREST,
    //     });
    //     const sprite = new Sprite(texture);

    //     renderer.render(sprite);

    //     const canvas = renderer.extract.canvas();

    //     expect(canvas.width).toEqual(4);
    //     expect(canvas.height).toEqual(4);

    //     const context = canvas.getContext('2d');
    //     const imageData = context?.getImageData(0, 0, 4, 4);

    //     expect(imageData?.data).toEqual(new Uint8ClampedArray([
    //         255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
    //         255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
    //         0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
    //         0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
    //     ]));

    //     texture.destroy(true);
    //     sprite.destroy();
    //     renderer.destroy();
    // });

    // it('should extract an sprite', async () =>
    // {
    //     const renderer = new Renderer();
    //     const sprite = new Sprite(Texture.WHITE);
    //     const extract = renderer.extract;

    //     expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
    //     expect(await extract.base64(sprite)).toBeString();
    //     expect(extract.pixels(sprite)).toBeInstanceOf(Uint8Array);
    //     expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

    //     renderer.destroy();
    //     sprite.destroy();
    // });

    // it('should extract with no arguments', async () =>
    // {
    //     const renderer = new Renderer();
    //     const extract = renderer.extract;

    //     expect(extract.canvas()).toBeInstanceOf(HTMLCanvasElement);
    //     expect(await extract.base64()).toBeString();
    //     expect(extract.pixels()).toBeInstanceOf(Uint8Array);
    //     expect(await extract.image()).toBeInstanceOf(HTMLImageElement);

    //     renderer.destroy();
    // });

    // it('should extract a render texture', async () =>
    // {
    //     const renderer = new Renderer();
    //     const extract = renderer.extract;
    //     const renderTexture = RenderTexture.create({ width: 10, height: 10 });
    //     const sprite = new Sprite(Texture.WHITE);
    //     const frame = new Rectangle(1, 2, 5, 6);

    //     renderer.render(sprite, { renderTexture });

    //     expect(extract.canvas(renderTexture)).toBeInstanceOf(HTMLCanvasElement);
    //     expect(await extract.base64(renderTexture)).toBeString();
    //     expect(extract.pixels(renderTexture, frame)).toBeInstanceOf(Uint8Array);
    //     expect(await extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

    //     renderer.destroy();
    //     renderTexture.destroy();
    //     sprite.destroy();
    // });

    // it('should extract with multisample', async () =>
    // {
    //     const renderer = new Renderer({ antialias: true });
    //     const extract = renderer.extract;
    //     const sprite = new Sprite(Texture.WHITE);

    //     expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
    //     expect(await extract.base64(sprite)).toBeString();
    //     expect(extract.pixels(sprite)).toBeInstanceOf(Uint8Array);
    //     expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

    //     renderer.destroy();
    //     sprite.destroy();
    // });

    // it('should extract from object with frame correctly', async () =>
    // {
    //     const renderer = new Renderer({ width: 2, height: 2 });
    //     const graphics = new Graphics()
    //         .beginFill(0xFF0000)
    //         .drawRect(0, 0, 1, 1)
    //         .endFill()
    //         .beginFill(0x00FF00)
    //         .drawRect(1, 0, 1, 1)
    //         .endFill()
    //         .beginFill(0x0000FF)
    //         .drawRect(0, 1, 1, 1)
    //         .endFill()
    //         .beginFill(0xFFFF00)
    //         .drawRect(1, 1, 1, 1)
    //         .endFill();
    //     const extract = renderer.extract;

    //     const pixels = extract.pixels(graphics, new Rectangle(0, 0, 2, 2));
    //     const pixels00 = extract.pixels(graphics, new Rectangle(0, 0, 1, 1));
    //     const pixels10 = extract.pixels(graphics, new Rectangle(1, 0, 1, 1));
    //     const pixels01 = extract.pixels(graphics, new Rectangle(0, 1, 1, 1));
    //     const pixels11 = extract.pixels(graphics, new Rectangle(1, 1, 1, 1));

    //     expect(pixels).toEqual(new Uint8Array([
    //         255, 0, 0, 255, 0, 255, 0, 255,
    //         0, 0, 255, 255, 255, 255, 0, 255
    //     ]));
    //     expect(pixels00).toEqual(new Uint8Array([255, 0, 0, 255]));
    //     expect(pixels10).toEqual(new Uint8Array([0, 255, 0, 255]));
    //     expect(pixels01).toEqual(new Uint8Array([0, 0, 255, 255]));
    //     expect(pixels11).toEqual(new Uint8Array([255, 255, 0, 255]));

    //     graphics.destroy();
    //     renderer.destroy();
    // });

    // it('should unpremultiply alpha correctly', () =>
    // {
    //     const pixels1 = new Uint8Array(4);
    //     const pixels2 = new Uint8ClampedArray(4);

    //     Extract['_unpremultiplyAlpha'](pixels1);
    //     Extract['_unpremultiplyAlpha'](pixels2);

    //     expect(pixels1[0]).toBe(0);
    //     expect(pixels1[1]).toBe(0);
    //     expect(pixels1[2]).toBe(0);
    //     expect(pixels1[3]).toBe(0);
    //     expect(pixels2[0]).toBe(0);
    //     expect(pixels2[1]).toBe(0);
    //     expect(pixels2[2]).toBe(0);
    //     expect(pixels2[3]).toBe(0);

    //     for (let alpha = 1; alpha < 256; alpha++)
    //     {
    //         for (let x = 0; x <= alpha; x++)
    //         {
    //             pixels1[0] = x;
    //             pixels1[1] = 0;
    //             pixels1[2] = 0;
    //             pixels1[3] = alpha;
    //             pixels2[0] = x;
    //             pixels2[1] = 0;
    //             pixels2[2] = 0;
    //             pixels2[3] = alpha;

    //             Extract['_unpremultiplyAlpha'](pixels1);
    //             Extract['_unpremultiplyAlpha'](pixels2);

    //             const y = Math.min(Math.max(Math.round((x * 255) / alpha), 0), 255);

    //             expect(pixels1[0]).toBe(y);
    //             expect(pixels1[1]).toBe(0);
    //             expect(pixels1[2]).toBe(0);
    //             expect(pixels1[3]).toBe(alpha);
    //             expect(pixels2[0]).toBe(y);
    //             expect(pixels2[1]).toBe(0);
    //             expect(pixels2[2]).toBe(0);
    //             expect(pixels2[3]).toBe(alpha);
    //         }
    //     }
    // });

    // it('should extract from multisampled render texture', async () =>
    // {
    //     const renderer = new Renderer();
    //     const extract = renderer.extract;
    //     const sprite = new Sprite(Texture.WHITE);
    //     const renderTexture = renderer.generateTexture(sprite, {
    //         multisample: MSAA_QUALITY.HIGH
    //     });

    //     // unbind renderTexture
    //     renderer.renderTexture.bind();

    //     const pixels = extract.pixels(renderTexture);

    //     expect(pixels).toBeInstanceOf(Uint8Array);
    //     expect(pixels[0]).toBe(255);
    //     expect(pixels[1]).toBe(255);
    //     expect(pixels[2]).toBe(255);
    //     expect(pixels[3]).toBe(255);

    //     renderer.destroy();
    //     sprite.destroy();
    // });

    // it('should not throw an error if frame is empty', async () =>
    // {
    //     const renderer = new Renderer();
    //     const extract = renderer.extract;
    //     const emptyFrame = new Rectangle(0, 0, 0, 0);

    //     const graphics = new Graphics()
    //         .beginFill(0xFF00FF)
    //         .drawRect(0, 0, 1, 1)
    //         .endFill();

    //     expect(() => extract.canvas(graphics, emptyFrame)).not.toThrow();
    //     await expect(extract.base64(graphics, undefined, undefined, emptyFrame)).toResolve();
    //     expect(() => extract.pixels(graphics, emptyFrame)).not.toThrow();
    //     await expect(extract.image(graphics, undefined, undefined, emptyFrame)).toResolve();

    //     const canvas = extract.canvas(graphics, emptyFrame);

    //     expect(canvas.width).toBe(1);
    //     expect(canvas.height).toBe(1);

    //     const pixels = extract.pixels(graphics, emptyFrame);

    //     expect(pixels).toEqual(new Uint8Array([255, 0, 255, 255]));

    //     const image = extract.canvas(graphics, emptyFrame);

    //     expect(image.width).toBe(1);
    //     expect(image.height).toBe(1);

    //     graphics.destroy();
    //     renderer.destroy();
    // });

    // it('should unpremultiply if premultiplied alpha', async () =>
    // {
    //     const renderer = new Renderer({
    //         width: 1,
    //         height: 1,
    //         backgroundColor: 0xFFFFFF,
    //         backgroundAlpha: 0.4,
    //         premultipliedAlpha: true
    //     });
    //     const extract = renderer.extract;

    //     expect(extract['_rendererPremultipliedAlpha']).toBe(true);

    //     const renderTexture = RenderTexture.create({
    //         width: 1,
    //         height: 1,
    //         alphaMode: ALPHA_MODES.PREMULTIPLIED_ALPHA
    //     });

    //     renderer.renderTexture.bind();
    //     renderer.renderTexture.clear([1.0, 1.0, 1.0, 0.4]);

    //     const rendererPixels = extract.pixels();

    //     expect(rendererPixels[0]).toBe(255);
    //     expect(rendererPixels[1]).toBe(255);
    //     expect(rendererPixels[2]).toBe(255);
    //     expect(rendererPixels[3]).toBe(102);

    //     renderer.renderTexture.bind(renderTexture);
    //     renderer.renderTexture.clear([1.0, 1.0, 1.0, 0.4]);

    //     const renderTexturePixels = extract.pixels(renderTexture);

    //     expect(renderTexturePixels[0]).toBe(255);
    //     expect(renderTexturePixels[1]).toBe(255);
    //     expect(renderTexturePixels[2]).toBe(255);
    //     expect(renderTexturePixels[3]).toBe(102);

    //     renderer.destroy();
    //     renderTexture.destroy();
    // });

    // it('should not unpremultiply if no premultiplied alpha', async () =>
    // {
    //     const renderer = new Renderer({
    //         width: 1,
    //         height: 1,
    //         backgroundColor: 0xCCCCCC,
    //         backgroundAlpha: 0.4,
    //         premultipliedAlpha: false
    //     });
    //     const extract = renderer.extract;

    //     expect(extract['_rendererPremultipliedAlpha']).toBe(false);

    //     const renderTexture = RenderTexture.create({
    //         width: 1,
    //         height: 1,
    //         alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
    //     });

    //     renderer.renderTexture.bind();
    //     renderer.renderTexture.clear([0.8, 0.8, 0.8, 0.4]);

    //     const rendererPixels = extract.pixels();

    //     expect(rendererPixels[0]).toBe(204);
    //     expect(rendererPixels[1]).toBe(204);
    //     expect(rendererPixels[2]).toBe(204);
    //     expect(rendererPixels[3]).toBe(102);

    //     renderer.renderTexture.bind(renderTexture);
    //     renderer.renderTexture.clear([0.8, 0.8, 0.8, 0.4]);

    //     const renderTexturePixels = extract.pixels(renderTexture);

    //     expect(renderTexturePixels[0]).toBe(204);
    //     expect(renderTexturePixels[1]).toBe(204);
    //     expect(renderTexturePixels[2]).toBe(204);
    //     expect(renderTexturePixels[3]).toBe(102);

    //     renderer.destroy();
    //     renderTexture.destroy();
    // });
});
