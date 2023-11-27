/* eslint-disable jest/no-done-callback */
/* eslint-disable no-debugger */
/* eslint-disable no-restricted-syntax */
import { Cache } from '../../../src/assets/cache/Cache';
import { Loader } from '../../../src/assets/loader/Loader';
import { loadTxt } from '../../../src/assets/loader/parsers/loadTxt';
import { loadTextures } from '../../../src/assets/loader/parsers/textures/loadTextures';
import { loadBitmapFont } from '../../../src/scene/text/bitmap/asset/loadBitmapFont';
import { BitmapFontManager } from '../../../src/scene/text/bitmap/BitmapFontManager';
import { Text } from '../../../src/scene/text/Text';
import { basePath } from '../../assets/basePath';
import { getRenderer } from '../../utils/getRenderer';

import type { BitmapFont } from '../../../src/scene/text/bitmap/BitmapFont';

describe('BitmapText', () =>
{
    let font: BitmapFont;
    let fontNoPage: BitmapFont;

    let loader: Loader;

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
        const renderer = await getRenderer();

        const text = new Text({
            text: 'ABCDEFG',
            style: {
                fontFamily: 'arial',
            },
            renderMode: 'bitmap',
        });

        renderer.render(text);

        expect(Cache.get('arial-bitmap').pages).toHaveLength(1);
    });

    it.each([
        { renderMode: 'bitmap', expectedWidth: 19, expectedHeight: 29 },
        { renderMode: 'html', expectedWidth: 19, expectedHeight: 53 },
        { renderMode: 'canvas', expectedWidth: 19, expectedHeight: 29 },
    ])('should support %s font without page reference', async (fontInfo) =>
    {
        const renderMode = fontInfo.renderMode as any;
        const expectedWidth = fontInfo.expectedWidth as number;
        const expectedHeight = fontInfo.expectedHeight as number;

        const text = new Text({
            text: 'A',
            style: {
                fontFamily: fontNoPage.fontFamily,
            },
            renderMode,
        });
        const width = Math.round(text.width);
        const height = Math.round(text.height);

        expect(width).toBe(expectedWidth);
        expect(height).toBe(expectedHeight);
    });

    it('should break line on space', async () =>
    {
        const renderer = await getRenderer();

        const bmpText = new Text({
            text: 'A B C D E F G H',
            style: {
                fontFamily: font.fontFamily,
                fontSize: 24,
                wordWrap: true,
            },
            renderMode: 'bitmap',
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
        const renderer = await getRenderer();
        const bmpText = new Text({
            text: 'ABCD zz DCBA',
            renderMode: 'bitmap',
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
        const renderer = await getRenderer();

        const text = new Text({
            text: undefined,
            renderMode: 'bitmap',
            style: {
                fontFamily: font.fontFamily,
            }
        });

        expect(() => renderer.render(text)).not.toThrow();
    });

    // note: INVESTIGATE not getting expected values
    // - fontSize in DynamicBitmapFont is "style.fontSize = this.baseMeasurementFontSize;"?
    // - fontSize does not come from font, it comes from default TextStyle values
    it.skip('should update fontSize when font is replaced if fontSize is undefined', () =>
    {
        const font = BitmapFontManager.install('testFont', { fontSize: 12 });
        // BitmapFont.from('testFont', {
        //     fontSize: 12,
        // });

        // const text = new BitmapText('123ABCabc', {
        //     fontName: 'testFont',
        // });
        const text = new Text({
            text: '123ABCabc',
            renderMode: 'bitmap',
            style: {
                fontFamily: 'testFont',
            }
        });

        expect(text.style.fontSize).toEqual(12); // <- getting 26

        // BitmapFont.from('testFont', {
        //     fontSize: 24,
        // }); // Replace the font

        // expect(text.fontSize).toEqual(24);
    });

    // note: need to sort out above test first
    // it('should not update fontSize when font is replaced if fontSize is defined', () =>
    // {
    //     BitmapFont.from('testFont', {
    //         fontSize: 12,
    //     });

    //     const text = new BitmapText('123ABCabc', {
    //         fontName: 'testFont',
    //         fontSize: 16,
    //     });

    //     expect(text.fontSize).toEqual(16);

    //     BitmapFont.from('testFont', {
    //         fontSize: 24,
    //     }); // Replace the font

    //     expect(text.fontSize).toEqual(16);
    // });

    // it('should unset dirty after updateText', async () =>
    // {
    //     const renderer = await getRenderer();
    //     const text = new Text({
    //         text: '123ABCabc',
    //         renderMode: 'bitmap',
    //         style: {
    //             fontFamily: font.fontFamily,
    //         }
    //     });

    //     expect(text.dirty).toBeTrue();

    //     text.updateText();

    //     expect(text.dirty).toBeFalse();

    //     text.dirty = true;

    //     text.updateText();

    //     expect(text.dirty).toBeFalse();
    // });
});
