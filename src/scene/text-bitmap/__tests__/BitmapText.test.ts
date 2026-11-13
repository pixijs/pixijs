import { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import { Text } from '../../text/Text';
import { TextStyle } from '../../text/TextStyle';
import { loadBitmapFont } from '../asset/loadBitmapFont';
import { type BitmapFont } from '../BitmapFont';
import { BitmapText } from '../BitmapText';
import { getBitmapTextLayout } from '../utils/getBitmapTextLayout';
import '../../text/init';
import '../init';
import '../../graphics/init';
import { basePath, getWebGLRenderer } from '@test-utils';
import { Cache, Loader, loadTextures, loadTxt } from '~/assets';
import { PrepareSystem } from '~/prepare';

import type { Graphics } from '../../graphics/shared/Graphics';
import type { WebGLRenderer } from '~/rendering';

describe('BitmapText', () =>
{
    let font: BitmapFont;
    let fontNoPage: BitmapFont;

    let loader: Loader;

    // eslint-disable-next-line jest/no-done-callback
    beforeAll(async (done) =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadTxt, loadTextures, loadBitmapFont);

        font = await loader.load<BitmapFont>(`${basePath}fonts/font.fnt`);
        fontNoPage = await loader.load<BitmapFont>(`${basePath}fonts/font-no-page.fnt`);

        done();
    });

    it('should render text even if there are unsupported characters', async () =>
    {
        const renderer = await getWebGLRenderer();

        const text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                fontFamily: 'arial',
            }
        });

        renderer.render(text);

        expect(Cache.get('arial-bitmap-normal-normal-normal').pages).toHaveLength(1);
    });

    it('should default to white fill', async () =>
    {
        let text = new BitmapText({
            text: 'ABCDEFG',
        });

        expect(text.style.fill).toEqual(0xffffff);

        text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                fill: 0xff0000,
            }
        });

        expect(text.style.fill).toEqual(0xff0000);

        text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                dropShadow: true,
            }
        });

        expect(text.style.fill).toEqual(0xffffff);
    });

    it('should apply dropShadow defaults correctly', async () =>
    {
        let text = new BitmapText({
            text: 'ABCDEFG'
        });

        expect(text.style.dropShadow).toEqual(null);

        text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                dropShadow: {
                    color: 'blue',
                }
            }
        });

        expect(text.style.dropShadow).toMatchObject({
            alpha: 1,
            angle: Math.PI / 6,
            blur: 0,
            color: 'blue',
            distance: 5,
        });

        text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                dropShadow: true
            }
        });

        expect(text.style.dropShadow).toMatchObject({
            alpha: 1,
            angle: Math.PI / 6,
            blur: 0,
            color: 'black',
            distance: 5,
        });

        text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                dropShadow: false
            }
        });

        expect(text.style.dropShadow).toEqual(null);
    });

    it('should support %s font without page reference', async () =>
    {
        const text = new BitmapText({
            text: 'A',
            style: {
                fontFamily: fontNoPage.fontFamily,
            },
        });
        const width = Math.round(text.width);
        const height = Math.round(text.height);

        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
    });

    it('should break line on space', async () =>
    {
        const renderer = await getWebGLRenderer();

        const bmpText = new Text({
            text: 'A B C D E F G H',
            style: {
                fontFamily: font.fontFamily,
                fontSize: 24,
                wordWrap: true,
            }
        });

        renderer.render(bmpText);

        const width = bmpText.width;

        bmpText.style.wordWrapWidth = width;
        bmpText.text = 'A B C D E F G H F G';

        renderer.render(bmpText);

        expect(bmpText.width).toBeLessThanOrEqual(bmpText.style.wordWrapWidth);
    });

    it('letterSpacing should add extra space between characters', async () =>
    {
        const renderer = await getWebGLRenderer();
        const bmpText = new BitmapText({
            text: 'ABCD zz DCBA',
            style: {
                fontFamily: font.fontFamily,
            }
        });

        renderer.render(bmpText);

        const width = bmpText.width;

        bmpText.style.letterSpacing = 10;

        renderer.render(bmpText);

        expect(bmpText.width).toBeGreaterThan(width);
    });

    it('should not crash if text is undefined', async () =>
    {
        const renderer = await getWebGLRenderer();

        const text = new BitmapText({
            text: undefined,
            style: {
                fontFamily: font.fontFamily,
            }
        });

        expect(() => renderer.render(text)).not.toThrow();
    });

    it('should call update when style changes', async () =>
    {
        const text = new BitmapText({
            text: '123ABCabc',
            style: {
                fontFamily: 'courier',
            }
        });

        const spy = jest.spyOn(text, 'onViewUpdate');

        // force style re-assignment otherwise mock won't work (binding is in constructor)
        text.style = {
            fontFamily: 'arial',
        };

        text.style.fontSize = 20;

        expect(spy).toHaveBeenCalled();
    });

    it('should call update when text changes', async () =>
    {
        const text = new BitmapText({
            text: '123ABCabc',
            style: {
                fontFamily: font.fontFamily,
            }
        });

        const spy = jest.spyOn(text, 'onViewUpdate');

        text.text = 'foo';

        expect(spy).toHaveBeenCalled();
    });

    it('should measure bounds of Bitmap text correctly when padding is set', () =>
    {
        const textNoPadding = new BitmapText({ text: 'HI', style: { padding: 0 } });
        const text = new BitmapText({ text: 'HI', style: { padding: 10 } });

        const boundsNoPadding = textNoPadding.getBounds();
        const bounds = text.getBounds();

        expect(boundsNoPadding.width).toBe(bounds.width);
        expect(boundsNoPadding.height).toBe(bounds.height);
    });

    it('should have correct bounds when using custom lineHeight', async () =>
    {
        const refText = new Text({
            text: 'Lorem ipsum\nHello\nHello',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                lineHeight: 200,
            },
        });

        const bmpText = new BitmapText({
            text: 'Lorem ipsum\nHello\nHello',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                lineHeight: 200,
            },
        });

        expect(bmpText.width).toBe(refText.width);
        expect(bmpText.height).toBe(refText.height);
    });

    it('should not crash when text contains characters missing from the font', () =>
    {
        // Font that only has 'A' and 'B', no space character
        const mockFont = {
            chars: {
                A: { id: 65, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                B: { id: 66, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
            },
            baseMeasurementFontSize: 32,
            baseLineOffset: 0,
            lineHeight: 40,
        };

        const style = new TextStyle({ fontSize: 32 });

        // Text with missing characters (space and 'Z') — should not throw
        expect(() =>
            getBitmapTextLayout(['A', ' ', 'Z', 'B'], style, mockFont as any, false)
        ).not.toThrow();
    });

    it('should keep chars and charPositions in sync when a glyph-less word-break char is present', () =>
    {
        // Font has A/B/C/D plus regular space, but no NBSP (U+00A0) glyph
        const mockFont = {
            chars: {
                A: { id: 65, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                B: { id: 66, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                C: { id: 67, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                D: { id: 68, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                ' ': { id: 32, xOffset: 0, yOffset: 0, xAdvance: 10, kerning: {} },
            },
            baseMeasurementFontSize: 32,
            baseLineOffset: 0,
            lineHeight: 40,
        };

        const layout = getBitmapTextLayout(
            ['A', 'B', 'C', ' ', 'D'],
            new TextStyle({ fontSize: 32 }),
            mockFont as any,
            false,
        );

        const line = layout.lines[0];

        expect(line.chars).toEqual(['A', 'B', 'C', 'D']);
        expect(line.chars.length).toBe(line.charPositions.length);
    });

    it('should render trailing glyph after a glyph-less word-break char to the right of the previous glyph', () =>
    {
        const mockFont = {
            chars: {
                A: { id: 65, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                B: { id: 66, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                C: { id: 67, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                D: { id: 68, xOffset: 0, yOffset: 0, xAdvance: 20, kerning: {} },
                ' ': { id: 32, xOffset: 0, yOffset: 0, xAdvance: 10, kerning: {} },
            },
            baseMeasurementFontSize: 32,
            baseLineOffset: 0,
            lineHeight: 40,
        };

        const layout = getBitmapTextLayout(
            ['A', 'B', 'C', ' ', 'D'],
            new TextStyle({ fontSize: 32 }),
            mockFont as any,
            false,
        );

        const positions = layout.lines[0].charPositions;

        // trailing 'D' must sit beyond 'C', not snap back to x=0
        expect(positions[3]).toBeGreaterThan(positions[2]);
    });

    describe('geometry initialization', () =>
    {
        let renderer: WebGLRenderer;
        let text: BitmapText;
        let clearSpy: jest.SpyInstance;
        let prepare: PrepareSystem;

        beforeEach(async () =>
        {
            renderer = await getWebGLRenderer();
            text = new BitmapText({ text: 'AB', style: { fontFamily: font.fontFamily, fontSize: 24 } });
            clearSpy = jest.spyOn(GraphicsContext.prototype, 'clear');
        });

        afterEach(() =>
        {
            clearSpy.mockRestore();
            prepare?.destroy();
            prepare = null;
            text.destroy({ style: true });
            renderer.destroy();
        });

        function geometryBuilds(forRenderer = renderer): number
        {
            const graphics = text._gpuData[forRenderer.uid] as Graphics;

            return clearSpy.mock.instances.filter((context) => context === graphics.context).length;
        }

        it('should build geometry once on the first render', () =>
        {
            renderer.render(text);

            expect(geometryBuilds()).toBe(1);
        });

        it('should reuse geometry initialized during validation', () =>
        {
            renderer.renderPipes.bitmapText.validateRenderable(text);
            renderer.render(text);

            expect(geometryBuilds()).toBe(1);
        });

        it('should reuse geometry uploaded by prepare', async () =>
        {
            prepare = new PrepareSystem(renderer);
            await prepare.upload(text);
            renderer.render(text);

            expect(geometryBuilds()).toBe(1);
        });

        it.each(['text', 'style', 'anchor'])('should rebuild when %s changes after initialization', (property) =>
        {
            renderer.renderPipes.bitmapText.initGpuText(text);

            if (property === 'text') text.text = 'ABCD';
            else if (property === 'style') text.style.fontSize = 36;
            else text.anchor.set(0.5);

            renderer.render(text);

            expect(geometryBuilds()).toBe(2);

            const reference = new BitmapText({ text: text.text, style: text.style.clone(), anchor: text.anchor });

            try
            {
                expect(renderer.extract.pixels(text)).toEqual(renderer.extract.pixels(reference));
            }
            finally
            {
                reference.destroy({ style: true });
            }
        });

        it('should rebuild edited text after the first render', () =>
        {
            renderer.render(text);
            clearSpy.mockClear();
            text.text = 'ABCD';
            renderer.render(text);

            expect(geometryBuilds()).toBe(1);
        });

        it('should preserve another renderer\'s pending text update during initialization', async () =>
        {
            const other = await getWebGLRenderer();

            try
            {
                renderer.render(text);
                clearSpy.mockClear();
                text.text = 'ABCD';
                other.renderPipes.bitmapText.initGpuText(text);

                expect(text._didTextUpdate).toBe(true);

                renderer.render(text);

                expect(geometryBuilds()).toBe(1);
                expect(geometryBuilds(other)).toBe(1);
            }
            finally
            {
                other.destroy();
            }
        });

        it('should rebuild unloaded text once', () =>
        {
            renderer.render(text);
            text.unload();
            renderer.render(text);

            expect(geometryBuilds()).toBe(1);
        });

        it('should build non-batched SDF geometry once', async () =>
        {
            const sdfFont = await loader.load<BitmapFont>(`${basePath}fonts/msdf.fnt`);

            Cache.set(`${sdfFont.fontFamily}-bitmap`, sdfFont);

            try
            {
                text.style.fontFamily = sdfFont.fontFamily;
                renderer.render(text);

                const graphics = text._gpuData[renderer.uid] as Graphics;

                expect(graphics.context.customShader).toBeTruthy();
                expect(geometryBuilds()).toBe(1);
            }
            finally
            {
                Cache.remove(`${sdfFont.fontFamily}-bitmap`);
            }
        });
    });
});
