import { Cache, loadJson, loadTextures } from '@pixi/assets';
import { BaseTexture, Texture, utils } from '@pixi/core';
import { Spritesheet, spritesheetAsset } from '@pixi/spritesheet';
import { Loader } from '../../assets/src/loader/Loader';

import type { CacheParser } from '@pixi/assets';
import type { SpriteSheetJson } from '@pixi/spritesheet';

describe('spritesheetAsset', () =>
{
    let loader: Loader;
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/spritesheet/test/resources/`
        : 'http://localhost:8080/spritesheet/test/resources/';

    afterEach(() =>
    {
        Cache.reset();
        loader.reset();
        utils.clearTextureCache();
    });

    beforeAll(() =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadJson, loadTextures, spritesheetAsset.loader);
    });

    it('should load a spritesheet', async () =>
    {
        const src = `${serverPath}spritesheet.json`;
        const spriteSheet = await loader.load<Spritesheet>(src);

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

        expect(utils.TextureCache['bunny.png']).toBe(bunnyTexture);
        expect(utils.TextureCache['pic-sensei.jpg']).toBe(senseiTexture);

        await loader.unload(src);

        expect(bunnyTexture.baseTexture).toBe(null);
        expect(senseiTexture.baseTexture).toBe(null);
        expect(spriteSheet.baseTexture).toBe(null);
        expect(spriteSheet.textures).toBe(null);
        expect(utils.TextureCache['bunny.png']).toBe(undefined);
        expect(utils.TextureCache['pic-sensei.jpg']).toBe(undefined);
    });

    it('should load a spritesheet with cachePrefix', async () =>
    {
        const src = `${serverPath}spritesheet.json`;
        const data = { cachePrefix: 'spritesheet.json/' };
        const spriteSheet = await loader.load<Spritesheet>({ src, data });

        const bunnyTexture = spriteSheet.textures['bunny.png'];
        const senseiTexture = spriteSheet.textures['pic-sensei.jpg'];

        expect(utils.TextureCache['spritesheet.json/bunny.png']).toBe(bunnyTexture);
        expect(utils.TextureCache['pic-sensei.jpg']).toBe(undefined);
        expect(utils.TextureCache['spritesheet.json/pic-sensei.jpg']).toBe(senseiTexture);
        expect(utils.TextureCache['bunny.png']).toBe(undefined);

        await loader.unload(src);

        expect(utils.TextureCache['spritesheet.json/bunny.png']).toBe(undefined);
        expect(utils.TextureCache['spritesheet.json/pic-sensei.jpg']).toBe(undefined);
    });

    it('should use preloaded texture via data.texture instead of loading texture using imagePath', async () =>
    {
        const src = `${serverPath}spritesheet.json`;
        const preloadedTexture = Texture.from(new BaseTexture());
        const json = await loadJson.load<SpriteSheetJson>(src);
        const spritesheet = await spritesheetAsset.loader.parse<Spritesheet>(
            json,
            {
                src,
                data: { texture: preloadedTexture }
            });

        expect(spritesheet.baseTexture).toEqual(preloadedTexture.baseTexture);
    });

    it('should use image filename via data.imageFilename instead of meta.image', async () =>
    {
        const src = `${serverPath}spritesheet.json`;
        const customImageFilename = 'multi-pack-1.png';
        const json = await loadJson.load<SpriteSheetJson>(src);
        const spritesheet = await spritesheetAsset.loader.parse<Spritesheet>(
            json,
            {
                src,
                data: { imageFilename: customImageFilename }
            }, loader);

        const textureSrc = `${serverPath}${customImageFilename}`;
        const texture = await loader.load({ src: textureSrc });

        expect(spritesheet.baseTexture).toEqual(texture.baseTexture);
        await loader.unload(textureSrc);
    });

    it('should do nothing if the resource is not JSON', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>('black.txt');

        expect(spriteSheet).toBeNull();
    });

    it('should do nothing if the resource is JSON, but improper format', async () =>
    {
        const src = `${serverPath}test.json`;
        const spriteSheet = await loader.load<Spritesheet>(src);

        expect(spriteSheet).not.toBeInstanceOf(Spritesheet);
        expect(spriteSheet).toEqual({ testNumber: 23, testString: 'Test String 23' });
        await loader.unload(src);
    });

    it('should load a multi packed spritesheet', async () =>
    {
        const cacheParser = spritesheetAsset.cache as CacheParser;

        Cache['_parsers'].push(cacheParser);

        const src = `${serverPath}multi-pack-0.json`;
        const spritesheet = await loader.load<Spritesheet>(src);

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

        Cache['_parsers'].splice(Cache['_parsers'].indexOf(cacheParser), 1);

        await loader.unload(src);
    });

    it('should load a spritesheet with cachePrefix and cache parser', async () =>
    {
        const cacheParser = spritesheetAsset.cache as CacheParser;

        Cache['_parsers'].push(cacheParser);

        const src = `${serverPath}spritesheet.json`;
        const cachePrefix = 'spritesheet.json/';
        const data = { cachePrefix };
        const spriteSheet = await loader.load<Spritesheet>({ src, data });

        Cache.set('spritesheet.json', spriteSheet);

        const bunnyTexture = spriteSheet.textures['bunny.png'];
        const senseiTexture = spriteSheet.textures['pic-sensei.jpg'];
        const cacheTexture1 = Cache.get(`${cachePrefix}bunny.png`);
        const cacheTexture2 = Cache.get(`${cachePrefix}pic-sensei.jpg`);

        expect(cacheTexture1).toBeDefined();
        expect(cacheTexture2).toBeDefined();
        expect(cacheTexture1).toBe(bunnyTexture);
        expect(cacheTexture2).toBe(senseiTexture);

        Cache['_parsers'].splice(Cache['_parsers'].indexOf(cacheParser), 1);

        await loader.unload(src);
    });

    it('should not create multipack resources when related_multi_packs field is missing or the wrong type', async () =>
    {
        const validLinked = `${serverPath}building1-1.json`;
        const invalidLinked = `${serverPath}atlas-multipack-wrong-type.json`;
        const invalidLinked2 = `${serverPath}atlas-multipack-wrong-array.json`;

        const spritesheet = await loader.load<Spritesheet>(validLinked);
        const spritesheet2 = await loader.load<Spritesheet>(invalidLinked);
        const spritesheet3 = await loader.load<Spritesheet>(invalidLinked2);

        expect(spritesheet.linkedSheets.length).toEqual(1);
        expect(spritesheet2.linkedSheets.length).toEqual(0);
        expect(spritesheet3.linkedSheets.length).toEqual(0);

        await loader.unload(validLinked);
        await loader.unload(invalidLinked);
        await loader.unload(invalidLinked2);
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
