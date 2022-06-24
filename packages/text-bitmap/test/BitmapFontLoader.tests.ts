import path from 'path';
import fs from 'fs';
import type { LoaderResource } from '@pixi/loaders';
import { Loader } from '@pixi/loaders';
import { BaseTextureCache, TextureCache } from '@pixi/utils';
import type { ImageResource } from '@pixi/core';
import { Texture, BaseTexture } from '@pixi/core';
import type { ISpritesheetData } from '@pixi/spritesheet';
import { Spritesheet } from '@pixi/spritesheet';
import { BitmapFont, BitmapFontLoader } from '@pixi/text-bitmap';

describe('BitmapFontLoader', () =>
{
    afterEach(() =>
    {
        for (const font in BitmapFont.available)
        {
            delete BitmapFont.available[font];
        }
        for (const baseTexture in BaseTextureCache)
        {
            delete BaseTextureCache[baseTexture];
        }
        for (const texture in TextureCache)
        {
            delete TextureCache[texture];
        }
    });

    let resources: string;
    let fontXML: XMLDocument;
    let fontTXT: string;
    let fontScaledXML: XMLDocument;
    let fontImage: HTMLImageElement;
    let fontScaledImage: HTMLImageElement;
    let fontText: string;
    let fontRandomArgs: any;
    let fontTXTImage: HTMLImageElement;
    let atlasImage: HTMLImageElement;
    let atlasScaledImage: HTMLImageElement;
    let sdfXML: XMLDocument;
    let msdfXML: XMLDocument;
    let sdfImage: HTMLImageElement;
    let msdfImage: HTMLImageElement;
    let atlasJSON: ISpritesheetData;
    let atlasScaledJSON: ISpritesheetData;

    beforeAll((done) =>
    {
        const resolveURL = (url: string) => path.resolve(resources, url);

        BitmapFontLoader.add();

        resources = path.join(__dirname, 'resources');
        fontXML = null;
        fontTXT = null;
        fontScaledXML = null;
        fontImage = null;
        fontScaledImage = null;
        atlasImage = null;
        atlasScaledImage = null;
        sdfXML = null;
        msdfXML = null;
        sdfImage = null;
        msdfImage = null;
        atlasJSON = require(resolveURL('atlas.json')); // eslint-disable-line global-require
        atlasScaledJSON = require(resolveURL('atlas@0.5x.json')); // eslint-disable-line global-require

        const loadXML = (url: string) => new Promise<XMLDocument>((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).toBeNull();
                resolve((new window.DOMParser()).parseFromString(data, 'text/xml'));
            }));

        const loadTxt = (url: string) => new Promise<string>((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).toBeNull();
                resolve(data);
            }));

        const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve) =>
        {
            const image = new Image();

            image.onload = () => resolve(image);
            image.src = resolveURL(url);
        });

        Promise.all<any>([
            loadTxt('bmtxt-test.txt'),
            loadXML('font.fnt'),
            loadTxt('font-text.fnt'),
            loadTxt('font-random-args.fnt'),
            loadXML('font@0.5x.fnt'),
            loadXML('sdf.fnt'),
            loadXML('msdf.fnt'),
            loadImage('bmtxt-test.png'),
            loadImage('font.png'),
            loadImage('font@0.5x.png'),
            loadImage('atlas.png'),
            loadImage('atlas@0.5x.png'),
            loadImage('sdf.png'),
            loadImage('msdf.png'),
        ]).then(([
            _fontTXT,
            _fontXML,
            _fontText,
            _fontRandomArgs,
            _fontScaledXML,
            _sdfXML,
            _msdfXML,
            _fontTXTImage,
            _fontImage,
            _fontScaledImage,
            _atlasImage,
            _atlasScaledImage,
            _sdfImage,
            _msdfImage,
        ]) =>
        {
            fontTXT = _fontTXT;
            fontXML = _fontXML;
            fontText = _fontText;
            fontRandomArgs = _fontRandomArgs;
            fontScaledXML = _fontScaledXML;
            sdfXML = _sdfXML;
            msdfXML = _msdfXML;
            fontTXTImage = _fontTXTImage;
            fontImage = _fontImage;
            fontScaledImage = _fontScaledImage;
            atlasImage = _atlasImage;
            atlasScaledImage = _atlasScaledImage;
            sdfImage = _sdfImage;
            msdfImage = _msdfImage;
            done();
        });
    });

    it('should exist and return a function', () =>
    {
        expect(BitmapFontLoader).toBeDefined();
        expect(BitmapFontLoader.use).toBeInstanceOf(Function);
    });

    it('should process dirname correctly', () =>
    {
        const dirname = BitmapFontLoader['dirname'];

        expect(dirname('file.fnt')).toEqual('.');
        expect(dirname('/file.fnt')).toEqual('/');
        expect(dirname('foo/bar/file.fnt')).toEqual('foo/bar');
        expect(dirname('/foo/bar/file.fnt')).toEqual('/foo/bar');
        expect(dirname('../file.fnt')).toEqual('..');
    });

    it('should do nothing if the resource is not XML/TXT font data', () =>
    {
        const spy = jest.fn();
        const res = {} as LoaderResource;

        // @ts-expect-error ---
        BitmapFontLoader.use(res, spy);

        expect(spy).toHaveBeenCalledOnce();
        expect(res.textures).toBeUndefined();
    });

    it('should do nothing if the resource is not properly formatted XML', () =>
    {
        const spy = jest.fn();
        const res = { data: document.createDocumentFragment() } as LoaderResource;

        // @ts-expect-error ---
        BitmapFontLoader.use(res, spy);

        expect(spy).toHaveBeenCalledOnce();
        expect(res.textures).toBeUndefined();
    });

    it('should do nothing if the resource is not properly formatted TXT', () =>
    {
        const spy = jest.fn();
        const res = { data: 'abcdefgh' } as LoaderResource;

        // @ts-expect-error ---
        BitmapFontLoader.use(res, spy);

        expect(spy).toHaveBeenCalledOnce();
        expect(res.textures).toBeUndefined();
    });

    // TODO: Test the texture cache code path.
    // TODO: Test the loading texture code path.
    // TODO: Test data-url code paths.

    it('should properly register bitmap font', (done) =>
    {
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontXML, texture);

        expect(font).toBeObject();
        expect(BitmapFont.available.font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charCTexture.frame.x).toEqual(23);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charDTexture.frame.x).toEqual(19);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
        done();
    });

    it('should properly register bitmap font based on txt data', (done) =>
    {
        const texture = Texture.from(fontTXTImage);
        const font = BitmapFont.install(fontTXT, texture);

        expect(font).toBeObject();
        expect(font).toHaveProperty('chars');

        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.source).toEqual(fontTXTImage);
        expect(charATexture.frame.x).toEqual(1);
        expect(charATexture.frame.y).toEqual(179);
        expect(charATexture.frame.width).toEqual(38);
        expect(charATexture.frame.height).toEqual(28);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.source).toEqual(fontTXTImage);
        expect(charBTexture.frame.x).toEqual(52);
        expect(charBTexture.frame.y).toEqual(146);
        expect(charBTexture.frame.width).toEqual(34);
        expect(charBTexture.frame.height).toEqual(28);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.source).toEqual(fontTXTImage);
        expect(charCTexture.frame.x).toEqual(52);
        expect(charCTexture.frame.y).toEqual(117);
        expect(charCTexture.frame.width).toEqual(34);
        expect(charCTexture.frame.height).toEqual(28);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.source).toEqual(fontTXTImage);
        expect(charDTexture.frame.x).toEqual(52);
        expect(charDTexture.frame.y).toEqual(88);
        expect(charDTexture.frame.width).toEqual(34);
        expect(charDTexture.frame.height).toEqual(28);
        const charUndefined = font.chars['£'.charCodeAt(0)];

        expect(charUndefined).toBeUndefined();
        done();
    });

    it('should properly register SCALED bitmap font', (done) =>
    {
        const baseTexture = new BaseTexture(fontScaledImage);

        baseTexture.setResolution(0.5);

        const texture = new Texture(baseTexture);
        const font = BitmapFont.install(fontScaledXML, texture);

        expect(font).toBeObject();
        expect(BitmapFont.available.font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.source).toEqual(fontScaledImage);
        expect(charATexture.frame.x).toEqual(4); // 2 / 0.5
        expect(charATexture.frame.y).toEqual(4); // 2 / 0.5
        expect(charATexture.frame.width).toEqual(38); // 19 / 0.5
        expect(charATexture.frame.height).toEqual(40); // 20 / 0.5
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.source).toEqual(fontScaledImage);
        expect(charBTexture.frame.x).toEqual(4); // 2 / 0.5
        expect(charBTexture.frame.y).toEqual(48); // 24 / 0.5
        expect(charBTexture.frame.width).toEqual(30); // 15 / 0.5
        expect(charBTexture.frame.height).toEqual(40); // 20 / 0.5
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.source).toEqual(fontScaledImage);
        expect(charCTexture.frame.x).toEqual(46); // 23 / 0.5
        expect(charCTexture.frame.y).toEqual(4); // 2 / 0.5
        expect(charCTexture.frame.width).toEqual(36); // 18 / 0.5
        expect(charCTexture.frame.height).toEqual(40); // 20 / 0.5
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.source).toEqual(fontScaledImage);
        expect(charDTexture.frame.x).toEqual(38); // 19 / 0.5
        expect(charDTexture.frame.y).toEqual(48); // 24 / 0.5
        expect(charDTexture.frame.width).toEqual(34); // 17 / 0.5
        expect(charDTexture.frame.height).toEqual(40); // 20 / 0.5
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
        done();
    });

    it('should properly register bitmap font NESTED into spritesheet', (done) =>
    {
        const baseTexture = new BaseTexture(atlasImage);
        const spritesheet = new Spritesheet(baseTexture, atlasJSON);

        spritesheet.parse().then(() =>
        {
            const fontTexture  = Texture.from('resources/font.png');
            const font =  BitmapFont.install(fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).toBeObject();
            expect(BitmapFont.available.font).toEqual(font);
            expect(font).toHaveProperty('chars');
            const charA = font.chars['A'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;

            expect(charA).toBeDefined();
            expect(charATexture.baseTexture.resource.source).toEqual(atlasImage);
            expect(charATexture.frame.x).toEqual(fontX + 2);
            expect(charATexture.frame.y).toEqual(fontY + 2);
            expect(charATexture.frame.width).toEqual(19);
            expect(charATexture.frame.height).toEqual(20);
            const charB = font.chars['B'.charCodeAt(0)];
            const charBTexture = charB.texture as Texture<ImageResource>;

            expect(charB).toBeDefined();
            expect(charBTexture.baseTexture.resource.source).toEqual(atlasImage);
            expect(charBTexture.frame.x).toEqual(fontX + 2);
            expect(charBTexture.frame.y).toEqual(fontY + 24);
            expect(charBTexture.frame.width).toEqual(15);
            expect(charBTexture.frame.height).toEqual(20);
            const charC = font.chars['C'.charCodeAt(0)];
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charC).toBeDefined();
            expect(charCTexture.baseTexture.resource.source).toEqual(atlasImage);
            expect(charCTexture.frame.x).toEqual(fontX + 23);
            expect(charCTexture.frame.y).toEqual(fontY + 2);
            expect(charCTexture.frame.width).toEqual(18);
            expect(charCTexture.frame.height).toEqual(20);
            const charD = font.chars['D'.charCodeAt(0)];
            const charDTexture = charD.texture as Texture<ImageResource>;

            expect(charD).toBeDefined();
            expect(charDTexture.baseTexture.resource.source).toEqual(atlasImage);
            expect(charDTexture.frame.x).toEqual(fontX + 19);
            expect(charDTexture.frame.y).toEqual(fontY + 24);
            expect(charDTexture.frame.width).toEqual(17);
            expect(charDTexture.frame.height).toEqual(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).toBeUndefined();
            done();
        });
    });

    it('should properly register bitmap font NESTED into SCALED spritesheet', (done) =>
    {
        const baseTexture = new BaseTexture(atlasScaledImage);
        const spritesheet = new Spritesheet(baseTexture, atlasScaledJSON);

        spritesheet.resolution = 1;

        spritesheet.parse().then(() =>
        {
            const fontTexture  = Texture.from('resources/font.png');
            const font =  BitmapFont.install(fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).toBeObject();
            expect(BitmapFont.available.font).toEqual(font);
            expect(font).toHaveProperty('chars');
            const charA = font.chars['A'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;

            expect(charA).toBeDefined();
            expect(charATexture.baseTexture.resource.source).toEqual(atlasScaledImage);
            expect(charATexture.frame.x).toEqual(fontX + 2);
            expect(charATexture.frame.y).toEqual(fontY + 2);
            expect(charATexture.frame.width).toEqual(19);
            expect(charATexture.frame.height).toEqual(20);
            const charB = font.chars['B'.charCodeAt(0)];
            const charBTexture = charB.texture as Texture<ImageResource>;

            expect(charB).toBeDefined();
            expect(charBTexture.baseTexture.resource.source).toEqual(atlasScaledImage);
            expect(charBTexture.frame.x).toEqual(fontX + 2);
            expect(charBTexture.frame.y).toEqual(fontY + 24);
            expect(charBTexture.frame.width).toEqual(15);
            expect(charBTexture.frame.height).toEqual(20);
            const charC = font.chars['C'.charCodeAt(0)];
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charC).toBeDefined();
            expect(charCTexture.baseTexture.resource.source).toEqual(atlasScaledImage);
            expect(charCTexture.frame.x).toEqual(fontX + 23);
            expect(charCTexture.frame.y).toEqual(fontY + 2);
            expect(charCTexture.frame.width).toEqual(18);
            expect(charCTexture.frame.height).toEqual(20);
            const charD = font.chars['D'.charCodeAt(0)];
            const charDTexture = charD.texture as Texture<ImageResource>;

            expect(charD).toBeDefined();
            expect(charDTexture.baseTexture.resource.source).toEqual(atlasScaledImage);
            expect(charDTexture.frame.x).toEqual(fontX + 19);
            expect(charDTexture.frame.y).toEqual(fontY + 24);
            expect(charDTexture.frame.width).toEqual(17);
            expect(charDTexture.frame.height).toEqual(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).toBeUndefined();
            done();
        });
    });

    it('should properly register bitmap font having more than one texture', (done) =>
    {
        const loader = new Loader();

        loader.use(BitmapFontLoader.use);
        loader.add(path.join(resources, 'split_font.fnt'));
        loader.load(() =>
        {
            const font = BitmapFont.available.split_font;

            expect(font).toBeObject();
            expect(BitmapFont.available.split_font).toEqual(font);
            expect(font).toHaveProperty('chars');
            const charA = font.chars['A'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;

            expect(charA).toBeDefined();
            let src = charATexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).toEqual('split_font_ab.png');
            expect(charATexture.frame.x).toEqual(2);
            expect(charATexture.frame.y).toEqual(2);
            expect(charATexture.frame.width).toEqual(19);
            expect(charATexture.frame.height).toEqual(20);
            const charB = font.chars['B'.charCodeAt(0)];
            const charBTexture = charB.texture as Texture<ImageResource>;

            expect(charB).toBeDefined();
            src = charBTexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).toEqual('split_font_ab.png');
            expect(charBTexture.frame.x).toEqual(2);
            expect(charBTexture.frame.y).toEqual(24);
            expect(charBTexture.frame.width).toEqual(15);
            expect(charBTexture.frame.height).toEqual(20);
            const charC = font.chars['C'.charCodeAt(0)];
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charC).toBeDefined();
            src = charCTexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).toEqual('split_font_cd.png');
            expect(charCTexture.frame.x).toEqual(2);
            expect(charCTexture.frame.y).toEqual(2);
            expect(charCTexture.frame.width).toEqual(18);
            expect(charCTexture.frame.height).toEqual(20);
            const charD = font.chars['D'.charCodeAt(0)];
            const charDTexture = charD.texture as Texture<ImageResource>;

            expect(charD).toBeDefined();
            src = charDTexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).toEqual('split_font_cd.png');
            expect(charDTexture.frame.x).toEqual(2);
            expect(charDTexture.frame.y).toEqual(24);
            expect(charDTexture.frame.width).toEqual(17);
            expect(charDTexture.frame.height).toEqual(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).toBeUndefined();
            done();
        });
    });

    it('should split fonts if page IDs are in chronological order', (done) =>
    {
        const loader = new Loader();

        loader.use(BitmapFontLoader.use);
        loader.add(path.join(resources, 'split_font2.fnt'));
        loader.load(() =>
        {
            const page0 = path.join(resources, 'split_font_ab.png').replace(/\\/g, '/');
            const page1 = path.join(resources, 'split_font_cd.png').replace(/\\/g, '/');

            expect(loader.resources[page0].metadata.pageFile).toEqual('split_font_ab.png');
            expect(loader.resources[page1].metadata.pageFile).toEqual('split_font_cd.png');

            const font = BitmapFont.available.split_font2;
            const charA = font.chars['A'.charCodeAt(0)];
            const charC = font.chars['C'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charA.page).toEqual(0);
            expect(charC.page).toEqual(1);
            expect(charATexture.baseTexture.resource.url).toEqual(page0);
            expect(charCTexture.baseTexture.resource.url).toEqual(page1);

            done();
        });
    });

    it('should register bitmap font with side-loaded image', (done) =>
    {
        const loader = new Loader();
        const imagePath = path.join(resources, 'font.png');
        const fontPath = path.join(resources, 'font.fnt');

        loader.add('image', imagePath);
        loader.add('font', fontPath);
        loader.load(() =>
        {
            expect(Object.values(loader.resources).length).toEqual(2);
            expect(loader.resources.image.url).toEqual(imagePath);
            expect(loader.resources.font.url).toEqual(fontPath);

            done();
        });
    });

    it('should load and uninstall font cleanly, remove all textures', (done) =>
    {
        const loader = new Loader();
        const fontPath = path.join(resources, 'font.fnt');
        const textureCount = Object.keys(TextureCache).length;

        expect(BitmapFont.available.font).toBeUndefined();

        loader.use(BitmapFontLoader.use);
        loader.add('font', fontPath);
        loader.load(() =>
        {
            expect(BitmapFont.available.font).toBeDefined();
            BitmapFont.uninstall('font');
            expect(BitmapFont.available.font).toBeUndefined();
            expect(Object.keys(TextureCache).length - textureCount).toEqual(0);

            done();
        });
    });

    it('should load and uninstall font cleanly, preserve textures', () =>
    {
        const textureCount = Object.keys(TextureCache).length;
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontText, texture);

        expect(BitmapFont.available.fontText).toEqual(font);

        BitmapFont.uninstall('fontText');

        expect(BitmapFont.available.fontText).toBeUndefined();
        expect(Object.keys(TextureCache).length - textureCount).toEqual(1);

        texture.destroy(true);
    });

    it('should properly register bitmap font based on text format', (done) =>
    {
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontText, texture);

        expect(font).toBeObject();
        expect(BitmapFont.available.fontText).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).toBeDefined();
        expect(charBTexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charBTexture.frame.x).toEqual(2);
        expect(charBTexture.frame.y).toEqual(24);
        expect(charBTexture.frame.width).toEqual(15);
        expect(charBTexture.frame.height).toEqual(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).toBeDefined();
        expect(charCTexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charCTexture.frame.x).toEqual(23);
        expect(charCTexture.frame.y).toEqual(2);
        expect(charCTexture.frame.width).toEqual(18);
        expect(charCTexture.frame.height).toEqual(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).toBeDefined();
        expect(charDTexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charDTexture.frame.x).toEqual(19);
        expect(charDTexture.frame.y).toEqual(24);
        expect(charDTexture.frame.width).toEqual(17);
        expect(charDTexture.frame.height).toEqual(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).toBeUndefined();
        done();
    });

    it('should set the texture to NPM on SDF fonts', (done) =>
    {
        const sdfTexture = Texture.from(sdfImage);
        const msdfTexture = Texture.from(msdfImage);
        const regularTexture = Texture.from(fontImage);
        const sdfFont = BitmapFont.install(sdfXML, sdfTexture);
        const msdfFont = BitmapFont.install(msdfXML, msdfTexture);
        const regularFont = BitmapFont.install(fontText, regularTexture);

        expect(sdfFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).toEqual(0);
        expect(msdfFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).toEqual(0);
        expect(regularFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).not.toEqual(0);

        done();
    });

    it('should set the distanceFieldType correctly', (done) =>
    {
        const sdfTexture = Texture.from(sdfImage);
        const msdfTexture = Texture.from(msdfImage);
        const regularTexture = Texture.from(fontImage);
        const sdfFont = BitmapFont.install(sdfXML, sdfTexture);
        const msdfFont = BitmapFont.install(msdfXML, msdfTexture);
        const regularFont = BitmapFont.install(fontText, regularTexture);

        expect(sdfFont.distanceFieldType).toEqual('sdf');
        expect(msdfFont.distanceFieldType).toEqual('msdf');
        expect(regularFont.distanceFieldType).toEqual('none');

        done();
    });

    it('should properly register bitmap font with random placed arguments into info tag', (done) =>
    {
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontRandomArgs, texture);

        expect(font).toBeObject();
        expect(BitmapFont.available.font).toEqual(font);
        expect(font).toHaveProperty('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).toBeDefined();
        expect(charATexture.baseTexture.resource.source).toEqual(fontImage);
        expect(charATexture.frame.x).toEqual(2);
        expect(charATexture.frame.y).toEqual(2);
        expect(charATexture.frame.width).toEqual(19);
        expect(charATexture.frame.height).toEqual(20);

        done();
    });
});
