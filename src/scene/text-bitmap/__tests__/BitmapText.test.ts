import { Text } from '../../text/Text';
import { loadBitmapFont } from '../asset/loadBitmapFont';
import { BitmapFontManager } from '../BitmapFontManager';
import { BitmapText } from '../BitmapText';
import '../../text/init';
import '../init';
import '../../graphics/init';
import { basePath, getWebGLRenderer } from '@test-utils';
import { Cache, Loader, loadTextures, loadTxt } from '~/assets';
import { cleanHash } from '~/utils';

import type { BitmapFont } from '../BitmapFont';

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

        expect(Cache.get('arial-bitmap').pages).toHaveLength(1);
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

    it('should use cache getBitmapTextLayout', async () =>
    {
        const renderer = await getWebGLRenderer();

        (BitmapText['_layoutHash'] as any) = {}; // rm old cache

        const text = new BitmapText({
            text: 'Hello Pixi!',
            style: {
                fontFamily: font.fontFamily,
            }
        });

        let count = 0;
        const fn = BitmapFontManager.getLayout;

        BitmapFontManager.getLayout = (...args) =>
        {
            ++count;

            return fn.apply(BitmapFontManager, args);
        };

        // test1: simple render
        renderer.render(text);
        expect(count).toEqual(1);

        // test2: first getBounds and next render
        text.text = 'What\'s the weather like today?';
        text.getBounds();
        renderer.render(text);
        expect(count).toEqual(2);

        // test3: getBounds, reset cache + renderer
        text.text = 'Oh, it rained recently';
        text.getBounds();
        text.getTextLayout();
        renderer.render(text);
        expect(count).toEqual(4);

        // test4: multiple render + getBounds
        text.text = 'It\'s okay, nature doesn\'t have bad weather!';
        renderer.render(text);
        text.getBounds();
        renderer.render(text);
        renderer.render(text);
        text.getBounds();
        expect(count).toEqual(5);

        // test5: _layoutHash count
        let hash = BitmapText['_layoutHash'];
        let hashCount = 0;

        for (const kind in hash)
        {
            expect(kind).toEqual(text.uid.toString());
            ++hashCount;
        }
        expect(hashCount).toEqual(1);

        // test5: clear _layoutHash
        text.destroy();
        (BitmapText['_layoutHash'] as any) = hash = cleanHash(hash); // demo RenderableGCSystem
        hashCount = 0;
        for (const _ in hash)
        {
            ++hashCount;
        }
        expect(hashCount).toEqual(0);

        BitmapFontManager.getLayout = fn;
    });
});
