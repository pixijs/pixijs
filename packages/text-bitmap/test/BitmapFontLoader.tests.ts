import path from 'path';
import fs from 'fs';
import { Loader, LoaderResource } from '@pixi/loaders';
import { BaseTextureCache, TextureCache } from '@pixi/utils';
import { Texture, BaseTexture, ImageResource } from '@pixi/core';
import { ISpritesheetData, Spritesheet } from '@pixi/spritesheet';
import { BitmapFont, BitmapFontLoader } from '@pixi/text-bitmap';
import sinon from 'sinon';
import { expect } from 'chai';

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

    before((done) =>
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
                expect(err).to.be.null;
                resolve((new window.DOMParser()).parseFromString(data, 'text/xml'));
            }));

        const loadTxt = (url: string) => new Promise<string>((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).to.be.null;
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
        expect(BitmapFontLoader).to.not.be.undefined;
        expect(BitmapFontLoader.use).to.be.a('function');
    });

    it('should process dirname correctly', () =>
    {
        const dirname = BitmapFontLoader['dirname'];

        expect(dirname('file.fnt')).to.equal('.');
        expect(dirname('/file.fnt')).to.equal('/');
        expect(dirname('foo/bar/file.fnt')).to.equal('foo/bar');
        expect(dirname('/foo/bar/file.fnt')).to.equal('/foo/bar');
        expect(dirname('../file.fnt')).to.equal('..');
    });

    it('should do nothing if the resource is not XML/TXT font data', () =>
    {
        const spy = sinon.spy();
        const res = {} as LoaderResource;

        // @ts-expect-error ---
        BitmapFontLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is not properly formatted XML', () =>
    {
        const spy = sinon.spy();
        const res = { data: document.createDocumentFragment() } as LoaderResource;

        // @ts-expect-error ---
        BitmapFontLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is not properly formatted TXT', () =>
    {
        const spy = sinon.spy();
        const res = { data: 'abcdefgh' } as LoaderResource;

        // @ts-expect-error ---
        BitmapFontLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    // TODO: Test the texture cache code path.
    // TODO: Test the loading texture code path.
    // TODO: Test data-url code paths.

    it('should properly register bitmap font', (done) =>
    {
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontXML, texture);

        expect(font).to.be.an('object');
        expect(BitmapFont.available.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).to.exist;
        expect(charATexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charATexture.frame.x).to.equal(2);
        expect(charATexture.frame.y).to.equal(2);
        expect(charATexture.frame.width).to.equal(19);
        expect(charATexture.frame.height).to.equal(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).to.exist;
        expect(charBTexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charBTexture.frame.x).to.equal(2);
        expect(charBTexture.frame.y).to.equal(24);
        expect(charBTexture.frame.width).to.equal(15);
        expect(charBTexture.frame.height).to.equal(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).to.exist;
        expect(charCTexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charCTexture.frame.x).to.equal(23);
        expect(charCTexture.frame.y).to.equal(2);
        expect(charCTexture.frame.width).to.equal(18);
        expect(charCTexture.frame.height).to.equal(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).to.exist;
        expect(charDTexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charDTexture.frame.x).to.equal(19);
        expect(charDTexture.frame.y).to.equal(24);
        expect(charDTexture.frame.width).to.equal(17);
        expect(charDTexture.frame.height).to.equal(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).to.be.undefined;
        done();
    });

    it('should properly register bitmap font based on txt data', (done) =>
    {
        const texture = Texture.from(fontTXTImage);
        const font = BitmapFont.install(fontTXT, texture);

        expect(font).to.be.an('object');
        expect(font).to.have.property('chars');

        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).to.exist;
        expect(charATexture.baseTexture.resource.source).to.equal(fontTXTImage);
        expect(charATexture.frame.x).to.equal(1);
        expect(charATexture.frame.y).to.equal(179);
        expect(charATexture.frame.width).to.equal(38);
        expect(charATexture.frame.height).to.equal(28);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).to.exist;
        expect(charBTexture.baseTexture.resource.source).to.equal(fontTXTImage);
        expect(charBTexture.frame.x).to.equal(52);
        expect(charBTexture.frame.y).to.equal(146);
        expect(charBTexture.frame.width).to.equal(34);
        expect(charBTexture.frame.height).to.equal(28);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).to.exist;
        expect(charCTexture.baseTexture.resource.source).to.equal(fontTXTImage);
        expect(charCTexture.frame.x).to.equal(52);
        expect(charCTexture.frame.y).to.equal(117);
        expect(charCTexture.frame.width).to.equal(34);
        expect(charCTexture.frame.height).to.equal(28);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).to.exist;
        expect(charDTexture.baseTexture.resource.source).to.equal(fontTXTImage);
        expect(charDTexture.frame.x).to.equal(52);
        expect(charDTexture.frame.y).to.equal(88);
        expect(charDTexture.frame.width).to.equal(34);
        expect(charDTexture.frame.height).to.equal(28);
        const charUndefined = font.chars['£'.charCodeAt(0)];

        expect(charUndefined).to.be.undefined;
        done();
    });

    it('should properly register SCALED bitmap font', (done) =>
    {
        const baseTexture = new BaseTexture(fontScaledImage);

        baseTexture.setResolution(0.5);

        const texture = new Texture(baseTexture);
        const font = BitmapFont.install(fontScaledXML, texture);

        expect(font).to.be.an('object');
        expect(BitmapFont.available.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).to.exist;
        expect(charATexture.baseTexture.resource.source).to.equal(fontScaledImage);
        expect(charATexture.frame.x).to.equal(4); // 2 / 0.5
        expect(charATexture.frame.y).to.equal(4); // 2 / 0.5
        expect(charATexture.frame.width).to.equal(38); // 19 / 0.5
        expect(charATexture.frame.height).to.equal(40); // 20 / 0.5
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).to.exist;
        expect(charBTexture.baseTexture.resource.source).to.equal(fontScaledImage);
        expect(charBTexture.frame.x).to.equal(4); // 2 / 0.5
        expect(charBTexture.frame.y).to.equal(48); // 24 / 0.5
        expect(charBTexture.frame.width).to.equal(30); // 15 / 0.5
        expect(charBTexture.frame.height).to.equal(40); // 20 / 0.5
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).to.exist;
        expect(charCTexture.baseTexture.resource.source).to.equal(fontScaledImage);
        expect(charCTexture.frame.x).to.equal(46); // 23 / 0.5
        expect(charCTexture.frame.y).to.equal(4); // 2 / 0.5
        expect(charCTexture.frame.width).to.equal(36); // 18 / 0.5
        expect(charCTexture.frame.height).to.equal(40); // 20 / 0.5
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).to.exist;
        expect(charDTexture.baseTexture.resource.source).to.equal(fontScaledImage);
        expect(charDTexture.frame.x).to.equal(38); // 19 / 0.5
        expect(charDTexture.frame.y).to.equal(48); // 24 / 0.5
        expect(charDTexture.frame.width).to.equal(34); // 17 / 0.5
        expect(charDTexture.frame.height).to.equal(40); // 20 / 0.5
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).to.be.undefined;
        done();
    });

    it('should properly register bitmap font NESTED into spritesheet', (done) =>
    {
        const baseTexture = new BaseTexture(atlasImage);
        const spritesheet = new Spritesheet(baseTexture, atlasJSON);

        spritesheet.parse(() =>
        {
            const fontTexture  = Texture.from('resources/font.png');
            const font =  BitmapFont.install(fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).to.be.an('object');
            expect(BitmapFont.available.font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;

            expect(charA).to.exist;
            expect(charATexture.baseTexture.resource.source).to.equal(atlasImage);
            expect(charATexture.frame.x).to.equal(fontX + 2);
            expect(charATexture.frame.y).to.equal(fontY + 2);
            expect(charATexture.frame.width).to.equal(19);
            expect(charATexture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0)];
            const charBTexture = charB.texture as Texture<ImageResource>;

            expect(charB).to.exist;
            expect(charBTexture.baseTexture.resource.source).to.equal(atlasImage);
            expect(charBTexture.frame.x).to.equal(fontX + 2);
            expect(charBTexture.frame.y).to.equal(fontY + 24);
            expect(charBTexture.frame.width).to.equal(15);
            expect(charBTexture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0)];
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charC).to.exist;
            expect(charCTexture.baseTexture.resource.source).to.equal(atlasImage);
            expect(charCTexture.frame.x).to.equal(fontX + 23);
            expect(charCTexture.frame.y).to.equal(fontY + 2);
            expect(charCTexture.frame.width).to.equal(18);
            expect(charCTexture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0)];
            const charDTexture = charD.texture as Texture<ImageResource>;

            expect(charD).to.exist;
            expect(charDTexture.baseTexture.resource.source).to.equal(atlasImage);
            expect(charDTexture.frame.x).to.equal(fontX + 19);
            expect(charDTexture.frame.y).to.equal(fontY + 24);
            expect(charDTexture.frame.width).to.equal(17);
            expect(charDTexture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).to.be.undefined;
            done();
        });
    });

    it('should properly register bitmap font NESTED into SCALED spritesheet', (done) =>
    {
        const baseTexture = new BaseTexture(atlasScaledImage);
        const spritesheet = new Spritesheet(baseTexture, atlasScaledJSON);

        spritesheet.resolution = 1;

        spritesheet.parse(() =>
        {
            const fontTexture  = Texture.from('resources/font.png');
            const font =  BitmapFont.install(fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).to.be.an('object');
            expect(BitmapFont.available.font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;

            expect(charA).to.exist;
            expect(charATexture.baseTexture.resource.source).to.equal(atlasScaledImage);
            expect(charATexture.frame.x).to.equal(fontX + 2);
            expect(charATexture.frame.y).to.equal(fontY + 2);
            expect(charATexture.frame.width).to.equal(19);
            expect(charATexture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0)];
            const charBTexture = charB.texture as Texture<ImageResource>;

            expect(charB).to.exist;
            expect(charBTexture.baseTexture.resource.source).to.equal(atlasScaledImage);
            expect(charBTexture.frame.x).to.equal(fontX + 2);
            expect(charBTexture.frame.y).to.equal(fontY + 24);
            expect(charBTexture.frame.width).to.equal(15);
            expect(charBTexture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0)];
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charC).to.exist;
            expect(charCTexture.baseTexture.resource.source).to.equal(atlasScaledImage);
            expect(charCTexture.frame.x).to.equal(fontX + 23);
            expect(charCTexture.frame.y).to.equal(fontY + 2);
            expect(charCTexture.frame.width).to.equal(18);
            expect(charCTexture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0)];
            const charDTexture = charD.texture as Texture<ImageResource>;

            expect(charD).to.exist;
            expect(charDTexture.baseTexture.resource.source).to.equal(atlasScaledImage);
            expect(charDTexture.frame.x).to.equal(fontX + 19);
            expect(charDTexture.frame.y).to.equal(fontY + 24);
            expect(charDTexture.frame.width).to.equal(17);
            expect(charDTexture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).to.be.undefined;
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

            expect(font).to.be.an('object');
            expect(BitmapFont.available.split_font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;

            expect(charA).to.exist;
            let src = charATexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_ab.png');
            expect(charATexture.frame.x).to.equal(2);
            expect(charATexture.frame.y).to.equal(2);
            expect(charATexture.frame.width).to.equal(19);
            expect(charATexture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0)];
            const charBTexture = charB.texture as Texture<ImageResource>;

            expect(charB).to.exist;
            src = charBTexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_ab.png');
            expect(charBTexture.frame.x).to.equal(2);
            expect(charBTexture.frame.y).to.equal(24);
            expect(charBTexture.frame.width).to.equal(15);
            expect(charBTexture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0)];
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charC).to.exist;
            src = charCTexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_cd.png');
            expect(charCTexture.frame.x).to.equal(2);
            expect(charCTexture.frame.y).to.equal(2);
            expect(charCTexture.frame.width).to.equal(18);
            expect(charCTexture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0)];
            const charDTexture = charD.texture as Texture<ImageResource>;

            expect(charD).to.exist;
            src = charDTexture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_cd.png');
            expect(charDTexture.frame.x).to.equal(2);
            expect(charDTexture.frame.y).to.equal(24);
            expect(charDTexture.frame.width).to.equal(17);
            expect(charDTexture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).to.be.undefined;
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

            expect(loader.resources[page0].metadata.pageFile).to.equal('split_font_ab.png');
            expect(loader.resources[page1].metadata.pageFile).to.equal('split_font_cd.png');

            const font = BitmapFont.available.split_font2;
            const charA = font.chars['A'.charCodeAt(0)];
            const charC = font.chars['C'.charCodeAt(0)];
            const charATexture = charA.texture as Texture<ImageResource>;
            const charCTexture = charC.texture as Texture<ImageResource>;

            expect(charA.page).to.equal(0);
            expect(charC.page).to.equal(1);
            expect(charATexture.baseTexture.resource.url).to.equal(page0);
            expect(charCTexture.baseTexture.resource.url).to.equal(page1);

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
            expect(Object.values(loader.resources).length).to.equal(2);
            expect(loader.resources.image.url).to.equal(imagePath);
            expect(loader.resources.font.url).to.equal(fontPath);

            done();
        });
    });

    it('should load and uninstall font cleanly, remove all textures', (done) =>
    {
        const loader = new Loader();
        const fontPath = path.join(resources, 'font.fnt');
        const textureCount = Object.keys(TextureCache).length;

        expect(BitmapFont.available.font).to.be.undefined;

        loader.use(BitmapFontLoader.use);
        loader.add('font', fontPath);
        loader.load(() =>
        {
            expect(BitmapFont.available.font).to.not.be.undefined;
            BitmapFont.uninstall('font');
            expect(BitmapFont.available.font).to.be.undefined;
            expect(Object.keys(TextureCache).length - textureCount).equals(0);

            done();
        });
    });

    it('should load and uninstall font cleanly, preserve textures', () =>
    {
        const textureCount = Object.keys(TextureCache).length;
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontText, texture);

        expect(BitmapFont.available.fontText).equals(font);

        BitmapFont.uninstall('fontText');

        expect(BitmapFont.available.fontText).to.be.undefined;
        expect(Object.keys(TextureCache).length - textureCount).equals(1);

        texture.destroy(true);
    });

    it('should properly register bitmap font based on text format', (done) =>
    {
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontText, texture);

        expect(font).to.be.an('object');
        expect(BitmapFont.available.fontText).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).to.exist;
        expect(charATexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charATexture.frame.x).to.equal(2);
        expect(charATexture.frame.y).to.equal(2);
        expect(charATexture.frame.width).to.equal(19);
        expect(charATexture.frame.height).to.equal(20);
        const charB = font.chars['B'.charCodeAt(0)];
        const charBTexture = charB.texture as Texture<ImageResource>;

        expect(charB).to.exist;
        expect(charBTexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charBTexture.frame.x).to.equal(2);
        expect(charBTexture.frame.y).to.equal(24);
        expect(charBTexture.frame.width).to.equal(15);
        expect(charBTexture.frame.height).to.equal(20);
        const charC = font.chars['C'.charCodeAt(0)];
        const charCTexture = charC.texture as Texture<ImageResource>;

        expect(charC).to.exist;
        expect(charCTexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charCTexture.frame.x).to.equal(23);
        expect(charCTexture.frame.y).to.equal(2);
        expect(charCTexture.frame.width).to.equal(18);
        expect(charCTexture.frame.height).to.equal(20);
        const charD = font.chars['D'.charCodeAt(0)];
        const charDTexture = charD.texture as Texture<ImageResource>;

        expect(charD).to.exist;
        expect(charDTexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charDTexture.frame.x).to.equal(19);
        expect(charDTexture.frame.y).to.equal(24);
        expect(charDTexture.frame.width).to.equal(17);
        expect(charDTexture.frame.height).to.equal(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).to.be.undefined;
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

        expect(sdfFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).to.equal(0);
        expect(msdfFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).to.equal(0);
        expect(regularFont.chars['A'.charCodeAt(0)].texture.baseTexture.alphaMode).to.not.equal(0);

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

        expect(sdfFont.distanceFieldType).to.equal('sdf');
        expect(msdfFont.distanceFieldType).to.equal('msdf');
        expect(regularFont.distanceFieldType).to.equal('none');

        done();
    });

    it('should properly register bitmap font with random placed arguments into info tag', (done) =>
    {
        const texture = Texture.from(fontImage);
        const font = BitmapFont.install(fontRandomArgs, texture);

        expect(font).to.be.an('object');
        expect(BitmapFont.available.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0)];
        const charATexture = charA.texture as Texture<ImageResource>;

        expect(charA).to.exist;
        expect(charATexture.baseTexture.resource.source).to.equal(fontImage);
        expect(charATexture.frame.x).to.equal(2);
        expect(charATexture.frame.y).to.equal(2);
        expect(charATexture.frame.width).to.equal(19);
        expect(charATexture.frame.height).to.equal(20);

        done();
    });
});
