import { HTMLText } from '../HTMLText';
import {
    getWebGLRenderer,
    getWebGPURenderer,
    itLocalOnly,
    loseAndRestoreContext,
    loseAndRestoreDevice,
    nextTick,
    waitForPendingHTMLText,
} from '@test-utils';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';

import type { Renderer } from '~/rendering/renderers/types';

// generates the textures one after the other, so each text reuses the pooled render data of the previous one
async function renderInSequence(renderer: Renderer, ...texts: HTMLText[]): Promise<void>
{
    for (const text of texts)
    {
        renderer.render(text);
        await waitForPendingHTMLText(text, renderer);
    }
}

function channelSum(pixels: Uint8ClampedArray, channel: number): number
{
    let sum = 0;

    for (let i = channel; i < pixels.length; i += 4) sum += pixels[i];

    return sum;
}

describe('HTMLText', () =>
{
    it('should create an HTMLText element', () =>
    {
        const text = new HTMLText({
            text: 'Hello World',
        });

        expect(text.text).toBe('Hello World');

        text.destroy();
    });

    it('should measure an HTMLText and not include padding in its bounds', () =>
    {
        const text = new HTMLText({
            text: 'Hello World',
            style: {
                padding: 100
            }
        });

        // using less than as im sure we will encounter variance on different computers!
        expect(text.width).toBeLessThan(135);
        expect(text.height).toBeLessThan(35);

        text.destroy();
    });

    it('should handle resolution changes after html text destruction', async () =>
    {
        const text = new HTMLText({ text: 'foo' });

        const renderer = await getWebGLRenderer();

        renderer.render(text);

        text.destroy();

        expect(() => { renderer.resolution = 3; }).not.toThrow();

        renderer.destroy();
    });

    describe('autoGenerateMipmaps', () =>
    {
        it('should accept autoGenerateMipmaps in constructor', () =>
        {
            const text = new HTMLText({ text: 'foo', autoGenerateMipmaps: true });

            expect(text.autoGenerateMipmaps).toBe(true);

            text.destroy();
        });

        it('should default to global TextureSource default when not provided', () =>
        {
            const text = new HTMLText({ text: 'foo' });

            expect(text.autoGenerateMipmaps).toBe(TextureSource.defaultOptions.autoGenerateMipmaps);

            text.destroy();
        });

        it('should create texture with mipmaps when autoGenerateMipmaps is true', async () =>
        {
            const text = new HTMLText({
                text: 'foo',
                autoGenerateMipmaps: true
            });

            const renderer = await getWebGLRenderer();
            const texture = await renderer.htmlText.getTexturePromise(text);

            expect(texture.source.autoGenerateMipmaps).toBe(true);

            text.destroy();
            renderer.destroy();
        });

        it('should create texture without mipmaps when autoGenerateMipmaps is false', async () =>
        {
            const text = new HTMLText({
                text: 'foo',
                autoGenerateMipmaps: false
            });

            const renderer = await getWebGLRenderer();
            const texture = await renderer.htmlText.getTexturePromise(text);

            expect(texture.source.autoGenerateMipmaps).toBe(false);

            text.destroy();
            renderer.destroy();
        });

        it('should respect global default when autoGenerateMipmaps is undefined', async () =>
        {
            const text = new HTMLText({ text: 'foo' });

            const renderer = await getWebGLRenderer();
            const texture = await renderer.htmlText.getTexturePromise(text);

            // Should use the global default (which is false by default)
            expect(texture.source.autoGenerateMipmaps).toBe(TextureSource.defaultOptions.autoGenerateMipmaps);

            text.destroy();
            renderer.destroy();
        });

        it('should respect global default when set to true', async () =>
        {
            // Save original value
            const originalValue = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Set global default to true
                TextureSource.defaultOptions.autoGenerateMipmaps = true;

                const text = new HTMLText({ text: 'foo' });
                const renderer = await getWebGLRenderer();
                const texture = await renderer.htmlText.getTexturePromise(text);

                // Should respect the global default
                expect(texture.source.autoGenerateMipmaps).toBe(true);

                text.destroy();
                renderer.destroy();
            }
            finally
            {
                // Restore original value
                TextureSource.defaultOptions.autoGenerateMipmaps = originalValue;
            }
        });

        it('should allow per-instance override of global default (true to false)', async () =>
        {
            // Save original value
            const originalValue = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Set global default to true
                TextureSource.defaultOptions.autoGenerateMipmaps = true;

                // But override to false for this instance
                const text = new HTMLText({ text: 'foo', autoGenerateMipmaps: false });
                const renderer = await getWebGLRenderer();
                const texture = await renderer.htmlText.getTexturePromise(text);

                // Should use the per-instance override
                expect(texture.source.autoGenerateMipmaps).toBe(false);

                text.destroy();
                renderer.destroy();
            }
            finally
            {
                // Restore original value
                TextureSource.defaultOptions.autoGenerateMipmaps = originalValue;
            }
        });

        it('should allow per-instance override of global default (false to true)', async () =>
        {
            // Save original value
            const originalValue = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Set global default to false
                TextureSource.defaultOptions.autoGenerateMipmaps = false;

                // But override to true for this instance
                const text = new HTMLText({ text: 'foo', autoGenerateMipmaps: true });
                const renderer = await getWebGLRenderer();
                const texture = await renderer.htmlText.getTexturePromise(text);

                // Should use the per-instance override
                expect(texture.source.autoGenerateMipmaps).toBe(true);

                text.destroy();
                renderer.destroy();
            }
            finally
            {
                // Restore original value
                TextureSource.defaultOptions.autoGenerateMipmaps = originalValue;
            }
        });
    });

    describe('word wrap width should not inflate text.width', () =>
    {
        it('should return actual content width for center-aligned HTMLText', () =>
        {
            const text = new HTMLText({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });

            expect(text.width).toBeLessThan(800);
            text.destroy();
        });

        it('should return same content width regardless of alignment for HTMLText', () =>
        {
            const center = new HTMLText({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });
            const left = new HTMLText({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'left' },
            });

            expect(center.width).toBeLessThan(800);
            expect(left.width).toBeLessThan(800);
            expect(center.width).toBeCloseTo(left.width, 0);

            center.destroy();
            left.destroy();
        });
    });

    describe('texture generation', () =>
    {
        it('should upload its texture before the pooled render data is reused by another HTMLText', async () =>
        {
            const renderer = await getWebGLRenderer({ width: 64, height: 64 });
            const red = new HTMLText({ text: 'A', style: { fontSize: 40, fill: 'red' } });
            const blue = new HTMLText({ text: 'B', style: { fontSize: 40, fill: 'blue' } });

            await renderInSequence(renderer, red, blue);

            const { pixels } = renderer.extract.pixels(red);

            expect(channelSum(pixels, 0)).toBeGreaterThan(0);
            expect(channelSum(pixels, 2)).toBe(0);

            red.destroy();
            blue.destroy();
            renderer.destroy();
        });

        it('should not error when destroyed while its texture is generating', async () =>
        {
            const renderer = await getWebGLRenderer();
            const text = new HTMLText({ text: 'foo' });
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

            renderer.render(text);

            const generating = waitForPendingHTMLText(text, renderer);

            text.destroy();
            await generating;
            await nextTick();

            expect(errorSpy).not.toHaveBeenCalled();

            errorSpy.mockRestore();
            renderer.destroy();
        });
    });

    describe('context loss', () =>
    {
        it('should keep its own content after the WebGL context is lost and restored', async () =>
        {
            const renderer = await getWebGLRenderer({ width: 64, height: 64 });
            const red = new HTMLText({ text: 'A', style: { fontSize: 40, fill: 'red' } });
            const blue = new HTMLText({ text: 'B', style: { fontSize: 40, fill: 'blue' } });

            await renderInSequence(renderer, red, blue);
            await loseAndRestoreContext(renderer);
            await renderInSequence(renderer, red);

            const { pixels } = renderer.extract.pixels(red);

            expect(channelSum(pixels, 0)).toBeGreaterThan(0);
            expect(channelSum(pixels, 2)).toBe(0);

            red.destroy();
            blue.destroy();
            renderer.destroy();
        });

        itLocalOnly('should keep its own content after the WebGPU device is lost', async () =>
        {
            const renderer = await getWebGPURenderer({ width: 64, height: 64 });
            const red = new HTMLText({ text: 'A', style: { fontSize: 40, fill: 'red' } });
            const blue = new HTMLText({ text: 'B', style: { fontSize: 40, fill: 'blue' } });

            await renderInSequence(renderer, red, blue);
            await loseAndRestoreDevice(renderer);
            await renderInSequence(renderer, red);

            const { pixels } = renderer.extract.pixels(red);

            expect(channelSum(pixels, 0)).toBeGreaterThan(0);
            expect(channelSum(pixels, 2)).toBe(0);

            red.destroy();
            blue.destroy();
            renderer.destroy();
        });
    });
});
