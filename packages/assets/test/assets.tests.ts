import { Spritesheet } from '@pixi/spritesheet';
import { BaseTexture, Texture } from '@pixi/core';

import { Assets } from '../src/Assets';

// eslint-disable-next-line max-len
const basePath = 'https://raw.githubusercontent.com/pixijs/pixijs/864d41d92e987da1d2da2bf893c67d14a731763a/packages/assets/test/assets/';

function wait(value = 500)
{
    // wait a bit...
    return new Promise<void>((resolve) =>
        setTimeout(() => resolve(), value));
}

describe('Assets', () =>
{
    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load assets', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load('bunny.png');

        expect(bunny).toBeInstanceOf(Texture);
    });

    it('should get assets once loaded', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add('test', 'bunny.png');

        // not loaded yet!
        const bunny0 = Assets.get('test');

        expect(bunny0).toBe(undefined);

        const bunny = await Assets.load('test');

        const bunny2 = Assets.get('test');

        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny2).toBe(bunny);
    });

    it('should load a webp if available by default', async () =>
    {
        await Assets.init({
            basePath,
            texturePreference: {
                resolution: 2,
            },
        });

        Assets.add('test', [
            'profile-abel@0.5x.jpg',
            'profile-abel@2x.jpg',
            'profile-abel@0.5x.webp',
            'profile-abel@2x.webp',
        ]);

        // not loaded yet!
        const bunny = await Assets.load('test');

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}profile-abel@2x.webp`);
    });

    it('should load a correct texture based on preference', async () =>
    {
        await Assets.init({
            basePath,
            texturePreference: {
                format: 'jpg',
                resolution: 2,
            },
        });

        Assets.add('test', [
            'profile-abel@0.5x.jpg',
            'profile-abel@2x.jpg',
            'profile-abel@0.5x.webp',
            'profile-abel@2x.webp',
        ]);

        // not loaded yet!
        const bunny = await Assets.load('test');

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}profile-abel@2x.jpg`);
    });

    it('should add and load bundle', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', {
            bunny: 'bunny.{png,webp}',
            spritesheet: 'spritesheet.json',
        });

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should load a bundle found in the manifest', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'asset-manifest-2.json',
        });

        const assets = await Assets.loadBundle('default');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets['profile-abel']).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should load multiple bundles', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'asset-manifest-2.json',
        });

        // TODO if its an array of one.. return the single object
        const assets = await Assets.loadBundle(['default', 'data']);

        expect(assets.default.bunny).toBeInstanceOf(Texture);
        expect(assets.default['profile-abel']).toBeInstanceOf(Texture);
        expect(assets.default.spritesheet).toBeInstanceOf(Spritesheet);

        expect(assets.data[`test.json`]).toEqual({ testNumber: 23, testString: 'Test String 23' });
    });

    it('should map all names', async () =>
    {
        Assets.init({
            basePath,
        });

        Assets.add(['fish', 'chicken'], 'bunny.png');

        const bunny = await Assets.load('fish');

        // this should be the same as bunny
        const bunny2 = await Assets.get('chicken');

        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny).toBe(bunny2);
    });

    it('should split url versions correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add('fish', 'bunny.{png,webp}');

        const bunny = await Assets.load('fish');

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}bunny.webp`);
    });

    it('should getTextureSync correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = Assets.getTextureSync('bunny.png');

        expect(bunny.baseTexture).toBe(Texture.EMPTY.baseTexture);

        await Assets.load('bunny.png');

        // TODO - this src will be added in the future..
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(bunny.baseTexture.resource.src).toBe(`${basePath}bunny.png`);
    });

    it('should return the same texture when calling getTextureSync', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = Assets.getTextureSync('bunny.png');
        const bunny2 = Assets.getTextureSync('bunny.png');

        expect(bunny2).toBe(bunny);

        await Assets.load('bunny.png');

        // TODO - this src will be added in the future..
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(bunny.baseTexture.resource.src).toBe(`${basePath}bunny.png`);
    });

    it('should background load correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.backgroundLoad(['bunny.png']);

        // wait a bit...
        await wait();

        const asset = await Assets.loader.promiseCache[`${basePath}bunny.png`].promise;

        expect(asset).toBeInstanceOf(Texture);
        // TODO - this src will be added in the future..
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(asset.baseTexture.resource.src).toBe(`${basePath}bunny.png`);
    });

    it('should background load bundles', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'asset-manifest-2.json',
        });

        Assets.backgroundLoadBundle('default');

        // wait a bit...
        await wait();

        const expectTypes = {
            'asset-manifest-2.json': Object,
            'bunny.png': Texture,
            'profile-abel@2x.webp': Texture,
            'spritesheet.json': Spritesheet,
            'spritesheet.png': Texture,
        };

        for (const [key, type] of Object.entries(expectTypes))
        {
            const asset = await Assets.loader.promiseCache[basePath + key].promise;

            expect(asset).toBeInstanceOf(type);
        }
    });

    it('should error out if loader fails', async () =>
    {
        Assets.load('chickenSandwich.png').catch((e) =>
        {
            expect(e).toBeInstanceOf(Error);
        });
    });

    it('should add sprite textures to the cache', async () =>
    {
        await Assets.init({
            basePath,
        });

        await Assets.load('spritesheet.json');

        const texture = Assets.get('pic-sensei.jpg');

        expect(texture).toBeInstanceOf(Texture);
    });

    it('should dispose of a texture correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load('bunny.png') as Texture;

        bunny.destroy(true);

        expect(bunny.baseTexture).toBe(null);

        const bunnyReloaded = await Assets.load('bunny.png') as Texture;

        expect(bunnyReloaded.baseTexture).toBeInstanceOf(BaseTexture);
    });

    it('should unload assets correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load('bunny.png') as Texture;

        await Assets.unload('bunny.png');

        expect(bunny.baseTexture).toBe(null);
    });

    it('should unload bundles correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', {
            bunny: 'bunny.{png,webp}',
            spritesheet: 'spritesheet.json',
        });

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);

        await Assets.unloadBundle('testBundle');

        expect(assets.bunny.baseTexture).toBe(null);
    });
});
