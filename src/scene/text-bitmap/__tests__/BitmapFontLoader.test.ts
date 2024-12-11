import { Sprite } from '../../sprite/Sprite';
import { loadBitmapFont } from '../asset/loadBitmapFont';
import { BitmapFont } from '../BitmapFont';
import { basePath, getWebGLRenderer } from '@test-utils';
import { Cache, Loader, loadTextures, loadTxt } from '~/assets';

import type { Texture } from '~/rendering';

describe('BitmapFontLoader', () =>
{
    let loader: Loader;

    beforeAll(async () =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadTxt, loadTextures, loadBitmapFont);
    });

    beforeEach(() =>
    {
        Cache.reset();
        loader.reset();
    });

    it('should do nothing if the resource is not XML/TXT font data', async () =>
    {
        expect(loadBitmapFont.test('notAFont.png')).toBe(false);
        expect(await loadBitmapFont.testParse('notAFont.png')).toBe(false);
    });

    it('should do nothing if the resource is not properly formatted', async () =>
    {
        expect(await loadBitmapFont.testParse(
            '<?xml version="1.0"?><!DOCTYPE WISHES<!ELEMENT WISHES (to, from)><Wishes >Have a good day!!</WISHES >'
        )).toBe(false);
        expect(await loadBitmapFont.testParse(
            'abcdefg'
        )).toBe(false);
    });

    it('should properly register bitmap font', async () =>
    {
        const url = `${basePath}fonts/font.fnt`;
        const font = await loader.load<BitmapFont>(url);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');

        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        expect(charA).toBeDefined();
        expect(charATexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);

        const charB = font.chars['B'];
        const charBTexture = charB.texture as Texture;

        expect(charB).toBeDefined();
        expect(charBTexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);

        const charC = font.chars['C'];
        const charCTexture = charC.texture as Texture;

        expect(charC).toBeDefined();
        expect(charCTexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charCTexture.frame.x).toEqual(23);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'];
        const charDTexture = charD.texture as Texture;

        expect(charD).toBeDefined();
        expect(charDTexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charDTexture.frame.x).toEqual(19);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'];

        expect(charE).toBeUndefined();
    });

    it('should properly register bitmap font based on txt data', async () =>
    {
        const font = await loader.load<BitmapFont>(`${basePath}fonts/bmtxt-test.txt`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');

        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        expect(charA).toBeDefined();
        expect(charATexture.source.label).toEqual(`${basePath}fonts/bmGlyph-test.png`);
        expect(charATexture.frame.x).toEqual(1);
        expect(charATexture.frame.y).toEqual(179);
        expect(charATexture.frame.width).toEqual(38);
        expect(charATexture.frame.height).toEqual(28);

        const charB = font.chars['B'];
        const charBTexture = charB.texture as Texture;

        expect(charB).toBeDefined();
        expect(charBTexture.source.label).toEqual(`${basePath}fonts/bmGlyph-test.png`);
        expect(charBTexture.frame.x).toEqual(52);
        expect(charBTexture.frame.y).toEqual(146);
        expect(charBTexture.frame.width).toEqual(34);
        expect(charBTexture.frame.height).toEqual(28);
        const charC = font.chars['C'];
        const charCTexture = charC.texture as Texture;

        expect(charC).toBeDefined();
        expect(charCTexture.source.label).toEqual(`${basePath}fonts/bmGlyph-test.png`);
        expect(charCTexture.frame.x).toEqual(52);
        expect(charCTexture.frame.y).toEqual(117);
        expect(charCTexture.frame.width).toEqual(34);
        expect(charCTexture.frame.height).toEqual(28);
        const charD = font.chars['D'];
        const charDTexture = charD.texture as Texture;

        expect(charD).toBeDefined();
        expect(charDTexture.source.label).toEqual(`${basePath}fonts/bmGlyph-test.png`);
        expect(charDTexture.frame.x).toEqual(52);
        expect(charDTexture.frame.y).toEqual(88);
        expect(charDTexture.frame.width).toEqual(34);
        expect(charDTexture.frame.height).toEqual(28);
        const charUndefined = font.chars['£'];

        expect(charUndefined).toBeUndefined();
    });

    it('should properly register bitmap font based on text format', async () =>
    {
        const font = await loader.load<BitmapFont>(`${basePath}fonts/font-text.fnt`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        expect(charA).toBeDefined();
        expect(charATexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'];
        const charBTexture = charB.texture as Texture;

        expect(charB).toBeDefined();
        expect(charBTexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'];
        const charCTexture = charC.texture as Texture;

        expect(charC).toBeDefined();
        expect(charCTexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charCTexture.frame.x).toEqual(23);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'];
        const charDTexture = charD.texture as Texture;

        expect(charD).toBeDefined();
        expect(charDTexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charDTexture.frame.x).toEqual(19);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'];

        expect(charE).toBeUndefined();
    });

    it('should properly register bitmap font with url params', async () =>
    {
        const font = await loader.load<BitmapFont>(`${basePath}fonts/font-text.fnt?version=1.0.0`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        expect(charA).toBeDefined();
        expect(charATexture.source.label).toEqual(`${basePath}fonts/font.png?version=1.0.0`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
    });

    // note: expected values are twice the actual size, is scaling being applied?
    // ticket: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=45749982
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should properly register SCALED bitmap font', async () =>
    {
        const renderer = await getWebGLRenderer();
        const font = await loader.load<BitmapFont>(`${basePath}fonts/font@0.5x.fnt`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');

        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        const sprite = new Sprite(charATexture);

        renderer.extract.log(sprite);

        expect(charA).toBeDefined();
        expect(charATexture.source.label).toEqual(`${basePath}fonts/font@0.5x.png`);
        expect(charATexture.frame.x).toEqual(4); // 2 / 0.5
        expect(charATexture.frame.y).toEqual(4); // 2 / 0.5
        expect(charATexture.frame.width).toEqual(38); // 19 / 0.5
        expect(charATexture.frame.height).toEqual(40); // 20 / 0.5

        const charB = font.chars['B'];
        const charBTexture = charB.texture as Texture;

        expect(charB).toBeDefined();
        expect(charBTexture.source.label).toEqual(`${basePath}fonts/font@0.5x.png`);
        expect(charBTexture.frame.x).toEqual(4); // 2 / 0.5
        expect(charBTexture.frame.y).toEqual(48); // 24 / 0.5
        expect(charBTexture.frame.width).toEqual(30); // 15 / 0.5
        expect(charBTexture.frame.height).toEqual(40); // 20 / 0.5

        const charC = font.chars['C'];
        const charCTexture = charC.texture as Texture;

        expect(charC).toBeDefined();
        expect(charCTexture.source.label).toEqual(`${basePath}fonts/font@0.5x.png`);
        expect(charCTexture.frame.x).toEqual(46); // 23 / 0.5
        expect(charCTexture.frame.y).toEqual(4); // 2 / 0.5
        expect(charCTexture.frame.width).toEqual(36); // 18 / 0.5
        expect(charCTexture.frame.height).toEqual(40); // 20 / 0.5

        const charD = font.chars['D'];
        const charDTexture = charD.texture as Texture;

        expect(charD).toBeDefined();
        expect(charDTexture.source.label).toEqual(`${basePath}fonts/font@0.5x.png`);
        expect(charDTexture.frame.x).toEqual(38); // 19 / 0.5
        expect(charDTexture.frame.y).toEqual(48); // 24 / 0.5
        expect(charDTexture.frame.width).toEqual(34); // 17 / 0.5
        expect(charDTexture.frame.height).toEqual(40); // 20 / 0.5
        const charE = font.chars['E'];

        expect(charE).toBeUndefined();
    });

    it('should properly register bitmap font having more than one texture', async () =>
    {
        const font = await loader.load<BitmapFont>(`${basePath}fonts/split_font.fnt`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        expect(charA).toBeDefined();
        let src = charATexture.source.label;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_ab.png');
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'];
        const charBTexture = charB.texture as Texture;

        expect(charB).toBeDefined();
        src = charBTexture.source.label;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_ab.png');
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'];
        const charCTexture = charC.texture as Texture;

        expect(charC).toBeDefined();
        src = charCTexture.source.label;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_cd.png');
        expect(charCTexture.frame.x).toEqual(2);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'];
        const charDTexture = charD.texture as Texture;

        expect(charD).toBeDefined();
        src = charDTexture.source.label;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_cd.png');
        expect(charDTexture.frame.x).toEqual(2);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'];

        expect(charE).toBeUndefined();
    });

    it('should split fonts if page IDs are in chronological order', async () =>
    {
        const font = await loader.load<BitmapFont>(`${basePath}fonts/split_font2.fnt`);

        const charA = font.chars['A'];
        const charC = font.chars['C'];
        const charATexture = charA.texture as Texture;
        const charCTexture = charC.texture as Texture;

        expect(charATexture.source.label).toEqual(`${basePath}fonts/split_font_cd.png`);
        expect(charCTexture.source.label).toEqual(`${basePath}fonts/split_font_ab.png`);
    });

    // note: This is giving back 'premultiply-alpha-on-upload'
    // ticket: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=45750176
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should set the texture to NPM on SDF fonts', async () =>
    {
        const sdfFont = await loader.load<BitmapFont>(`${basePath}fonts/sdf.fnt`);
        const msdfFont = await loader.load<BitmapFont>(`${basePath}fonts/msdf.fnt`);
        const regularFont = await loader.load<BitmapFont>(`${basePath}fonts/font-text.fnt`);

        expect(sdfFont.chars['A'].texture.source.alphaMode).toEqual('no-premultiply-alpha');
        expect(msdfFont.chars['A'].texture.source.alphaMode).toEqual('no-premultiply-alpha');
        expect(regularFont.chars['A'].texture.source.alphaMode).toEqual('premultiply-alpha-on-upload');
    });

    it('should set the distanceFieldType correctly', async () =>
    {
        const sdfFont = await loader.load<BitmapFont>(`${basePath}fonts/sdf.fnt`);
        const msdfFont = await loader.load<BitmapFont>(`${basePath}fonts/msdf.fnt`);
        const regularFont = await loader.load<BitmapFont>(`${basePath}fonts/font-text.fnt`);

        expect(sdfFont.distanceFieldType).toEqual('sdf');
        expect(msdfFont.distanceFieldType).toEqual('msdf');
        expect(regularFont.distanceFieldType).toEqual('none');
    });

    it('should properly register bitmap font with random placed arguments into info tag', async () =>
    {
        const font = await loader.load<BitmapFont>(`${basePath}fonts/font-random-args.fnt`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'];
        const charATexture = charA.texture as Texture;

        expect(charA).toBeDefined();
        expect(charATexture.source.label).toEqual(`${basePath}fonts/font.png`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
    });

    it('should unload a bitmap font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const bitmapFont = await loader.load<BitmapFont>(`${basePath}fonts/desyrel.xml`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);

        await loader.unload(`${basePath}fonts/desyrel.xml`);

        expect(bitmapFont.pageTextures).toBe(null);
    });
});
