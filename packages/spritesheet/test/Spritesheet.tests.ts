import path from 'path';
import { BaseTexture, Texture } from '@pixi/core';
import { Spritesheet } from '@pixi/spritesheet';

import type { ImageResource } from '@pixi/core';
import type { ISpritesheetData, ISpritesheetFrameData } from '@pixi/spritesheet';

describe('Spritesheet', () =>
{
    let resources: string;
    let validate: (spritesheet: Spritesheet, done: () => void) => void;
    let parseFrame: (frameData: ISpritesheetFrameData, cb: (frame: Texture) => void) => void;

    beforeAll(() =>
    {
        resources = path.join(__dirname, 'resources');
        validate = (spritesheet: Spritesheet, done) =>
        {
            spritesheet.parse().then((textures) =>
            {
                const id = 'goldmine_10_5.png';
                const width = Math.floor(spritesheet.data.frames[id].frame.w);
                const height = Math.floor(spritesheet.data.frames[id].frame.h);

                expect(Object.keys(textures).length).toEqual(5);
                expect(Object.keys(spritesheet.textures).length).toEqual(5);
                expect(textures[id]).toBeInstanceOf(Texture);
                expect(textures[id].width).toEqual(width / spritesheet.resolution);
                expect(textures[id].height).toEqual(height / spritesheet.resolution);
                expect(textures[id].defaultAnchor.x).toEqual(0);
                expect(textures[id].defaultAnchor.y).toEqual(0);
                expect(textures[id].textureCacheIds.indexOf(id)).toEqual(0);

                expect(spritesheet.animations.star).toBeArray();
                expect(spritesheet.animations.star.length).toEqual(4);
                expect(spritesheet.animations.star[0].defaultAnchor.x).toEqual(0.5);
                expect(spritesheet.animations.star[0].defaultAnchor.y).toEqual(0.5);

                spritesheet.destroy(true);
                expect(spritesheet.textures).toBeNull();
                expect(spritesheet.baseTexture).toBeNull();
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

            sheet.parse().then(() =>
            {
                const { frame } = sheet.textures;

                expect(frame).toBeInstanceOf(Texture);

                callback(frame);

                sheet.destroy(true);
            });
        };
    });

    it('should exist on PIXI', () =>
    {
        expect(Spritesheet).toBeInstanceOf(Function);
        expect(Spritesheet.BATCH_SIZE).toBeNumber();
    });

    it('should create an instance', () =>
    {
        const baseTexture = new BaseTexture();
        const data = {
            frames: {},
            meta: {},
        } as unknown as ISpritesheetData;

        const spritesheet = new Spritesheet(baseTexture, data);

        expect(spritesheet.data).toEqual(data);
        expect(spritesheet.baseTexture).toEqual(baseTexture);
        expect(spritesheet.resolution).toEqual(1);

        spritesheet.destroy(true);
    });

    it('should create instance with scale resolution', (done) =>
    {
        jest.setTimeout(10000);
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const data = require(path.resolve(resources, 'building1.json'));
        const image = new Image();

        image.src = path.join(resources, data.meta.image);
        image.onload = () =>
        {
            const baseTexture = new BaseTexture(image, null);
            const spritesheet = new Spritesheet(baseTexture, data);

            expect(data).toBeObject();
            expect(data.meta.image).toEqual('building1.png');
            expect(spritesheet.resolution).toEqual(0.5);
            validate(spritesheet, done);
        };
    });

    it('should create instance with BaseTexture source scale', (done) =>
    {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const data = require(path.resolve(resources, 'building1.json'));
        const baseTexture = BaseTexture.from(data.meta.image);// , undefined, undefined, 1.5);
        const spritesheet = new Spritesheet(baseTexture, data);

        expect(data).toBeObject();
        expect(data.meta.image).toEqual('building1.png');
        expect(spritesheet.resolution).toEqual(0.5);

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

            expect(data).toBeObject();
            expect(data.meta.image).toEqual('building1@2x.png');
            expect(spritesheet.resolution).toEqual(2);

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
            expect(texture.width).toEqual(14);
            expect(texture.height).toEqual(16);
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
            expect(texture.width).toEqual(40);
            expect(texture.height).toEqual(20);
            done();
        });
    });

    it('should parse texture from minimal data', (done) =>
    {
        const data = { frame: { x: 0, y: 0, w: 14, h: 14 } };

        parseFrame(data, (texture) =>
        {
            expect(texture.width).toEqual(14);
            expect(texture.height).toEqual(14);
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
            expect(texture.width).toEqual(14);
            expect(texture.height).toEqual(14);
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
            expect(texture.width).toEqual(120);
            expect(texture.height).toEqual(100);
            done();
        });
    });

    it('should parse scale correctly', () =>
    {
        [
            {
                frames: {},
                meta: { scale: '1' } // scale can be a string
            },
            {
                frames: {},
                meta: { scale: 1 } // scale can be a number
            },
            {
                frames: {},
                meta: {} // if scale not set, default to 1
            } as unknown as ISpritesheetData,
        ].forEach((toTest) =>
        {
            const baseTexture = new BaseTexture();
            const spritesheet = new Spritesheet(baseTexture, toTest);

            expect(spritesheet.resolution).toEqual(1);

            spritesheet.destroy(true);
        });
    });
});
