import { Text } from '../../text/Text';
import { loadBitmapFont } from '../asset/loadBitmapFont';
import { BitmapText } from '../BitmapText';
import '../../text/init';
import '../init';
import '../../graphics/init';
import { basePath, getWebGLRenderer } from '@test-utils';
import { Cache, Loader, loadTextures, loadTxt } from '~/assets';

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
});
