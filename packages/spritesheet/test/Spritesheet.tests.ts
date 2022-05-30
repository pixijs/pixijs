import { ISpritesheetData, ISpritesheetFrameData, Spritesheet } from '@pixi/spritesheet';
import { BaseTexture, ImageResource, Texture } from '@pixi/core';
import path from 'path';
import { expect } from 'chai';

describe('Spritesheet', () =>
{
    let resources: string;
    let validate: (spritesheet: Spritesheet, done: () => void) => void;
    let parseFrame: (frameData: ISpritesheetFrameData, cb: (frame: Texture) => void) => void;

    before(() =>
    {
        resources = path.join(__dirname, 'resources');
        validate = (spritesheet: Spritesheet, done) =>
        {
            spritesheet.parse((textures) =>
            {
                const id = 'goldmine_10_5.png';
                const width = Math.floor(spritesheet.data.frames[id].frame.w);
                const height = Math.floor(spritesheet.data.frames[id].frame.h);

                expect(Object.keys(textures).length).to.equal(5);
                expect(Object.keys(spritesheet.textures).length).to.equal(5);
                expect(textures[id]).to.be.an.instanceof(Texture);
                expect(textures[id].width).to.equal(width / spritesheet.resolution);
                expect(textures[id].height).to.equal(height / spritesheet.resolution);
                expect(textures[id].defaultAnchor.x).to.equal(0);
                expect(textures[id].defaultAnchor.y).to.equal(0);
                expect(textures[id].textureCacheIds.indexOf(id)).to.equal(0);

                expect(spritesheet.animations).to.have.property('star').that.is.an('array');
                expect(spritesheet.animations.star.length).to.equal(4);
                expect(spritesheet.animations.star[0].defaultAnchor.x).to.equal(0.5);
                expect(spritesheet.animations.star[0].defaultAnchor.y).to.equal(0.5);

                spritesheet.destroy(true);
                expect(spritesheet.textures).to.be.null;
                expect(spritesheet.baseTexture).to.be.null;
                done();
            });
        };

        parseFrame = (frameData, callback) =>
        {
            const data = {
                frames: { frame: frameData },
                meta: { scale: 1 },
            } as unknown as ISpritesheetData;
            const baseTexture = BaseTexture.from(
                document.createElement('canvas')
            ) as BaseTexture<ImageResource>;

            // @ts-expect-error - hack
            baseTexture.imageUrl = 'test.png';

            const sheet = new Spritesheet(baseTexture, data);

            sheet.parse(() =>
            {
                const { frame } = sheet.textures;

                expect(frame).to.be.instanceof(Texture);

                callback(frame);

                sheet.destroy(true);
            });
        };
    });

    it('should exist on PIXI', () =>
    {
        expect(Spritesheet).to.be.a('function');
        expect(Spritesheet.BATCH_SIZE).to.be.a('number');
    });

    it('should create an instance', () =>
    {
        const baseTexture = new BaseTexture();
        const data = {
            frames: {},
            meta: {},
        } as unknown as ISpritesheetData;

        const spritesheet = new Spritesheet(baseTexture, data);

        expect(spritesheet.data).to.equal(data);
        expect(spritesheet.baseTexture).to.equal(baseTexture);
        expect(spritesheet.resolution).to.equal(1);

        spritesheet.destroy(true);
    });

    it('should create instance with scale resolution', (done) =>
    {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const data = require(path.resolve(resources, 'building1.json'));
        const image = new Image();

        image.src = path.join(resources, data.meta.image);
        image.onload = () =>
        {
            const baseTexture = new BaseTexture(image, null);
            const spritesheet = new Spritesheet(baseTexture, data);

            expect(data).to.be.an('object');
            expect(data.meta.image).to.equal('building1.png');
            expect(spritesheet.resolution).to.equal(0.5);
            validate(spritesheet, done);
        };
    });

    it('should create instance with BaseTexture source scale', (done) =>
    {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const data = require(path.resolve(resources, 'building1.json'));
        const baseTexture = BaseTexture.from(data.meta.image);// , undefined, undefined, 1.5);
        const spritesheet = new Spritesheet(baseTexture, data);

        expect(data).to.be.an('object');
        expect(data.meta.image).to.equal('building1.png');
        expect(spritesheet.resolution).to.equal(0.5);

        validate(spritesheet, done);
    });

    it('should create instance with filename resolution', (done) =>
    {
        const uri = path.resolve(resources, 'building1@2x.json');
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const data = require(uri);
        const image = new Image();

        image.src = path.join(resources, data.meta.image);
        image.onload = () =>
        {
            const baseTexture = new BaseTexture(image, { resolution: 1 });
            const spritesheet = new Spritesheet(baseTexture, data, uri);

            expect(data).to.be.an('object');
            expect(data.meta.image).to.equal('building1@2x.png');
            expect(spritesheet.resolution).to.equal(2);

            validate(spritesheet, done);
        };
    });

    it('should parse full data untrimmed', (done) =>
    {
        const data = {
            frame: { x: 0, y: 0, w: 14, h: 16 },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: 14, h: 16 },
            sourceSize: { w: 14, h: 16 },
        } as ISpritesheetFrameData;

        parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(14);
            expect(texture.height).to.equal(16);
            done();
        });
    });

    it('should parse texture from trimmed', (done) =>
    {
        const data = {
            frame: { x: 0, y: 28, w: 14, h: 14 },
            rotated: false,
            trimmed: true,
            spriteSourceSize: { x: 0, y: 0, w: 40, h: 20 },
            sourceSize: { w: 40, h: 20 },
        };

        parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(40);
            expect(texture.height).to.equal(20);
            done();
        });
    });

    it('should parse texture from minimal data', (done) =>
    {
        const data = { frame: { x: 0, y: 0, w: 14, h: 14 } };

        parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(14);
            expect(texture.height).to.equal(14);
            done();
        });
    });

    it('should parse texture without trimmed or sourceSize', (done) =>
    {
        const data = {
            frame: { x: 0, y: 14, w: 14, h: 14 },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: 20, h: 30 },
        };

        parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(14);
            expect(texture.height).to.equal(14);
            done();
        });
    });

    it('should parse as trimmed if spriteSourceSize is set', (done) =>
    {
        // shoebox format
        const data = {
            frame: { x: 0, y: 0, w: 14, h: 16 },
            spriteSourceSize: { x: 0, y: 0, w: 120, h: 100 },
            sourceSize: { w: 120, h: 100 },
        };

        parseFrame(data, (texture) =>
        {
            expect(texture.width).to.equal(120);
            expect(texture.height).to.equal(100);
            done();
        });
    });
});
