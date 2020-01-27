const path = require('path');
const fs = require('fs');
const { Loader } = require('@pixi/loaders');
const { BaseTextureCache, TextureCache } = require('@pixi/utils');
const { Texture, BaseTexture } = require('@pixi/core');
const { Spritesheet } = require('@pixi/spritesheet');
const { BitmapText, BitmapFontLoader } = require('../');

describe('PIXI.BitmapFontLoader', function ()
{
    afterEach(function ()
    {
        for (const font in BitmapText.fonts)
        {
            delete BitmapText.fonts[font];
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

    before(function (done)
    {
        const resolveURL = (url) => path.resolve(this.resources, url);

        BitmapFontLoader.add();

        this.resources = path.join(__dirname, 'resources');
        this.fontXML = null;
        this.fontTXT = null;
        this.fontScaledXML = null;
        this.fontImage = null;
        this.fontScaledImage = null;
        this.atlasImage = null;
        this.atlasScaledImage = null;
        this.atlasJSON = require(resolveURL('atlas.json')); // eslint-disable-line global-require
        this.atlasScaledJSON = require(resolveURL('atlas@0.5x.json')); // eslint-disable-line global-require

        const loadXML = (url) => new Promise((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).to.be.null;
                resolve((new window.DOMParser()).parseFromString(data, 'text/xml'));
            }));

        const loadTxt = (url) => new Promise((resolve) =>
            fs.readFile(resolveURL(url), 'utf8', (err, data) =>
            {
                expect(err).to.be.null;
                resolve(data);
            }));

        const loadImage = (url) => new Promise((resolve) =>
        {
            const image = new Image();

            image.onload = () => resolve(image);
            image.src = resolveURL(url);
        });

        Promise.all([
            loadTxt('bmtxt-test.txt'),
            loadXML('font.fnt'),
            loadXML('font@0.5x.fnt'),
            loadImage('bmtxt-test.png'),
            loadImage('font.png'),
            loadImage('font@0.5x.png'),
            loadImage('atlas.png'),
            loadImage('atlas@0.5x.png'),
        ]).then(([
            fontTXT,
            fontXML,
            fontScaledXML,
            fontTXTImage,
            fontImage,
            fontScaledImage,
            atlasImage,
            atlasScaledImage,
        ]) =>
        {
            this.fontTXT = fontTXT;
            this.fontXML = fontXML;
            this.fontScaledXML = fontScaledXML;
            this.fontTXTImage = fontTXTImage;
            this.fontImage = fontImage;
            this.fontScaledImage = fontScaledImage;
            this.atlasImage = atlasImage;
            this.atlasScaledImage = atlasScaledImage;
            done();
        });
    });

    it('should exist and return a function', function ()
    {
        expect(BitmapFontLoader).to.not.be.undefined;
        expect(BitmapFontLoader.use).to.be.a('function');
    });

    it('should process dirname correctly', function ()
    {
        const { dirname } = BitmapFontLoader;

        expect(dirname('file.fnt')).to.equal('.');
        expect(dirname('/file.fnt')).to.equal('/');
        expect(dirname('foo/bar/file.fnt')).to.equal('foo/bar');
        expect(dirname('/foo/bar/file.fnt')).to.equal('/foo/bar');
        expect(dirname('../file.fnt')).to.equal('..');
    });

    it('should do nothing if the resource is not XML/TXT font data', function ()
    {
        const spy = sinon.spy();
        const res = {};

        BitmapFontLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is not properly formatted XML', function ()
    {
        const spy = sinon.spy();
        const res = { data: document.createDocumentFragment() };

        BitmapFontLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is not properly formatted TXT', function ()
    {
        const spy = sinon.spy();
        const res = { data: 'abcdefgh' };

        BitmapFontLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    // TODO: Test the texture cache code path.
    // TODO: Test the loading texture code path.
    // TODO: Test data-url code paths.

    it('should properly register bitmap font', function (done)
    {
        const texture = Texture.from(this.fontImage);
        const font = BitmapText.registerFont(this.fontXML, texture);

        expect(font).to.be.an.object;
        expect(BitmapText.fonts.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0)];

        expect(charA).to.exist;
        expect(charA.texture.baseTexture.resource.source).to.equal(this.fontImage);
        expect(charA.texture.frame.x).to.equal(2);
        expect(charA.texture.frame.y).to.equal(2);
        expect(charA.texture.frame.width).to.equal(19);
        expect(charA.texture.frame.height).to.equal(20);
        const charB = font.chars['B'.charCodeAt(0)];

        expect(charB).to.exist;
        expect(charB.texture.baseTexture.resource.source).to.equal(this.fontImage);
        expect(charB.texture.frame.x).to.equal(2);
        expect(charB.texture.frame.y).to.equal(24);
        expect(charB.texture.frame.width).to.equal(15);
        expect(charB.texture.frame.height).to.equal(20);
        const charC = font.chars['C'.charCodeAt(0)];

        expect(charC).to.exist;
        expect(charC.texture.baseTexture.resource.source).to.equal(this.fontImage);
        expect(charC.texture.frame.x).to.equal(23);
        expect(charC.texture.frame.y).to.equal(2);
        expect(charC.texture.frame.width).to.equal(18);
        expect(charC.texture.frame.height).to.equal(20);
        const charD = font.chars['D'.charCodeAt(0)];

        expect(charD).to.exist;
        expect(charD.texture.baseTexture.resource.source).to.equal(this.fontImage);
        expect(charD.texture.frame.x).to.equal(19);
        expect(charD.texture.frame.y).to.equal(24);
        expect(charD.texture.frame.width).to.equal(17);
        expect(charD.texture.frame.height).to.equal(20);
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).to.be.undefined;
        done();
    });

    it('should properly register bitmap font based on txt data', function (done)
    {
        const texture = Texture.from(this.fontTXTImage);
        const font = BitmapText.registerFont(this.fontTXT, texture);

        expect(font).to.be.an.object;
        expect(font).to.have.property('chars');

        const charA = font.chars['A'.charCodeAt(0)];

        expect(charA).to.exist;
        expect(charA.texture.baseTexture.resource.source).to.equal(this.fontTXTImage);
        expect(charA.texture.frame.x).to.equal(1);
        expect(charA.texture.frame.y).to.equal(179);
        expect(charA.texture.frame.width).to.equal(38);
        expect(charA.texture.frame.height).to.equal(28);
        const charB = font.chars['B'.charCodeAt(0)];

        expect(charB).to.exist;
        expect(charB.texture.baseTexture.resource.source).to.equal(this.fontTXTImage);
        expect(charB.texture.frame.x).to.equal(52);
        expect(charB.texture.frame.y).to.equal(146);
        expect(charB.texture.frame.width).to.equal(34);
        expect(charB.texture.frame.height).to.equal(28);
        const charC = font.chars['C'.charCodeAt(0)];

        expect(charC).to.exist;
        expect(charC.texture.baseTexture.resource.source).to.equal(this.fontTXTImage);
        expect(charC.texture.frame.x).to.equal(52);
        expect(charC.texture.frame.y).to.equal(117);
        expect(charC.texture.frame.width).to.equal(34);
        expect(charC.texture.frame.height).to.equal(28);
        const charD = font.chars['D'.charCodeAt(0)];

        expect(charD).to.exist;
        expect(charD.texture.baseTexture.resource.source).to.equal(this.fontTXTImage);
        expect(charD.texture.frame.x).to.equal(52);
        expect(charD.texture.frame.y).to.equal(88);
        expect(charD.texture.frame.width).to.equal(34);
        expect(charD.texture.frame.height).to.equal(28);
        const charUndefined = font.chars['£'.charCodeAt(0)];

        expect(charUndefined).to.be.undefined;
        done();
    });

    it('should properly register SCALED bitmap font', function (done)
    {
        const baseTexture = new BaseTexture(this.fontScaledImage);

        baseTexture.setResolution(0.5);

        const texture = new Texture(baseTexture);
        const font = BitmapText.registerFont(this.fontScaledXML, texture);

        expect(font).to.be.an.object;
        expect(BitmapText.fonts.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0)];

        expect(charA).to.exist;
        expect(charA.texture.baseTexture.resource.source).to.equal(this.fontScaledImage);
        expect(charA.texture.frame.x).to.equal(4); // 2 / 0.5
        expect(charA.texture.frame.y).to.equal(4); // 2 / 0.5
        expect(charA.texture.frame.width).to.equal(38); // 19 / 0.5
        expect(charA.texture.frame.height).to.equal(40); // 20 / 0.5
        const charB = font.chars['B'.charCodeAt(0)];

        expect(charB).to.exist;
        expect(charB.texture.baseTexture.resource.source).to.equal(this.fontScaledImage);
        expect(charB.texture.frame.x).to.equal(4); // 2 / 0.5
        expect(charB.texture.frame.y).to.equal(48); // 24 / 0.5
        expect(charB.texture.frame.width).to.equal(30); // 15 / 0.5
        expect(charB.texture.frame.height).to.equal(40); // 20 / 0.5
        const charC = font.chars['C'.charCodeAt(0)];

        expect(charC).to.exist;
        expect(charC.texture.baseTexture.resource.source).to.equal(this.fontScaledImage);
        expect(charC.texture.frame.x).to.equal(46); // 23 / 0.5
        expect(charC.texture.frame.y).to.equal(4); // 2 / 0.5
        expect(charC.texture.frame.width).to.equal(36); // 18 / 0.5
        expect(charC.texture.frame.height).to.equal(40); // 20 / 0.5
        const charD = font.chars['D'.charCodeAt(0)];

        expect(charD).to.exist;
        expect(charD.texture.baseTexture.resource.source).to.equal(this.fontScaledImage);
        expect(charD.texture.frame.x).to.equal(38); // 19 / 0.5
        expect(charD.texture.frame.y).to.equal(48); // 24 / 0.5
        expect(charD.texture.frame.width).to.equal(34); // 17 / 0.5
        expect(charD.texture.frame.height).to.equal(40); // 20 / 0.5
        const charE = font.chars['E'.charCodeAt(0)];

        expect(charE).to.be.undefined;
        done();
    });

    it('should properly register bitmap font NESTED into spritesheet', function (done)
    {
        const baseTexture = new BaseTexture(this.atlasImage);
        const spritesheet = new Spritesheet(baseTexture, this.atlasJSON);

        spritesheet.parse(() =>
        {
            const fontTexture  = Texture.from('resources/font.png');
            const font =  BitmapText.registerFont(this.fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).to.be.an.object;
            expect(BitmapText.fonts.font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0)];

            expect(charA).to.exist;
            expect(charA.texture.baseTexture.resource.source).to.equal(this.atlasImage);
            expect(charA.texture.frame.x).to.equal(fontX + 2);
            expect(charA.texture.frame.y).to.equal(fontY + 2);
            expect(charA.texture.frame.width).to.equal(19);
            expect(charA.texture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0)];

            expect(charB).to.exist;
            expect(charB.texture.baseTexture.resource.source).to.equal(this.atlasImage);
            expect(charB.texture.frame.x).to.equal(fontX + 2);
            expect(charB.texture.frame.y).to.equal(fontY + 24);
            expect(charB.texture.frame.width).to.equal(15);
            expect(charB.texture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0)];

            expect(charC).to.exist;
            expect(charC.texture.baseTexture.resource.source).to.equal(this.atlasImage);
            expect(charC.texture.frame.x).to.equal(fontX + 23);
            expect(charC.texture.frame.y).to.equal(fontY + 2);
            expect(charC.texture.frame.width).to.equal(18);
            expect(charC.texture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0)];

            expect(charD).to.exist;
            expect(charD.texture.baseTexture.resource.source).to.equal(this.atlasImage);
            expect(charD.texture.frame.x).to.equal(fontX + 19);
            expect(charD.texture.frame.y).to.equal(fontY + 24);
            expect(charD.texture.frame.width).to.equal(17);
            expect(charD.texture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).to.be.undefined;
            done();
        });
    });

    it('should properly register bitmap font NESTED into SCALED spritesheet', function (done)
    {
        const baseTexture = new BaseTexture(this.atlasScaledImage);
        const spritesheet = new Spritesheet(baseTexture, this.atlasScaledJSON);

        spritesheet.resolution = 1;

        spritesheet.parse(() =>
        {
            const fontTexture  = Texture.from('resources/font.png');
            const font =  BitmapText.registerFont(this.fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).to.be.an.object;
            expect(BitmapText.fonts.font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0)];

            expect(charA).to.exist;
            expect(charA.texture.baseTexture.resource.source).to.equal(this.atlasScaledImage);
            expect(charA.texture.frame.x).to.equal(fontX + 2);
            expect(charA.texture.frame.y).to.equal(fontY + 2);
            expect(charA.texture.frame.width).to.equal(19);
            expect(charA.texture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0)];

            expect(charB).to.exist;
            expect(charB.texture.baseTexture.resource.source).to.equal(this.atlasScaledImage);
            expect(charB.texture.frame.x).to.equal(fontX + 2);
            expect(charB.texture.frame.y).to.equal(fontY + 24);
            expect(charB.texture.frame.width).to.equal(15);
            expect(charB.texture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0)];

            expect(charC).to.exist;
            expect(charC.texture.baseTexture.resource.source).to.equal(this.atlasScaledImage);
            expect(charC.texture.frame.x).to.equal(fontX + 23);
            expect(charC.texture.frame.y).to.equal(fontY + 2);
            expect(charC.texture.frame.width).to.equal(18);
            expect(charC.texture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0)];

            expect(charD).to.exist;
            expect(charD.texture.baseTexture.resource.source).to.equal(this.atlasScaledImage);
            expect(charD.texture.frame.x).to.equal(fontX + 19);
            expect(charD.texture.frame.y).to.equal(fontY + 24);
            expect(charD.texture.frame.width).to.equal(17);
            expect(charD.texture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).to.be.undefined;
            done();
        });
    });

    it('should properly register bitmap font having more than one texture', function (done)
    {
        const loader = new Loader();

        loader.use(BitmapFontLoader.use);
        loader.add(path.join(this.resources, 'split_font.fnt'));
        loader.load(() =>
        {
            const font = BitmapText.fonts.split_font;

            expect(font).to.be.an.object;
            expect(BitmapText.fonts.split_font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0)];

            expect(charA).to.exist;
            let src = charA.texture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_ab.png');
            expect(charA.texture.frame.x).to.equal(2);
            expect(charA.texture.frame.y).to.equal(2);
            expect(charA.texture.frame.width).to.equal(19);
            expect(charA.texture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0)];

            expect(charB).to.exist;
            src = charB.texture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_ab.png');
            expect(charB.texture.frame.x).to.equal(2);
            expect(charB.texture.frame.y).to.equal(24);
            expect(charB.texture.frame.width).to.equal(15);
            expect(charB.texture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0)];

            expect(charC).to.exist;
            src = charC.texture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_cd.png');
            expect(charC.texture.frame.x).to.equal(2);
            expect(charC.texture.frame.y).to.equal(2);
            expect(charC.texture.frame.width).to.equal(18);
            expect(charC.texture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0)];

            expect(charD).to.exist;
            src = charD.texture.baseTexture.resource.url;

            src = src.substring(src.length - 17);
            expect(src).to.equal('split_font_cd.png');
            expect(charD.texture.frame.x).to.equal(2);
            expect(charD.texture.frame.y).to.equal(24);
            expect(charD.texture.frame.width).to.equal(17);
            expect(charD.texture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0)];

            expect(charE).to.be.undefined;
            done();
        });
    });

    it('should split fonts if page IDs are in chronological order', function (done)
    {
        const loader = new Loader();

        loader.use(BitmapFontLoader.use);
        loader.add(path.join(this.resources, 'split_font2.fnt'));
        loader.load(() =>
        {
            const page0 = path.join(this.resources, 'split_font_ab.png').replace(/\\/g, '/');
            const page1 = path.join(this.resources, 'split_font_cd.png').replace(/\\/g, '/');

            expect(loader.resources[page0].metadata.pageFile).to.equal('split_font_ab.png');
            expect(loader.resources[page1].metadata.pageFile).to.equal('split_font_cd.png');

            const font = BitmapText.fonts.split_font2;
            const charA = font.chars['A'.charCodeAt(0)];
            const charC = font.chars['C'.charCodeAt(0)];

            expect(charA.page).to.equal(0);
            expect(charC.page).to.equal(1);
            expect(charA.texture.baseTexture.resource.url).to.equal(page0);
            expect(charC.texture.baseTexture.resource.url).to.equal(page1);

            done();
        });
    });

    it('should register bitmap font with side-loaded image', function (done)
    {
        const loader = new Loader();
        const imagePath = path.join(this.resources, 'font.png');
        const fontPath = path.join(this.resources, 'font.fnt');

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
});
