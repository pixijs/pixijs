import { Cache } from '../../../src/assets/cache/Cache';
import { Loader } from '../../../src/assets/loader/Loader';
import { loadTxt } from '../../../src/assets/loader/parsers/loadTxt';
import { loadTextures } from '../../../src/assets/loader/parsers/textures/loadTextures';
import { Text } from '../../../src/scene/text/Text';
import { loadBitmapFont } from '../../../src/scene/text-bitmap/asset/loadBitmapFont';
import { BitmapText } from '../../../src/scene/text-bitmap/BitmapText';
import { HTMLText } from '../../../src/scene/text-html/HTMLText';
import { basePath } from '../../assets/basePath';
import { getRenderer } from '../../utils/getRenderer';
import '../../../src/scene/text/init';
import '../../../src/scene/text-bitmap/init';
import '../../../src/scene/graphics/init';

import type { BitmapFont } from '../../../src/scene/text-bitmap/BitmapFont';

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
        const renderer = await getRenderer();

        const text = new BitmapText({
            text: 'ABCDEFG',
            style: {
                fontFamily: 'arial',
            },
        });

        renderer.render(text);

        expect(Cache.get('arial-bitmap').pages).toHaveLength(1);
    });

    it.each([
        BitmapText,
        HTMLText,
        Text,
    ])('should support %s font without page reference', async (TextClass) =>
    {
        const text = new TextClass({
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
        const renderer = await getRenderer();

        const bmpText = new BitmapText({
            text: 'A B C D E F G H',
            style: {
                fontFamily: font.fontFamily,
                fontSize: 24,
                wordWrap: true,
            },
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
        const renderer = await getRenderer();

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

        const spy = jest.spyOn(text.view, 'onUpdate');

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

        const spy = jest.spyOn(text.view, 'onUpdate');

        text.text = 'foo';

        expect(spy).toHaveBeenCalled();
    });
});
