'use strict';

const path = require('path');

describe('PIXI.Spritesheet', function ()
{
    before(function ()
    {
        this.resources = path.join(__dirname, 'resources');
        this.validate = function (spritesheet, done)
        {
            spritesheet.parse(function (textures)
            {
                const id = 'goldmine_10_5.png';
                const width = Math.floor(spritesheet.data.frames[id].frame.w * spritesheet.baseTexture.sourceScale);
                const height = Math.floor(spritesheet.data.frames[id].frame.h * spritesheet.baseTexture.sourceScale);

                expect(Object.keys(textures).length).to.equal(1);
                expect(Object.keys(spritesheet.textures).length).to.equal(1);
                expect(textures[id]).to.be.an.instanceof(PIXI.Texture);
                expect(textures[id].width).to.equal(width / spritesheet.resolution);
                expect(textures[id].height).to.equal(height / spritesheet.resolution);
                expect(textures[id].textureCacheIds.indexOf(id)).to.equal(0);
                spritesheet.destroy(true);
                expect(spritesheet.textures).to.be.null;
                expect(spritesheet.baseTexture).to.be.null;
                done();
            });
        };

        this.parseFrame = function (frameData, callback)
        {
            const data = {
                frames: { frame: frameData },
                meta: { scale: 1 },
            };
            const baseTexture = PIXI.BaseTexture.fromCanvas(
                document.createElement('canvas')
            );

            baseTexture.imageUrl = 'test.png';

            const sheet = new PIXI.Spritesheet(baseTexture, data);

            sheet.parse(() =>
            {
                const { frame } = sheet.textures;

                expect(frame).to.be.instanceof(PIXI.Texture);

                callback(frame);

                sheet.destroy(true);
            });
        };
    });

    it('should exist on PIXI', function ()
    {
        expect(PIXI.Spritesheet).to.be.a.function;
        expect(PIXI.Spritesheet.BATCH_SIZE).to.be.a.number;
    });

    it('should create an instance', function ()
    {
        const baseTexture = new PIXI.BaseTexture();
        const data = {
            frames: {},
            meta: {},
        };
        const spritesheet = new PIXI.Spritesheet(baseTexture, data);

        expect(spritesheet.data).to.equal(data);
        expect(spritesheet.baseTexture).to.equal(baseTexture);
        expect(spritesheet.resolution).to.equal(1);

        spritesheet.destroy(true);
    });

    it('should create instance with scale resolution', function (done)
    {
        const data = require(path.resolve(this.resources, 'building1.json')); // eslint-disable-line global-require
        const image = new Image();

        image.src = path.join(this.resources, data.meta.image);
        image.onload = () =>
        {
            const baseTexture = new PIXI.BaseTexture(image, null, 1);
            const spritesheet = new PIXI.Spritesheet(baseTexture, data);

            expect(data).to.be.an.object;
            expect(data.meta.image).to.equal('building1.png');
            expect(spritesheet.resolution).to.equal(0.5);

            this.validate(spritesheet, done);
        };
    });

    it('should create instance with BaseTexture source scale', function (done)
    {
        const data = require(path.resolve(this.resources, 'building1.json')); // eslint-disable-line global-require
        const baseTexture = new PIXI.BaseTexture.fromImage(data.meta.image, undefined, undefined, 1.5);
        const spritesheet = new PIXI.Spritesheet(baseTexture, data);

        expect(data).to.be.an.object;
        expect(data.meta.image).to.equal('building1.png');
        expect(spritesheet.resolution).to.equal(0.5);

        this.validate(spritesheet, done);
    });

    it('should create instance with filename resolution', function (done)
    {
        const uri = path.resolve(this.resources, 'building1@2x.json');
        const data = require(uri); // eslint-disable-line global-require
        const image = new Image();

        image.src = path.join(this.resources, data.meta.image);
        image.onload = () =>
        {
            const baseTexture = new PIXI.BaseTexture(image, null, 1);
            const spritesheet = new PIXI.Spritesheet(baseTexture, data, uri);

            expect(data).to.be.an.object;
            expect(data.meta.image).to.equal('building1@2x.png');
            expect(spritesheet.resolution).to.equal(2);

            this.validate(spritesheet, done);
        };
    });

    it('should parse full data untrimmed', function (done)
    {
        const data = {
            frame: { x: 0, y: 0, w: 14, h: 16 },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: 14, h: 16 },
            sourceSize: { w: 14, h: 16 },
        };

        this.parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(14);
            expect(texture.height).to.equal(16);
            done();
        });
    });

    it('should parse texture from trimmed', function (done)
    {
        const data = {
            frame: { x: 0, y: 28, w: 14, h: 14 },
            rotated: false,
            trimmed: true,
            spriteSourceSize: { x: 0, y: 0, w: 40, h: 20 },
            sourceSize: { w: 40, h: 20 },
        };

        this.parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(40);
            expect(texture.height).to.equal(20);
            done();
        });
    });

    it('should parse texture from minimal data', function (done)
    {
        const data = { frame: { x: 0, y: 0, w: 14, h: 14 } };

        this.parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(14);
            expect(texture.height).to.equal(14);
            done();
        });
    });

    it('should parse texture without trimmed or sourceSize', function (done)
    {
        const data = {
            frame: { x: 0, y: 14, w: 14, h: 14 },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: 20, h: 30 },
        };

        this.parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(14);
            expect(texture.height).to.equal(14);
            done();
        });
    });

    it('should parse as trimmed if spriteSourceSize is set', function (done)
    {
        // shoebox format
        const data = {
            frame: { x: 0, y: 0, w: 14, h: 16 },
            spriteSourceSize: { x: 0, y: 0, w: 120, h: 100 },
            sourceSize: { w: 120, h: 100 },
        };

        this.parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(120);
            expect(texture.height).to.equal(100);
            done();
        });
    });
});
