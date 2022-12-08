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

        expect(progressMock).toHaveBeenCalledTimes(4);
        expect(progressMock.mock.calls).toEqual([[0.25], [0.5], [0.75], [1]]);
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

        const pathsToLoad = ['textures/bunny.png', 'textures/profile-abel@2x.jpg'];

        const assets = await Assets.load(pathsToLoad);

        for (const path of pathsToLoad)
        {
            expect(assets[path]).toBeInstanceOf(Texture);
        }
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

    it('should load PNG base64 assets', async () =>
    {
        // Other formats (JPG, JPEG, WEBP, AVIF) can be added similarly.
        let bunnyBase64 = `
        data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBggGBQkIBwgKCQkKDRYODQwMDRoTFBAWHxwhIB8c
        Hh4jJzIqIyUvJR4eKzssLzM1ODg4ISo9QTw2QTI3ODX/2wBDAQkKCg0LDRkODhk1JB4kNTU1NTU1NTU1NTU1NTU1NTU1NTU1NT
        U1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTX/wgARCAAlABoDAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABgUHBP/E
        ABkBAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/aAAwDAQACEAMQAAAAfoMjG9G5byxWYwUHfPaNTTmebMAqZ1zJphvFntQwkNP49f
        dWrUdeIEs1xcBAWmGH/8QANRAAAQMCBAQDAg8AAAAAAAAAAgEDBAURAAYSEwcUIWEQFSIxUjI0NkJFVFVicXWBoqTCw//aAAgB
        AQABPwDiRsHGobM3rBfqoBKb+abaNOlYk/Eb4qz8Cmee0mhjsQpnJIwywC7J6XV5nsl27It/h4y6xSIHEFlnLjLLEN+mPG8DCa
        BMxcZ037oh+Gd810nMgQIlIkrKciTleds0aBoRp0LoappLqSexcMsTtp0xjPSmWiu6+KtiLaGSoKKikirbsmMpVFqhV2NLqLjp
        gEN5g3WoxuKpkTCp6ARVS+2eEz7lv7bgB9x19AMeyivVFxxGyrScswoE6jxliPvz9o7PHo0K06VkBV0j1HFAybCqFGalSTdU3e
        vpW1sUygRJ+fjo07dditRX3LA8bSqYG0KLcFRfYZYHIGWg+g4B93GdZfqS9Vxxk+T9J/M/8H8QuKjNBY5BX4jmz7xpcMZCqPm3
        EMZmtHN+myTund1jw4zhbIwzvqEsH9Hv3Qm/74oFO8oy5TqfubvKRWmNdratIoN7YyRTdji/mj1/E9f8lxHv228P/8QAHxEAAg
        IDAAMBAQAAAAAAAAAAAQIAAwQREgUQIRRR/9oACAECAQE/AL2CoWJi5VfJJaY1osJ0dzqZ1qikgwVJYpcHWp426sM4Hydj+zMr
        U0kzGwBbV0TPHY6qz7nCzL+0tqUfqRNBfk8cGBfv1YNrqARF0xPr/8QAHhEAAgICAwEBAAAAAAAAAAAAAQIAAxESBBAhMTL/2g
        AIAQMBAT8AQEnAgqckSxWA9646HfML6kLOUjEAzQyh23xLeQVbAl9hKjE3Mp/Yli1M32cnGAB0h9hhPnX/2Q==
        `;

        // to prevent eslint  max-len warning
        bunnyBase64 = bunnyBase64.replace(/\s/g, '');

        Assets.add('bunny', bunnyBase64);
        const bunny = await Assets.load('bunny');

        expect(bunny).toBeInstanceOf(Texture);
    });

    it('should load TTF assets from data URL', async () =>
    {
        // Smile icon from IcoMoon (https://icomoon.io/#icons-icomoon), CC BY 4.0
        let fontDataURL = `
        data:font/ttf;base64,AAEAAAALAIAAAwAwT1MvMg8SDCkAAAC8AAAAYGNtYXAARu8mAAABHAAAAJhnYXNwAAAAEAAAAbQAAAA
        IZ2x5ZoDPYX8AAAG8AAABaGhlYWQib6aFAAADJAAAADZoaGVhB8IDxgAAA1wAAAAkaG10eAoAAAAAAAOAAAAAFGxvY2EAKADIAAA
        DlAAAAAxtYXhwAAsAaAAAA6AAAAAgbmFtZZlKCfsAAAPAAAABhnBvc3QAAwAAAAAFSAAAACAAAwMAAZAABQAAApkCzAAAAI8CmQL
        MAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAABAAAD//wPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAA
        AAAAGAAAAAwAAADQAAAAEAAAAZAABAAMAAAA0AAEABAAAAGQAAwABAAAANAADAAoAAABkAAQAMAAAAAgACAACAAAAAQAg//3//wA
        AAAAAIP/9//8AAf/jAAMAAQAAAAAAAAAAAAwAAAAAADQAAAAAAAAAAwAAAAAAAAABAAAAAQAAACAAAAAgAAAAAwAB9kIAAfZCAAA
        ABAABAAH//wAPAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAUAAP/
        ABAADwAAbADcAQwBPAGUAAAUyNz4BNzY1NCcuAScmIyIHDgEHBhUUFx4BFxYTMhceARcWFRQHDgEHBiMiJy4BJyY1NDc+ATc2BzQ
        2MzIWFRQGIyImJTQ2MzIWFRQGIyImExcGBw4BBwYjIicuAScmJzceATMyNgIAal1eiygoKCiLXl1qal1eiygoKCiLXl1qVkxMcSA
        hISBxTExWVkxMcSAhISBxTEyqJRsbJSUbGyUBgCUbGyUlGxslQFIVHR1GKSgsLCgpRh0dFVIdZj09ZkAoKIteXWpqXV6LKCgoKIt
        eXWpqXV6LKCgDoCEgcUxMVlZMTHEgISEgcUxMVlZMTHEgIeAbJSUbGyUlGxslJRsbJSX+6DIjHB0pCwsLCykdHCMyMTw8AAEAAAA
        BAACCgfDXXw889QALBAAAAAAA36gxBAAAAADfqDEEAAD/wAQAA8AAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAABAAAAQAAAAA
        AAAAAAAAAAAAAAAUEAAAAAAAAAAAAAAACAAAABAAAAAAAAAAACgAUAB4AtAABAAAABQBmAAUAAAAAAAIAAAAAAAAAAAAAAAAAAAA
        AAAAADgCuAAEAAAAAAAEABwAAAAEAAAAAAAIABwBgAAEAAAAAAAMABwA2AAEAAAAAAAQABwB1AAEAAAAAAAUACwAVAAEAAAAAAAY
        ABwBLAAEAAAAAAAoAGgCKAAMAAQQJAAEADgAHAAMAAQQJAAIADgBnAAMAAQQJAAMADgA9AAMAAQQJAAQADgB8AAMAAQQJAAUAFgA
        gAAMAAQQJAAYADgBSAAMAAQQJAAoANACkaWNvbW9vbgBpAGMAbwBtAG8AbwBuVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADE
        ALgAwaWNvbW9vbgBpAGMAbwBtAG8AbwBuaWNvbW9vbgBpAGMAbwBtAG8AbwBuUmVndWxhcgBSAGUAZwB1AGwAYQByaWNvbW9vbgB
        pAGMAbwBtAG8AbwBuRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACA
        ASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==
        `;

        fontDataURL = fontDataURL.replace(/\s/g, '');

        const font = await Assets.load(fontDataURL);

        expect(font).toBeInstanceOf(FontFace);
    });

    it('should load font assets with space in URL', async () =>
    {
        await Assets.init({
            basePath,
        });

        const font = await Assets.load('fonts/url with space.ttf');

        expect(font).toBeInstanceOf(FontFace);
    });

    it('should not show a cache warning if the same asset is loaded twice', async () =>
    {
        await Assets.init({
            basePath,
        });

        const spy = jest.spyOn(console, 'warn');

        const bunnyPromise = Assets.load('textures/bunny.png');
        const bunnyPromise2 = Assets.load('textures/bunny.png');

        await Promise.all([bunnyPromise, bunnyPromise2]);

        expect(spy).not.toHaveBeenCalled();
    });
});
