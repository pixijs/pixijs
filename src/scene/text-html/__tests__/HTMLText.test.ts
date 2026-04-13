import { HTMLText } from '../HTMLText';
import { getWebGLRenderer } from '@test-utils';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';

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
});
