/* eslint-disable jest/no-done-callback */
/* eslint-disable no-debugger */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';
import { Cache } from '../../../src/assets/cache/Cache';
import { Loader } from '../../../src/assets/loader/Loader';
import { loadTxt } from '../../../src/assets/loader/parsers/loadTxt';
import { loadTextures } from '../../../src/assets/loader/parsers/textures/loadTextures';
import { ImageSource } from '../../../src/rendering/renderers/shared/texture/sources/ImageSource';
import { loadBitmapFont } from '../../../src/scene/text/bitmap/asset/loadBitmapFont';
import { BitmapFont } from '../../../src/scene/text/bitmap/BitmapFont';
import { BitmapFontManager } from '../../../src/scene/text/bitmap/BitmapFontManager';
import { Text } from '../../../src/scene/text/Text';
import { basePath } from '../../assets/basePath';
import { getRenderer } from '../../utils/getRenderer';

import type { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import type { Container } from '../../../src/scene/container/Container';

describe('BitmapText', () =>
{
    let resources: string;
    let fontXML: XMLDocument;
    let fontImage: HTMLImageElement;
    let font: BitmapFont;
    let font2: BitmapFont;
    let font2XML: XMLDocument;
    let texture: Texture;

    let loader: Loader;

    beforeAll(async (done) =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadTxt, loadTextures, loadBitmapFont);

        font = await loader.load<BitmapFont>(`${basePath}fonts/font.fnt`);
        font2 = await loader.load<BitmapFont>(`${basePath}fonts/font-no-page.fnt`);
        // font = await loader.load<BitmapFont>(`${basePath}fonts/font.png`);

        // debugger;

        done();
    });

    // eslint-disable-next-line jest/no-done-callback
    // beforeAll((done) =>
    // {
    //     fontXML = null;
    //     fontImage = null;
    //     font = null;

    //     debugger;

    //     const resolveURL = (url: string) => path.resolve(resources, url);
    //     const loadXML = (url: string) => new Promise<XMLDocument>((resolve) =>
    //         fs.readFile(resolveURL(url), 'utf8', (err, data) =>
    //         {
    //             expect(err).toBeNull();
    //             resolve((new window.DOMParser()).parseFromString(data, 'text/xml'));
    //         }));

    //     const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve) =>
    //     {
    //         const image = new Image();

    //         image.onload = () => resolve(image);
    //         image.src = resolveURL(url);
    //     });

    //     resources = path.join(__dirname, 'resources');
    //     void Promise.all([
    //         loadXML('font.fnt'),
    //         loadXML('font-no-page.fnt'),
    //         loadImage('font.png'),
    //     ]).then(([
    //         _fontXML,
    //         _font2XML,
    //         _fontImage,
    //     ]) =>
    //     {
    //         fontXML = _fontXML;
    //         font2XML = _font2XML;
    //         fontImage = _fontImage;
    //         done();
    //     });
    // });

    afterAll(() =>
    {
        BitmapFontManager.uninstall(font.font); // add this feature
        // BitmapFont.uninstall(font2.font);
        texture.destroy(true);
        texture = null;
        font = null;
        font2 = null;
    });

    // note: this just seems to be doing the same as the BitmapFont tests
    // it.only('should register fonts from preloaded images', () =>
    // {
    //     texture = new Texture(new ImageSource({ resource: fontImage }));
    //     debugger;
    //     font = BitmapFontManager.install(fontXML, texture);
    //     font2 = BitmapFontManager.install(font2XML, texture);
    //     expect(font).toBeInstanceOf(BitmapFont);
    //     expect(font2).toBeInstanceOf(BitmapFont);
    //     expect(BitmapFont.available[font.font]).toEqual(font);
    //     expect(BitmapFont.available[font2.font]).toEqual(font2);
    // });

    // it('should have correct children when modified', () =>
    // {
    //     BitmapFont.from('testFont', {
    //         fill: '#333333',
    //         fontSize: 4,
    //     });

    //     // const text = new BitmapText('ABCDEFG', {
    //     //     fontName: 'testFont',
    //     // });

    //     const text = new Text({
    //         text: 'ABCDEFG',
    //         renderMode: 'bitmap',
    //     });

    //     const listener = jest.spyOn(text, 'addChild');

    //     text.updateText();

    //     expect(listener.mock.calls).toHaveLength(1);
    //     expect(text.children.length).toEqual(1);

    //     text.updateText();

    //     expect(listener.mock.calls).toHaveLength(1);
    //     expect(text.children.length).toEqual(1);

    //     text.text = 'hiya';

    //     text.updateText();

    //     expect(listener.mock.calls).toHaveLength(1);
    //     expect(text.children.length).toEqual(1);
    // });

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

    it.only.each([
        { renderMode: 'bitmap', expectedWidth: 19, expectedHeight: 29 },
        { renderMode: 'html', expectedWidth: 19, expectedHeight: 51 }, // <-- why this height?
        { renderMode: 'canvas', expectedWidth: 19, expectedHeight: 29 },
    ])('should support %s font without page reference', async (fontInfo) =>
    {
        const renderMode = fontInfo.renderMode as any;
        const expectedWidth = fontInfo.expectedWidth as number;
        const expectedHeight = fontInfo.expectedHeight as number;
        const renderer = await getRenderer();

        const text = new Text({
            text: 'A',
            style: {
                fontFamily: font.fontFamily,
            },
            renderMode,
        });

        // renderer.render(text);

        expect(Math.round(text.width)).toBe(expectedWidth);
        expect(Math.round(text.height)).toBe(expectedHeight);
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

    // note: resolution? whats the settings.RESOLUTION? TextView sets null as default resolution if none passed
    // it('should set the text resolution to match the resolution setting when constructed time', () =>
    // {
    //     const text = new Text({
    //         text: 'foo',
    //         renderMode: 'bitmap',
    //         style: {
    //             fontFamily: font.fontFamily,
    //         }
    //     });

    //     expect(text.view.resolution).toEqual(settings.RESOLUTION);
    // });

    // it('should update the text resolution to match the renderer resolution when being rendered to screen', () =>
    // {
    //     const text = new BitmapText('foo', {
    //         fontName: font.font,
    //     });

    //     expect(text.resolution).toEqual(settings.RESOLUTION);

    //     const renderer = new Renderer({ resolution: 2 });

    //     expect(renderer.resolution).toEqual(2);

    //     renderer.render(text);

    //     expect(text.resolution).toEqual(renderer.resolution);

    //     renderer.destroy();
    // });

    // it('should use any manually set text resolution over the renderer resolution', () =>
    // {
    //     const text = new BitmapText('foo', {
    //         fontName: font.font,
    //     });

    //     text.resolution = 3;

    //     expect(text.resolution).toEqual(3);

    //     const renderer = new Renderer({ resolution: 2 });

    //     renderer.render(text);

    //     expect(text.resolution).toEqual(3);

    //     renderer.destroy();
    // });

    // note: not getting expected values
    it('should update fontSize when font is replaced if fontSize is undefined', () =>
    {
        BitmapFontManager.install('testFont', { fontSize: 12 });
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

    it('should not update fontSize when font is replaced if fontSize is defined', () =>
    {
        BitmapFont.from('testFont', {
            fontSize: 12,
        });

        const text = new BitmapText('123ABCabc', {
            fontName: 'testFont',
            fontSize: 16,
        });

        expect(text.fontSize).toEqual(16);

        BitmapFont.from('testFont', {
            fontSize: 24,
        }); // Replace the font

        expect(text.fontSize).toEqual(16);
    });

    it('should unset dirty after updateText', () =>
    {
        const text = new BitmapText('123ABCabc', {
            fontName: font.font,
        });

        expect(text.dirty).toBeTrue();

        text.updateText();

        expect(text.dirty).toBeFalse();

        text.dirty = true;

        text.updateText();

        expect(text.dirty).toBeFalse();
    });

    it('should support tinting', () =>
    {
        const text = new BitmapText('123ABCabc', {
            fontName: font.font,
        });

        text.tint = 'red';

        expect(text.tint).toEqual('red');

        text.updateText();

        text['_activePagesMeshData'].every((mesh) => mesh.mesh.tintValue === 0xff0000);

        text.destroy(true);
    });
});
