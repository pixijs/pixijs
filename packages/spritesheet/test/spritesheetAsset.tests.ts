import { Cache, loadJson, loadTextures } from '@pixi/assets';
import { Texture, utils } from '@pixi/core';
import { Spritesheet, spritesheetAsset } from '@pixi/spritesheet';
import { Loader } from '../../assets/src/loader/Loader';

import type { CacheParser } from '@pixi/assets';

describe('spritesheetAsset', () =>
{
    let loader: Loader;
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/spritesheet/test/resources/`
        : 'http://localhost:8080/spritesheet/test/resources/';

    beforeEach(() =>
    {
        Cache.reset();
        loader.reset();
    });

    beforeAll(() =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadJson, loadTextures, spritesheetAsset.loader);
    });

    it('should load a spritesheet', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>(`${serverPath}spritesheet.json`);

        const bunnyTexture = spriteSheet.textures['bunny.png'];
        const senseiTexture = spriteSheet.textures['pic-sensei.jpg'];

        expect(bunnyTexture).toBeInstanceOf(Texture);
        expect(senseiTexture).toBeInstanceOf(Texture);

        expect(bunnyTexture.baseTexture).toBe(senseiTexture.baseTexture);

        expect(bunnyTexture.baseTexture.valid).toBe(true);
        expect(bunnyTexture.width).toBe(7);
        expect(bunnyTexture.height).toBe(10);

        expect(senseiTexture.baseTexture.valid).toBe(true);
        expect(senseiTexture.width).toBe(125);
        expect(senseiTexture.height).toBe(125);
    });

    it('should do nothing if the resource is not JSON', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>('black.txt');

        expect(spriteSheet).toBeNull();
    });

    it('should do nothing if the resource is JSON, but improper format', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>(`${serverPath}test.json`);

        expect(spriteSheet).not.toBeInstanceOf(Spritesheet);
        expect(spriteSheet).toEqual({ testNumber: 23, testString: 'Test String 23' });
    });

    it('should load a multi packed spritesheet', async () =>
    {
        Cache['_parsers'].push(spritesheetAsset.cache as CacheParser);

        const spritesheet = await loader.load<Spritesheet>(`${serverPath}multi-pack-0.json`);

        Cache.set('multi-pack-0.json', spritesheet);

        const pack0 = Cache.get('star1.png');
        const pack1 = Cache.get('goldmine_10_5.png');

        expect(pack0).toBeInstanceOf(Texture);
        expect(pack1).toBeInstanceOf(Texture);

        expect(pack0.baseTexture.valid).toBe(true);
        expect(pack0.width).toBe(64);
        expect(pack0.height).toBe(64);

        expect(pack1.baseTexture.valid).toBe(true);
        expect(pack1.width).toBe(190);
        expect(pack1.height).toBe(229);
    });

    it('should not create multipack resources when related_multi_packs field is missing or the wrong type', async () =>
    {
        // clear the caches only to avoid cluttering the output
        utils.clearTextureCache();

        const spritesheet = await loader.load<Spritesheet>(`${serverPath}building1-1.json`);
        const spritesheet2 = await loader.load<Spritesheet>(`${serverPath}atlas-multipack-wrong-type.json`);
        const spritesheet3 = await loader.load<Spritesheet>(`${serverPath}atlas-multipack-wrong-array.json`);

        expect(spritesheet.linkedSheets.length).toEqual(1);
        expect(spritesheet2.linkedSheets.length).toEqual(0);
        expect(spritesheet3.linkedSheets.length).toEqual(0);
    });

    it('should unload a spritesheet', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>(`${serverPath}spritesheet.json`);

        await loader.unload(`${serverPath}spritesheet.json`);

        expect(spriteSheet.baseTexture).toBe(null);
    });

    it('should parse a string sprite sheet correctly', () =>
    {
        [
            {
                url: 'my-sprite-sheet.json',
                pass: false,
            },
            {
                url: 'my-sprite-sheet@0.5x.webp.json',
                pass: true,
                result: {
                    format: 'webp',
                    resolution: 0.5,
                    src: 'my-sprite-sheet@0.5x.webp.json',
                },
            },
            {
                url: 'my-sprite-sheet@2x.png.json',
                pass: true,
                result: {
                    format: 'png',
                    resolution: 2,
                    src: 'my-sprite-sheet@2x.png.json',
                },
            },
            {
                url: 'my-sprite-sheet@2x.json',
                pass: false,
            },
        ].forEach((toTest) =>
        {
            const pass = spritesheetAsset.resolver.test(toTest.url);

            expect(pass).toBe(toTest.pass);

            if (pass)
            {
                expect(spritesheetAsset.resolver.parse(toTest.url)).toEqual(toTest.result);
            }
        });
    });
});
