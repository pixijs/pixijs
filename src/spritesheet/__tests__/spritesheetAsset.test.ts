import { Spritesheet } from '../Spritesheet';
import { spritesheetAsset } from '../spritesheetAsset';
import { basePath } from '@test-utils';
import { Cache, Loader, loadJson, loadSvg, loadTextures } from '~/assets';
import { Texture } from '~/rendering';

import type { SpriteSheetJson } from '../spritesheetAsset';
import type { CacheParser } from '~/assets';

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
        loader['_parsers'].push(loadJson, loadTextures, spritesheetAsset.loader, loadSvg);
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

    it('should unload and reload spritesheet', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>(`${basePath}spritesheet/spritesheet.json`);

        await loader.unload(`${basePath}spritesheet/spritesheet.json`);

        const textureSource = spriteSheet.textureSource;

        const spriteSheetReloaded = await loader.load<Spritesheet>(`${basePath}spritesheet/spritesheet.json`);

        expect(spriteSheetReloaded.textureSource).not.toBe(textureSource);
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
        const spritesheet = await spritesheetAsset.loader.parse(
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
        const spritesheet = await spritesheetAsset.loader.parse(
            json,
            {
                src: spritesheetJsonUrl,
                data: { imageFilename: customImageFilename }
            }, loader);

        const texture = await loader.load({ src: `${basePath}spritesheet/${customImageFilename}` });

        expect(spritesheet.textureSource).toEqual(texture.source);
    });

    it('should load a spritesheet where the json file points to an svg', async () =>
    {
        const spriteSheet = await loader.load<Spritesheet>(`${basePath}spritesheet/svgSpritesheet.json`);

        const t1 = spriteSheet.textures['pic1'];
        const t2 = spriteSheet.textures['pic2'];
        const t3 = spriteSheet.textures['pic3'];

        expect(t1).toBeInstanceOf(Texture);
        expect(t2).toBeInstanceOf(Texture);
        expect(t3).toBeInstanceOf(Texture);

        expect(t1.width).toBe(150);
        expect(t1.height).toBe(150);

        expect(t2.width).toBe(200);
        expect(t2.height).toBe(200);

        expect(t3.width).toBe(210);
        expect(t3.height).toBe(210);
    });
});
