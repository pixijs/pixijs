import { BitmapFont } from '../../../src/scene/text/bitmap/BitmapFont';

describe('BitmapFontLoader', () =>
{
    let loader: Loader;
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/text-bitmap/test/resources/`
        : 'http://localhost:8080/text-bitmap/test/resources/';

    beforeEach(() =>
    {
        Cache.reset();
        loader.reset();
    });

    afterEach(() =>
    {
        for (const font in BitmapFont.available)
        {
            delete BitmapFont.available[font];
        }
        for (const baseTexture in utils.BaseTextureCache)
        {
            delete utils.BaseTextureCache[baseTexture];
        }
        for (const texture in utils.TextureCache)
        {
            delete utils.TextureCache[texture];
        }
    });

    beforeAll(() =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadTxt, loadTextures, loadBitmapFont);
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
        const font = await loader.load<BitmapFont>(`${serverPath}font.fnt`);

        expect(font).toBeObject();
        expect(BitmapFont.available.font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charCTexture.frame.x).toEqual(23);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charDTexture.frame.x).toEqual(19);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
    });

    it('should properly register bitmap font based on txt data', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}bmtxt-test.txt`);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');

        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}bmGlyph-test.png`);
        expect(charATexture.frame.x).toEqual(1);
        expect(charATexture.frame.y).toEqual(179);
        expect(charATexture.frame.width).toEqual(38);
        expect(charATexture.frame.height).toEqual(28);

        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.src).toEqual(`${serverPath}bmGlyph-test.png`);
        expect(charBTexture.frame.x).toEqual(52);
        expect(charBTexture.frame.y).toEqual(146);
        expect(charBTexture.frame.width).toEqual(34);
        expect(charBTexture.frame.height).toEqual(28);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.src).toEqual(`${serverPath}bmGlyph-test.png`);
        expect(charCTexture.frame.x).toEqual(52);
        expect(charCTexture.frame.y).toEqual(117);
        expect(charCTexture.frame.width).toEqual(34);
        expect(charCTexture.frame.height).toEqual(28);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.src).toEqual(`${serverPath}bmGlyph-test.png`);
        expect(charDTexture.frame.x).toEqual(52);
        expect(charDTexture.frame.y).toEqual(88);
        expect(charDTexture.frame.width).toEqual(34);
        expect(charDTexture.frame.height).toEqual(28);
        const charUndefined = font.chars['£'.charCodeAt(0)];

        expect(charUndefined).toBeUndefined();
    });

    it('should properly register bitmap font based on text format', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}font-text.fnt`);

        expect(font).toBeObject();
        expect(BitmapFont.available.fontText).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charCTexture.frame.x).toEqual(23);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charDTexture.frame.x).toEqual(19);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
    });

    it('should properly register bitmap font with url params', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}font-text.fnt?version=1.0.0`);

        expect(font).toBeObject();
        expect(BitmapFont.available.fontText).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}font.png?version=1.0.0`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
    });

    it('should properly register SCALED bitmap font', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}font@0.5x.fnt`);

        expect(font).toBeObject();
        expect(BitmapFont.available.font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}font@0.5x.png`);
        expect(charATexture.frame.x).toEqual(4); // 2 / 0.5
        expect(charATexture.frame.y).toEqual(4); // 2 / 0.5
        expect(charATexture.frame.width).toEqual(38); // 19 / 0.5
        expect(charATexture.frame.height).toEqual(40); // 20 / 0.5
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.src).toEqual(`${serverPath}font@0.5x.png`);
        expect(charBTexture.frame.x).toEqual(4); // 2 / 0.5
        expect(charBTexture.frame.y).toEqual(48); // 24 / 0.5
        expect(charBTexture.frame.width).toEqual(30); // 15 / 0.5
        expect(charBTexture.frame.height).toEqual(40); // 20 / 0.5
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.src).toEqual(`${serverPath}font@0.5x.png`);
        expect(charCTexture.frame.x).toEqual(46); // 23 / 0.5
        expect(charCTexture.frame.y).toEqual(4); // 2 / 0.5
        expect(charCTexture.frame.width).toEqual(36); // 18 / 0.5
        expect(charCTexture.frame.height).toEqual(40); // 20 / 0.5
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.src).toEqual(`${serverPath}font@0.5x.png`);
        expect(charDTexture.frame.x).toEqual(38); // 19 / 0.5
        expect(charDTexture.frame.y).toEqual(48); // 24 / 0.5
        expect(charDTexture.frame.width).toEqual(34); // 17 / 0.5
        expect(charDTexture.frame.height).toEqual(40); // 20 / 0.5
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
    });

    it('should properly register bitmap font having more than one texture', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}split_font.fnt`);

        expect(font).toBeObject();
        expect(BitmapFont.available.split_font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        let src = charATexture.baseTexture.resource.src;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_ab.png');
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        src = charBTexture.baseTexture.resource.src;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_ab.png');
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        src = charCTexture.baseTexture.resource.src;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_cd.png');
        expect(charCTexture.frame.x).toEqual(2);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        src = charDTexture.baseTexture.resource.src;

        src = src.substring(src.length - 17);
        expect(src).toEqual('split_font_cd.png');
        expect(charDTexture.frame.x).toEqual(2);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
    });

    it('should split fonts if page IDs are in chronological order', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}split_font2.fnt`);

        const charA = font.chars['A'.charCodeAt(0)];
        const charC = font.chars['C'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charA.page).toEqual(0);
        expect(charC.page).toEqual(1);
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}split_font_ab.png`);
        expect(charCTexture.baseTexture.resource.src).toEqual(`${serverPath}split_font_cd.png`);
    });

    it('should set the texture to NPM on SDF fonts', async () =>
    {
        const sdfFont = await loader.load<BitmapFont>(`${serverPath}sdf.fnt`);
        const msdfFont = await loader.load<BitmapFont>(`${serverPath}msdf.fnt`);
        const regularFont = await loader.load<BitmapFont>(`${serverPath}font-text.fnt`);

        expect(sdfFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).toEqual(0);
        expect(msdfFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).toEqual(0);
        expect(regularFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).not.toEqual(0);
    });

    it('should set the distanceFieldType correctly', async () =>
    {
        const sdfFont = await loader.load<BitmapFont>(`${serverPath}sdf.fnt`);
        const msdfFont = await loader.load<BitmapFont>(`${serverPath}msdf.fnt`);
        const regularFont = await loader.load<BitmapFont>(`${serverPath}font-text.fnt`);

        expect(sdfFont.distanceFieldType).toEqual('sdf');
        expect(msdfFont.distanceFieldType).toEqual('msdf');
        expect(regularFont.distanceFieldType).toEqual('none');
    });

    it('should properly register bitmap font with random placed arguments into info tag', async () =>
    {
        const font = await loader.load<BitmapFont>(`${serverPath}font-random-args.fnt`);

        expect(font).toBeObject();
        expect(BitmapFont.available.font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.src).toEqual(`${serverPath}font.png`);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
    });

    it('should unload a bitmap font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures, loadBitmapFont);

        const bitmapFont = await loader.load<BitmapFont>(`${serverPath}desyrel.xml`);

        expect(bitmapFont).toBeInstanceOf(BitmapFont);

        await loader.unload(`${serverPath}desyrel.xml`);

        expect(bitmapFont.pageTextures).toBe(null);
    });
});
