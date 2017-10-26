const { Spritesheet } = require('../');
const { BaseTexture, Texture } = require('@pixi/core');
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
                const width = Math.floor(spritesheet.data.frames[id].frame.w);
                const height = Math.floor(spritesheet.data.frames[id].frame.h);

                expect(Object.keys(textures).length).to.equal(1);
                expect(Object.keys(spritesheet.textures).length).to.equal(1);
                expect(textures[id]).to.be.an.instanceof(Texture);
                expect(textures[id].width).to.equal(width / spritesheet.resolution);
                expect(textures[id].height).to.equal(height / spritesheet.resolution);
                expect(textures[id].textureCacheIds.indexOf(id)).to.equal(0);
                spritesheet.destroy(true);
                expect(spritesheet.textures).to.be.null;
                expect(spritesheet.baseTexture).to.be.null;
                done();
            });
        };
    });

    it('should exist on PIXI', function ()
    {
        expect(Spritesheet).to.be.a.function;
        expect(Spritesheet.BATCH_SIZE).to.be.a.number;
    });

    it('should create an instance', function ()
    {
        const baseTexture = new BaseTexture();
        const data = {
            frames: {},
            meta: {},
        };

        const spritesheet = new Spritesheet(baseTexture, data);

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
            const baseTexture = new BaseTexture(image, null, 1);
            const spritesheet = new Spritesheet(baseTexture, data);

            expect(data).to.be.an.object;
            expect(data.meta.image).to.equal('building1.png');
            expect(spritesheet.resolution).to.equal(0.5);
            this.validate(spritesheet, done);
        };
    });

    it('should create instance with BaseTexture source scale', function (done)
    {
        const data = require(path.resolve(this.resources, 'building1.json')); // eslint-disable-line global-require
        const baseTexture = new BaseTexture.fromImage(data.meta.image, undefined, undefined, 1.5);
        const spritesheet = new Spritesheet(baseTexture, data);

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
            const baseTexture = new BaseTexture(image, null, 1);
            const spritesheet = new Spritesheet(baseTexture, data, uri);

            expect(data).to.be.an.object;
            expect(data.meta.image).to.equal('building1@2x.png');
            expect(spritesheet.resolution).to.equal(2);

            this.validate(spritesheet, done);
        };
    });
});
