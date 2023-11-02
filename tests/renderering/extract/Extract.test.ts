import { Rectangle } from '../../../src/maths/shapes/Rectangle';
import { ExtractSystem } from '../../../src/rendering/renderers/shared/extract/ExtractSystem';
import { RenderTexture } from '../../../src/rendering/renderers/shared/texture/RenderTexture';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../../src/scene/container/Container';
import { Graphics } from '../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../src/scene/sprite/Sprite';
import { getRenderer } from '../../utils/getRenderer';
import { getTexture } from '../../utils/getTexture';
import '../../../src/rendering/init';

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

    it('should extract the same pixels', async () =>
    {
        const renderer = (await getRenderer({ width: 2, height: 2 })) as WebGLRenderer;

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
        const renderer = (await getRenderer({ width: 2, height: 2 })) as WebGLRenderer;
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
        const renderer = (await getRenderer({ width: 2, height: 2 })) as WebGLRenderer;

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
        const renderer = (await getRenderer({ width: 2, height: 2 })) as WebGLRenderer;

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
        const renderer = (await getRenderer({ width: 2, height: 2 })) as WebGLRenderer;
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
        const renderer = (await getRenderer({ width: 2, height: 2, resolution: 2 })) as WebGLRenderer;
        const texturePixels = new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51,
        ]);
        const texture = Texture.from({
            resource: texturePixels,
            width: 2,
            height: 2,
            scaleMode: 'nearest',
        });

        const sprite = new Sprite(texture);
        const extractedPixels = renderer.extract.pixels(sprite).pixels;

        expect(extractedPixels).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 191, 64, 0, 229, 64, 191, 0, 178, 0, 255, 0, 153,
            191, 0, 64, 217, 159, 64, 48, 194, 96, 191, 16, 150, 64, 255, 0, 128,
            64, 0, 191, 140, 96, 64, 143, 124, 159, 191, 48, 92, 191, 255, 0, 76,
            0, 0, 255, 102, 64, 64, 191, 89, 191, 191, 64, 64, 255, 255, 0, 51
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    // todo: Mat to investigate - returning different result on CI to Local
    // ticket: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=43551238
    it.skip('should extract canvas with resolution !== 1', async () =>
    {
        const renderer = (await getRenderer({ width: 2, height: 2, resolution: 2 })) as WebGLRenderer;
        const texturePixels = new Uint8ClampedArray([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51,
        ]);
        const texture = Texture.from({
            resource: texturePixels,
            width: 2,
            height: 2,
            scaleMode: 'nearest',
        });

        const sprite = new Sprite(texture);
        const canvas = renderer.extract.canvas(sprite);

        expect(canvas.width).toEqual(4);
        expect(canvas.height).toEqual(4);

        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 4, 4);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 192, 63, 0, 229, 64, 191, 0, 178, 0, 255, 0, 153,
            192, 0, 63, 217, 159, 64, 49, 194, 95, 190, 15, 150, 64, 255, 0, 128,
            64, 0, 191, 140, 97, 64, 144, 124, 158, 191, 47, 92, 191, 255, 0, 76,
            0, 0, 255, 102, 63, 63, 192, 89, 191, 191, 64, 64, 255, 255, 0, 51
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract an sprite', async () =>
    {
        const renderer = (await getRenderer()) as WebGLRenderer;
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
        const renderer = (await getRenderer()) as WebGLRenderer;
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
        const renderer = (await getRenderer({ antialias: true })) as WebGLRenderer;
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
        const renderer = (await getRenderer()) as WebGLRenderer;
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

    // todo: Mat to investigate - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=43551238
    // it('should unpremultiply alpha correctly', () =>
    // {
    //     const pixels1 = new Uint8Array(4);
    //     const pixels2 = new Uint8ClampedArray(4);

    //     Extract['_unpremultiplyAlpha'](pixels1); // <-- this isn't a thing now?
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

    it('should extract from multisampled render texture', async () =>
    {
        const renderer = (await getRenderer()) as WebGLRenderer;
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
        const renderer = (await getRenderer()) as WebGLRenderer;
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

    // todo: Mat to investigate - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=43551238
    // it('should unpremultiply if premultiplied alpha', async () =>
    // {
    //     const renderer = (await getRenderer({
    //         width: 1,
    //         height: 1,
    //         backgroundColor: 0xCCCCCC,
    //         backgroundAlpha: 0.4,
    //         premultipliedAlpha: true
    //     })) as WebGLRenderer;
    //     const extract = renderer.extract;

    //     expect(extract['_rendererPremultipliedAlpha']).toBe(true); // <-- checking private vars? hmmm...

    //     const renderTexture = RenderTexture.create({
    //         width: 1,
    //         height: 1,
    //         alphaMode: 'premultiply-alpha-on-upload',
    //     });

    //     renderer.renderTexture.bind(); // <-- whats the purpose? Is this now GenerateTextureSystem?
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

    // it.skip('should not unpremultiply if no premultiplied alpha', async () =>
    // {
    //     const renderer = (await getRenderer({
    //         width: 1,
    //         height: 1,
    //         backgroundColor: 0xCCCCCC,
    //         backgroundAlpha: 0.4,
    //         premultipliedAlpha: false
    //     })) as WebGLRenderer;
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
