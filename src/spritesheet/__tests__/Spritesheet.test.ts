import path from 'path';
import { Spritesheet } from '../Spritesheet';
import { getAsset } from '@test-utils';
import { ImageSource, Texture } from '~/rendering';

import type { SpritesheetData, SpritesheetFrameData } from '../Spritesheet';

describe('Spritesheet', () =>
{
    let assets: string;
    let validate: (spritesheet: Spritesheet, done: () => void) => void;
    let parseFrame: (frameData: SpritesheetFrameData, cb: (frame: Texture) => void) => void;

    beforeAll(() =>
    {
        assets = getAsset('spritesheet');
        validate = (spritesheet: Spritesheet, done) =>
        {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            spritesheet.parse().then((textures) =>
            {
                const id = 'goldmine_10_5.png';
                const width = Math.floor(spritesheet.data.frames[id].frame.w);
                const height = Math.floor(spritesheet.data.frames[id].frame.h);

                expect(Object.keys(textures)).toHaveLength(5);
                expect(Object.keys(spritesheet.textures)).toHaveLength(5);
                expect(textures[id]).toBeInstanceOf(Texture);
                expect(textures[id].width).toEqual(width / spritesheet.resolution);
                expect(textures[id].height).toEqual(height / spritesheet.resolution);
                expect(textures[id].defaultAnchor).toBeUndefined();

                expect(spritesheet.animations.star).toBeArray();
                expect(spritesheet.animations.star).toHaveLength(4);
                expect(spritesheet.animations.star[0].defaultAnchor.x).toEqual(0.5);
                expect(spritesheet.animations.star[0].defaultAnchor.y).toEqual(0.5);

                spritesheet.destroy(true);
                expect(spritesheet.textures).toBeNull();
                expect(spritesheet.textureSource).toBeNull();
                done();
            });
        };

        parseFrame = (frameData, callback) =>
        {
            const data = {
                frames: { frame: frameData },
                meta: { scale: 1 },
            } as unknown as SpritesheetData;
            const baseTexture = new Texture({
                source: new ImageSource({ resource: document.createElement('canvas') })
            });

            // @ts-expect-error - hack
            baseTexture.imageUrl = 'test.png';

            const sheet = new Spritesheet(baseTexture, data);

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
        const baseTexture = new Texture();
        const data = {
            frames: {},
            meta: {},
        } as unknown as SpritesheetData;

        const spritesheet = new Spritesheet(baseTexture, data);

        expect(spritesheet.data).toEqual(data);
        expect(spritesheet.textureSource).toEqual(baseTexture.source);
        expect(spritesheet.resolution).toEqual(1);

        spritesheet.destroy(true);
    });

    it('should create instance with scale resolution', () =>
        new Promise<void>(async (done) =>
        {
            jest.setTimeout(10000);
            const data = await fetch(getAsset('spritesheet/building1.json')).then((res) => res.json());
            const image = new Image();

            image.src = path.join(assets, data.meta.image);
            image.onload = () =>
            {
                const baseTexture = new Texture({ source: new ImageSource({ resource: image }) });
                const spritesheet = new Spritesheet(baseTexture, data);

                expect(data).toBeObject();
                expect(data.meta.image).toEqual('building1.png');
                expect(spritesheet.resolution).toEqual(0.5);

                validate(spritesheet, done);
            };
        }));

    // resolution is not being parsed, remains 1
    it('should create instance with filename resolution', () =>
        new Promise<void>(async (done) =>
        {
            const data = await fetch(getAsset('spritesheet/building1@2x.json')).then((res) => res.json());
            const image = new Image();

            image.src = path.join(assets, data.meta.image);
            image.onload = () =>
            {
                const baseTexture = new Texture({
                    source: new ImageSource({ resource: image, resolution: 1 })
                });
                const spritesheet = new Spritesheet(baseTexture, data/* , uri*/);

                expect(data).toBeObject();
                expect(data.meta.image).toEqual('building1@2x.png');
                expect(spritesheet.textureSource.resolution).toEqual(2);

                validate(spritesheet, done);
            };
        }));

    it('should parse full data untrimmed', () =>
        new Promise<void>((done) =>
        {
            const data = {
                frame: { x: 0, y: 0, w: 14, h: 16 },
                rotated: false,
                trimmed: false,
                spriteSourceSize: { x: 0, y: 0, w: 14, h: 16 },
                sourceSize: { w: 14, h: 16 },
            } as SpritesheetFrameData;

            parseFrame(data, (texture) =>
            {
                expect(texture.width).toEqual(14);
                expect(texture.height).toEqual(16);
                done();
            });
        }));

    it('should parse texture from trimmed', () =>
        new Promise<void>((done) =>
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
        }));

    it('should parse texture from minimal data', () =>
        new Promise<void>((done) =>
        {
            const data = { frame: { x: 0, y: 0, w: 14, h: 14 } };

            parseFrame(data, (texture) =>
            {
                expect(texture.width).toEqual(14);
                expect(texture.height).toEqual(14);
                done();
            });
        }));

    it('should parse texture without trimmed or sourceSize', () =>
        new Promise<void>((done) =>
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
        }));

    it('should parse as trimmed if spriteSourceSize is set', () =>
        new Promise<void>((done) =>
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
        }));

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
            } as unknown as SpritesheetData,
        ].forEach((toTest) =>
        {
            const baseTexture = new Texture();
            const spritesheet = new Spritesheet(baseTexture, toTest);

            expect(spritesheet.resolution).toEqual(1);

            spritesheet.destroy(true);
        });
    });
});
