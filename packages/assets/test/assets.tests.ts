import { BaseTexture, Texture } from '@pixi/core';
import { Spritesheet } from '@pixi/spritesheet';

import { Assets } from '@pixi/assets';

function wait(value = 500)
{
    // wait a bit...
    return new Promise<void>((resolve) =>
        setTimeout(() => resolve(), value));
}

describe('Assets', () =>
{
    const basePath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/assets/test/assets/`
        : 'http://localhost:8080/assets/test/assets/';

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

        const bunny = await Assets.load('textures/bunny.png');

        expect(bunny).toBeInstanceOf(Texture);
    });

    it('should get assets once loaded', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add('test', 'textures/bunny.png');

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
            'textures/profile-abel@0.5x.jpg',
            'textures/profile-abel@2x.jpg',
            'textures/profile-abel@0.5x.webp',
            'textures/profile-abel@2x.webp',
        ]);

        // not loaded yet!
        const bunny = await Assets.load('test');

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}textures/profile-abel@2x.webp`);
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
            'textures/profile-abel@0.5x.jpg',
            'textures/profile-abel@2x.jpg',
            'textures/profile-abel@0.5x.webp',
            'textures/profile-abel@2x.webp',
        ]);

        // not loaded yet!
        const bunny = await Assets.load('test');

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}textures/profile-abel@2x.jpg`);
    });

    it('should add and load bundle', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', {
            bunny: 'textures/bunny.{png,webp}',
            spritesheet: 'spritesheet/spritesheet.json',
        });

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should load a bundle found in the manifest', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'json/asset-manifest-2.json',
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
            manifest: 'json/asset-manifest-2.json',
        });

        const progressMock = jest.fn();

        const assets = await Assets.loadBundle(['default', 'data'], progressMock);

        expect(progressMock).toHaveBeenCalledTimes(2);
        expect(progressMock.mock.calls).toEqual([0.5, 1]);
        expect(assets.default.bunny).toBeInstanceOf(Texture);
        expect(assets.default['profile-abel']).toBeInstanceOf(Texture);
        expect(assets.default.spritesheet).toBeInstanceOf(Spritesheet);

        expect(assets.data[`test.json`]).toEqual({ testNumber: 23, testString: 'Test String 23' });
    });

    it('should map all names', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add(['fish', 'chicken'], 'textures/bunny.png');

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

        Assets.add('fish', 'textures/bunny.{png,webp}');

        const bunny = await Assets.load('fish');

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}textures/bunny.webp`);
    });

    it('should background load correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.backgroundLoad(['textures/bunny.png']);

        // wait a bit...
        await wait();

        const asset = await Assets.loader.promiseCache[`${basePath}textures/bunny.png`].promise;

        expect(asset).toBeInstanceOf(Texture);
        expect(asset.baseTexture.resource.src).toBe(`${basePath}textures/bunny.png`);
    });

    it('should background load bundles', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'json/asset-manifest-2.json',
        });

        Assets.backgroundLoadBundle('default');

        // wait a bit...
        await wait();

        const expectTypes = {
            'json/asset-manifest-2.json': Object,
            'textures/bunny.png': Texture,
            'textures/profile-abel@2x.webp': Texture,
            'spritesheet/spritesheet.json': Spritesheet,
            'spritesheet/spritesheet.png': Texture,
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

        await Assets.load('spritesheet/spritesheet.json');

        const texture = Assets.get('pic-sensei.jpg');

        expect(texture).toBeInstanceOf(Texture);
    });

    it('should dispose of a texture correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load('textures/bunny.png') as Texture;

        bunny.destroy(true);

        expect(bunny.baseTexture).toBe(null);

        const bunnyReloaded = await Assets.load('textures/bunny.png') as Texture;

        expect(bunnyReloaded.baseTexture).toBeInstanceOf(BaseTexture);
    });

    it('should load texture array correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', {
            bunny: 'textures/bunny.{png,webp}',
            spritesheet: 'spritesheet/spritesheet.json',
        });

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);

        await Assets.unloadBundle('testBundle');

        expect(assets.bunny.baseTexture).toBe(null);
    });

    it('should unload and remove from the cache correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add(['chickenSheet', 'alias'], 'spritesheet/spritesheet.json');

        await Assets.load('chickenSheet');

        const texture = Assets.get('pic-sensei.jpg');

        expect(texture).toBeInstanceOf(Texture);

        await Assets.unload('chickenSheet');

        const texture2 = Assets.get('pic-sensei.jpg');

        expect(texture2).toBe(undefined);
    });

    it('should unload assets correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load('textures/bunny.png') as Texture;

        await Assets.unload('textures/bunny.png');

        expect(bunny.baseTexture).toBe(null);
    });

    it('should unload bundles correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', {
            bunny: 'textures/bunny.{png,webp}',
            spritesheet: 'spritesheet/spritesheet.json',
        });

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);

        await Assets.unloadBundle('testBundle');

        expect(assets.bunny.baseTexture).toBe(null);
    });
});
