import { Cache } from '../../../src/assets/cache/Cache';
import { Loader } from '../../../src/assets/loader/Loader';
import { loadTxt } from '../../../src/assets/loader/parsers/loadTxt';
import { loadTextures } from '../../../src/assets/loader/parsers/textures/loadTextures';
import { Text } from '../../../src/scene/text/Text';
import { loadBitmapFont } from '../../../src/scene/text-bitmap/asset/loadBitmapFont';
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
        'bitmap',
        'html',
        'canvas',
    ])('should support %s font without page reference', async (renderMode) =>
    {
        const text = new Text({
            text: 'A',
            style: {
                fontFamily: fontNoPage.fontFamily,
            },
            renderMode: renderMode as any,
        });
        const width = Math.round(text.width);
        const height = Math.round(text.height);

        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
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

    it('should call update when style changes', async () =>
    {
        const text = new Text({
            text: '123ABCabc',
            renderMode: 'bitmap',
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
        const text = new Text({
            text: '123ABCabc',
            renderMode: 'bitmap',
            style: {
                fontFamily: font.fontFamily,
            }
        });

        const spy = jest.spyOn(text.view, 'onUpdate');

        text.text = 'foo';

        expect(spy).toHaveBeenCalled();
    });
});
