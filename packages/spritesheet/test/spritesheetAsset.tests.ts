import { Cache, loadJson, loadTextures } from '@pixi/assets';
import { Texture } from '@pixi/core';
import { spritesheetAsset, spritesheetAssetCache, Spritesheet } from '@pixi/spritesheet';
import { clearTextureCache } from '@pixi/utils';
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
        clearTextureCache();
        spritesheetAssetCache.reset();
    });

    beforeAll(() =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadJson, loadTextures, spritesheetAsset.loader);
    });

    it('should load a spritesheet', async () =>
    {
        const spriteSheet: Spritesheet = await loader.load(`${serverPath}spritesheet.json`);

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
        const spriteSheet = await loader.load(`black.txt`);

        expect(spriteSheet).toBeNull();
    });

    it('should do nothing if the resource is JSON, but improper format', async () =>
    {
        const spriteSheet = await loader.load(`${serverPath}test.json`);

        expect(spriteSheet).not.toBeInstanceOf(Spritesheet);
        expect(spriteSheet).toEqual({ testNumber: 23, testString: 'Test String 23' });
    });

    it('should not create multipack resources when related multi packs is missing', async () =>
    {
        const spritesheet = await loader.load(`${serverPath}building1.json`) as Spritesheet;

        expect(spritesheet.linkedSheets.length).toEqual(0);
    });

    it('should load a multi packed spritesheet', async () =>
    {
        Cache['_parsers'].push(spritesheetAsset.cache as CacheParser);

        const spritesheet = await loader.load(`${serverPath}multi-pack-0.json`) as Spritesheet;

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

    it('should load linked multi packed spritesheets', async () =>
    {
        Cache['_parsers'].push(spritesheetAsset.cache as CacheParser);

        const url0 = `${serverPath}multi-pack-0.json`;
        const url1 = `${serverPath}multi-pack-1.json`;
        const { [url0]: spritesheet0, [url1]: spritesheet1 }
            = await loader.load([url0, url1]) as {[key: string]: Spritesheet};

        expect(spritesheet0.linkedSheets).toEqual([spritesheet1]);
        expect(spritesheet1.linkedSheets).toEqual([spritesheet0]);

        Cache.set('multi-pack-0.json', spritesheet0);
        Cache.set('multi-pack-1.json', spritesheet1);

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

    it('should throw when related multi packs is not an array of string', async () =>
    {
        await expect(async () =>
        {
            await loader.load(`${serverPath}atlas-multipack-wrong-type.json`);
        }).rejects.toThrow();

        await expect(async () =>
        {
            await loader.load(`${serverPath}atlas-multipack-wrong-array.json`);
        }).rejects.toThrow();
    });

    it('should throw when related multi packs do not exist', async () =>
    {
        await expect(async () =>
        {
            await loader.load(`${serverPath}multi-pack-not-exist-0.json`);
        }).rejects.toThrow();
    });

    it('should throw when indirect related multi packs do not exist', async () =>
    {
        await expect(async () =>
        {
            await loader.load(`${serverPath}multi-pack-not-exist-1.json`);
        }).rejects.toThrow();
    });

    it('should throw when related multi packs is not a spritesheet', async () =>
    {
        await expect(async () =>
        {
            await loader.load(`${serverPath}multi-pack-not-spritesheet.json`);
        }).rejects.toThrow();
    });

    it('should unload a spritesheet', async () =>
    {
        const spriteSheet: Spritesheet = await loader.load(`${serverPath}spritesheet.json`);

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
