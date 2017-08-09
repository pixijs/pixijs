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

                expect(Object.keys(textures).length).to.equal(1);
                expect(Object.keys(spritesheet.textures).length).to.equal(1);
                expect(textures[id]).to.be.an.instanceof(PIXI.Texture);
                expect(textures[id].width).to.equal(spritesheet.data.frames[id].frame.w / spritesheet.resolution);
                expect(textures[id].height).to.equal(spritesheet.data.frames[id].frame.h / spritesheet.resolution);
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
});
