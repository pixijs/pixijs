import { Cache } from '../../../src/assets/cache/Cache';
import { Loader } from '../../../src/assets/loader/Loader';
import { loadJson } from '../../../src/assets/loader/parsers/loadJson';
import { loadTextures } from '../../../src/assets/loader/parsers/textures/loadTextures';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Spritesheet } from '../../../src/spritesheet/Spritesheet';
import { spritesheetAsset } from '../../../src/spritesheet/spritesheetAsset';
import { basePath } from '../../assets/basePath';

import type { CacheParser } from '../../../src/assets/cache/CacheParser';
import type { SpriteSheetJson } from '../../../src/spritesheet/spritesheetAsset';

describe('spritesheetAsset', () =>
{
    let loader: Loader;

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
        const spriteSheet = await loader.load<Spritesheet>(`${basePath}spritesheet/spritesheet.json`);

        const bunnyTexture = spriteSheet.textures['bunny.png'];
        const senseiTexture = spriteSheet.textures['pic-sensei.jpg'];

        expect(bunnyTexture).toBeInstanceOf(Texture);
        expect(senseiTexture).toBeInstanceOf(Texture);

        expect(bunnyTexture.width).toBe(7);
        expect(bunnyTexture.height).toBe(10);

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
        const spriteSheet = await loader.load<Spritesheet>(`${basePath}json/test.json`);

        expect(spriteSheet).not.toBeInstanceOf(Spritesheet);
        expect(spriteSheet).toEqual({ testNumber: 23, testString: 'Test String 23' });
    });

    it('should load a multi packed spritesheet', async () =>
    {
        Cache['_parsers'].push(spritesheetAsset.cache as CacheParser);

        const spritesheet = await loader.load<Spritesheet>(`${basePath}spritesheet/multi-pack-0.json`);

        Cache.set('multi-pack-0.json', spritesheet);

        const pack0 = Cache.get('star1.png');
        const pack1 = Cache.get('goldmine_10_5.png');

        expect(pack0).toBeInstanceOf(Texture);
        expect(pack1).toBeInstanceOf(Texture);

        expect(pack0.width).toBe(64);
        expect(pack0.height).toBe(64);

        expect(pack1.width).toBe(190);
        expect(pack1.height).toBe(229);
    });

    it('should not create multipack resources when related_multi_packs field is missing or the wrong type', async () =>
    {
        // clear the caches only to avoid cluttering the output
        Cache.reset();

        const spritesheet = await loader.load<Spritesheet>(`${basePath}spritesheet/building1-1.json`);
        const spritesheet2 = await loader.load<Spritesheet>(`${basePath}spritesheet/atlas-multipack-wrong-type.json`);
        const spritesheet3 = await loader.load<Spritesheet>(`${basePath}spritesheet/atlas-multipack-wrong-array.json`);

        expect(spritesheet.linkedSheets).toHaveLength(1);
        expect(spritesheet2.linkedSheets).toHaveLength(0);
        expect(spritesheet3.linkedSheets).toHaveLength(0);
    });

    it('should unload a spritesheet', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>(`${basePath}spritesheet/spritesheet.json`);

        await loader.unload(`${basePath}spritesheet/spritesheet.json`);

        expect(spriteSheet.textureSource).toBe(null);
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

    it('should use preloaded texture via data.texture instead of loading texture using imagePath', async () =>
    {
        const spritesheetJsonUrl = `${basePath}spritesheet/spritesheet.json`;
        const preloadedTexture = new Texture();
        const json = await loadJson.load<SpriteSheetJson>(spritesheetJsonUrl);
        const spritesheet = await spritesheetAsset.loader.parse<Spritesheet>(
            json,
            {
                src: spritesheetJsonUrl,
                data: { texture: preloadedTexture }
            });

        expect(spritesheet.textureSource).toEqual(preloadedTexture.source);
    });

    it('should use image filename via data.imageFilename instead of meta.image', async () =>
    {
        const spritesheetJsonUrl = `${basePath}spritesheet/spritesheet.json`;
        const customImageFilename = 'multi-pack-1.png';
        const json = await loadJson.load<SpriteSheetJson>(spritesheetJsonUrl);
        const spritesheet = await spritesheetAsset.loader.parse<Spritesheet>(
            json,
            {
                src: spritesheetJsonUrl,
                data: { imageFilename: customImageFilename }
            }, loader);

        const texture = await loader.load({ src: `${basePath}spritesheet/${customImageFilename}` });

        expect(spritesheet.textureSource).toEqual(texture.source);
    });
});
