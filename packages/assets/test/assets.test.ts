import { Spritesheet, Texture } from 'pixi.js';

import { Assets } from '../src/Assets';

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
            basePath: 'http://localhost:8080/',
        });

        const bunny = await Assets.load('bunny.png');

        expect(bunny).toBeInstanceOf(Texture);
    });

    it('should get assets once loaded', async () =>
    {
        await Assets.init({
            basePath: 'http://localhost:8080/',
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
            basePath: 'http://localhost:8080/',
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

        expect(bunny.baseTexture.resource.src).toBe('http://localhost:8080/profile-abel@2x.webp');
    });

    it('should load a correct texture based on preference', async () =>
    {
        await Assets.init({
            basePath: 'http://localhost:8080/',
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

        expect(bunny.baseTexture.resource.src).toBe('http://localhost:8080/profile-abel@2x.jpg');
    });

    it('should load a bundle', async () =>
    {
        await Assets.init({
            basePath: 'http://localhost:8080/',
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
            basePath: 'http://localhost:8080/',
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
            basePath: 'http://localhost:8080/',
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
            basePath: 'http://localhost:8080/',
        });

        Assets.add('fish', 'bunny.{png,webp}');

        const bunny = await Assets.load('fish');

        expect(bunny.baseTexture.resource.src).toBe('http://localhost:8080/bunny.webp');
    });

    it('should getTexture correctly', async () =>
    {
        await Assets.init({
            basePath: 'http://localhost:8080/',
        });

        const bunny = Assets.getTextureSync('bunny.png');

        expect(bunny.baseTexture).toBe(Texture.EMPTY.baseTexture);

        await Assets.load('bunny.png');

        // TODO - this src will be added in the future..

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(bunny.baseTexture.resource.src).toBe('http://localhost:8080/bunny.png');
    });

    it('should background load correctly', async () =>
    {
        await Assets.init({
            basePath: 'http://localhost:8080/',
        });

        Assets.backgroundLoad(['bunny.png']);

        // wait a bit...
        await wait();

        const asset = Assets.loader.cache[`http://localhost:8080/bunny.png`];

        expect(asset).toBeInstanceOf(Texture);

        // TODO - this src will be added in the future..
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(asset.baseTexture.resource.src).toBe('http://localhost:8080/bunny.png');
    });

    it('should background load bundles', async () =>
    {
        await Assets.init({
            basePath: 'http://localhost:8080/',
            manifest: 'asset-manifest-2.json',
        });

        Assets.backgroundLoadBundle('default');

        // wait a bit...
        await wait();

        const lc = Assets.loader.cache;

        expect(lc['http://localhost:8080/asset-manifest-2.json']).toBeInstanceOf(Object);
        expect(lc['http://localhost:8080/bunny.png']).toBeInstanceOf(Texture);
        expect(lc['http://localhost:8080/profile-abel@2x.webp']).toBeInstanceOf(Texture);
        expect(lc['http://localhost:8080/spritesheet.json']).toBeInstanceOf(Spritesheet);
        expect(lc['http://localhost:8080/spritesheet.png']).toBeInstanceOf(Texture);
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
            basePath: 'http://localhost:8080/',
        });

        await Assets.load('spritesheet.json');

        const texture = Assets.get('pic-sensei.jpg');

        expect(texture).toBeInstanceOf(Texture);
    });
});
