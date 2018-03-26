'use strict';

const path = require('path');
const fs = require('fs');

describe('PIXI.loaders.bitmapFontParser', function ()
{
    afterEach(function ()
    {
        for (var font in PIXI.extras.BitmapText.fonts)
        {
            delete PIXI.extras.BitmapText.fonts[font];
        }
        for (var baseTexture in PIXI.utils.BaseTextureCache)
        {
            delete PIXI.utils.BaseTextureCache[baseTexture];
        }
        for (var texture in PIXI.utils.TextureCache)
        {
            delete PIXI.utils.TextureCache[texture];
        }
    });

    before(function (done)
    {
        const resolveURL = (url) => path.resolve(this.resources, url);

        this.resources = path.join(__dirname, 'resources');
        this.fontXML = null;
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

        const loadImage = (url) => new Promise((resolve) =>
        {
            const image = new Image();

            image.onload = () => resolve(image);
            image.src = resolveURL(url);
        });

        Promise.all([
            loadXML('font.fnt'),
            loadXML('font@0.5x.fnt'),
            loadImage('font.png'),
            loadImage('font@0.5x.png'),
            loadImage('atlas.png'),
            loadImage('atlas@0.5x.png'),
        ]).then(([
            fontXML,
            fontScaledXML,
            fontImage,
            fontScaledImage,
            atlasImage,
            atlasScaledImage,
        ]) =>
        {
            this.fontXML = fontXML;
            this.fontScaledXML = fontScaledXML;
            this.fontImage = fontImage;
            this.fontScaledImage = fontScaledImage;
            this.atlasImage = atlasImage;
            this.atlasScaledImage = atlasScaledImage;
            done();
        });
    });

    it('should exist and return a function', function ()
    {
        expect(PIXI.loaders.bitmapFontParser).to.be.a('function');
        expect(PIXI.loaders.bitmapFontParser()).to.be.a('function');
    });

    it('should do nothing if the resource is not XML', function ()
    {
        const spy = sinon.spy();
        const res = {};

        PIXI.loaders.bitmapFontParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is not properly formatted XML', function ()
    {
        const spy = sinon.spy();
        const res = { data: document.createDocumentFragment() };

        PIXI.loaders.bitmapFontParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    // TODO: Test the texture cache code path.
    // TODO: Test the loading texture code path.
    // TODO: Test data-url code paths.

    it('should properly register bitmap font', function (done)
    {
        const texture = new PIXI.Texture(new PIXI.BaseTexture(this.fontImage, null, 1));
        const font = PIXI.extras.BitmapText.registerFont(this.fontXML, texture);

        expect(font).to.be.an.object;
        expect(PIXI.extras.BitmapText.fonts.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0) || 65];

        expect(charA).to.exist;
        expect(charA.texture.baseTexture.source).to.equal(this.fontImage);
        expect(charA.texture.frame.x).to.equal(2);
        expect(charA.texture.frame.y).to.equal(2);
        expect(charA.texture.frame.width).to.equal(19);
        expect(charA.texture.frame.height).to.equal(20);
        const charB = font.chars['B'.charCodeAt(0) || 66];

        expect(charB).to.exist;
        expect(charB.texture.baseTexture.source).to.equal(this.fontImage);
        expect(charB.texture.frame.x).to.equal(2);
        expect(charB.texture.frame.y).to.equal(24);
        expect(charB.texture.frame.width).to.equal(15);
        expect(charB.texture.frame.height).to.equal(20);
        const charC = font.chars['C'.charCodeAt(0) || 67];

        expect(charC).to.exist;
        expect(charC.texture.baseTexture.source).to.equal(this.fontImage);
        expect(charC.texture.frame.x).to.equal(23);
        expect(charC.texture.frame.y).to.equal(2);
        expect(charC.texture.frame.width).to.equal(18);
        expect(charC.texture.frame.height).to.equal(20);
        const charD = font.chars['D'.charCodeAt(0) || 68];

        expect(charD).to.exist;
        expect(charD.texture.baseTexture.source).to.equal(this.fontImage);
        expect(charD.texture.frame.x).to.equal(19);
        expect(charD.texture.frame.y).to.equal(24);
        expect(charD.texture.frame.width).to.equal(17);
        expect(charD.texture.frame.height).to.equal(20);
        const charE = font.chars['E'.charCodeAt(0) || 69];

        expect(charE).to.be.undefined;
        done();
    });

    it('should properly register SCALED bitmap font', function (done)
    {
        const texture = new PIXI.Texture(new PIXI.BaseTexture(this.fontScaledImage, null, 0.5));
        const font = PIXI.extras.BitmapText.registerFont(this.fontScaledXML, texture);

        expect(font).to.be.an.object;
        expect(PIXI.extras.BitmapText.fonts.font).to.equal(font);
        expect(font).to.have.property('chars');
        const charA = font.chars['A'.charCodeAt(0) || 65];

        expect(charA).to.exist;
        expect(charA.texture.baseTexture.source).to.equal(this.fontScaledImage);
        expect(charA.texture.frame.x).to.equal(4); // 2 / 0.5
        expect(charA.texture.frame.y).to.equal(4); // 2 / 0.5
        expect(charA.texture.frame.width).to.equal(38); // 19 / 0.5
        expect(charA.texture.frame.height).to.equal(40); // 20 / 0.5
        const charB = font.chars['B'.charCodeAt(0) || 66];

        expect(charB).to.exist;
        expect(charB.texture.baseTexture.source).to.equal(this.fontScaledImage);
        expect(charB.texture.frame.x).to.equal(4); // 2 / 0.5
        expect(charB.texture.frame.y).to.equal(48); // 24 / 0.5
        expect(charB.texture.frame.width).to.equal(30); // 15 / 0.5
        expect(charB.texture.frame.height).to.equal(40); // 20 / 0.5
        const charC = font.chars['C'.charCodeAt(0) || 67];

        expect(charC).to.exist;
        expect(charC.texture.baseTexture.source).to.equal(this.fontScaledImage);
        expect(charC.texture.frame.x).to.equal(46); // 23 / 0.5
        expect(charC.texture.frame.y).to.equal(4); // 2 / 0.5
        expect(charC.texture.frame.width).to.equal(36); // 18 / 0.5
        expect(charC.texture.frame.height).to.equal(40); // 20 / 0.5
        const charD = font.chars['D'.charCodeAt(0) || 68];

        expect(charD).to.exist;
        expect(charD.texture.baseTexture.source).to.equal(this.fontScaledImage);
        expect(charD.texture.frame.x).to.equal(38); // 19 / 0.5
        expect(charD.texture.frame.y).to.equal(48); // 24 / 0.5
        expect(charD.texture.frame.width).to.equal(34); // 17 / 0.5
        expect(charD.texture.frame.height).to.equal(40); // 20 / 0.5
        const charE = font.chars['E'.charCodeAt(0) || 69];

        expect(charE).to.be.undefined;
        done();
    });

    it('should properly register bitmap font NESTED into spritesheet', function (done)
    {
        const baseTexture = new PIXI.BaseTexture(this.atlasImage, null, 1);
        const spritesheet = new PIXI.Spritesheet(baseTexture, this.atlasJSON);

        spritesheet.parse(() =>
        {
            const fontTexture  = PIXI.Texture.fromFrame('resources/font.png');
            const font =  PIXI.extras.BitmapText.registerFont(this.fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).to.be.an.object;
            expect(PIXI.extras.BitmapText.fonts.font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0) || 65];

            expect(charA).to.exist;
            expect(charA.texture.baseTexture.source).to.equal(this.atlasImage);
            expect(charA.texture.frame.x).to.equal(fontX + 2);
            expect(charA.texture.frame.y).to.equal(fontY + 2);
            expect(charA.texture.frame.width).to.equal(19);
            expect(charA.texture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0) || 66];

            expect(charB).to.exist;
            expect(charB.texture.baseTexture.source).to.equal(this.atlasImage);
            expect(charB.texture.frame.x).to.equal(fontX + 2);
            expect(charB.texture.frame.y).to.equal(fontY + 24);
            expect(charB.texture.frame.width).to.equal(15);
            expect(charB.texture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0) || 67];

            expect(charC).to.exist;
            expect(charC.texture.baseTexture.source).to.equal(this.atlasImage);
            expect(charC.texture.frame.x).to.equal(fontX + 23);
            expect(charC.texture.frame.y).to.equal(fontY + 2);
            expect(charC.texture.frame.width).to.equal(18);
            expect(charC.texture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0) || 68];

            expect(charD).to.exist;
            expect(charD.texture.baseTexture.source).to.equal(this.atlasImage);
            expect(charD.texture.frame.x).to.equal(fontX + 19);
            expect(charD.texture.frame.y).to.equal(fontY + 24);
            expect(charD.texture.frame.width).to.equal(17);
            expect(charD.texture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0) || 69];

            expect(charE).to.be.undefined;
            done();
        });
    });

    it('should properly register bitmap font NESTED into SCALED spritesheet', function (done)
    {
        const baseTexture = new PIXI.BaseTexture(this.atlasScaledImage, null, 1);
        const spritesheet = new PIXI.Spritesheet(baseTexture, this.atlasScaledJSON);

        spritesheet.parse(() =>
        {
            const fontTexture  = PIXI.Texture.fromFrame('resources/font.png');
            const font =  PIXI.extras.BitmapText.registerFont(this.fontXML, fontTexture);
            const fontX = 158; // bare value from spritesheet frame
            const fontY = 2; // bare value from spritesheet frame

            expect(font).to.be.an.object;
            expect(PIXI.extras.BitmapText.fonts.font).to.equal(font);
            expect(font).to.have.property('chars');
            const charA = font.chars['A'.charCodeAt(0) || 65];

            expect(charA).to.exist;
            expect(charA.texture.baseTexture.source).to.equal(this.atlasScaledImage);
            expect(charA.texture.frame.x).to.equal(fontX + 2);
            expect(charA.texture.frame.y).to.equal(fontY + 2);
            expect(charA.texture.frame.width).to.equal(19);
            expect(charA.texture.frame.height).to.equal(20);
            const charB = font.chars['B'.charCodeAt(0) || 66];

            expect(charB).to.exist;
            expect(charB.texture.baseTexture.source).to.equal(this.atlasScaledImage);
            expect(charB.texture.frame.x).to.equal(fontX + 2);
            expect(charB.texture.frame.y).to.equal(fontY + 24);
            expect(charB.texture.frame.width).to.equal(15);
            expect(charB.texture.frame.height).to.equal(20);
            const charC = font.chars['C'.charCodeAt(0) || 67];

            expect(charC).to.exist;
            expect(charC.texture.baseTexture.source).to.equal(this.atlasScaledImage);
            expect(charC.texture.frame.x).to.equal(fontX + 23);
            expect(charC.texture.frame.y).to.equal(fontY + 2);
            expect(charC.texture.frame.width).to.equal(18);
            expect(charC.texture.frame.height).to.equal(20);
            const charD = font.chars['D'.charCodeAt(0) || 68];

            expect(charD).to.exist;
            expect(charD.texture.baseTexture.source).to.equal(this.atlasScaledImage);
            expect(charD.texture.frame.x).to.equal(fontX + 19);
            expect(charD.texture.frame.y).to.equal(fontY + 24);
            expect(charD.texture.frame.width).to.equal(17);
            expect(charD.texture.frame.height).to.equal(20);
            const charE = font.chars['E'.charCodeAt(0) || 69];

            expect(charE).to.be.undefined;
            done();
        });
    });
});

describe('PIXI.loaders.parseBitmapFontData', function ()
{
    it('should exist', function ()
    {
        expect(PIXI.loaders.parseBitmapFontData).to.be.a('function');
    });

    // TODO: Test the parser code.
});
