import { setTimeout } from 'timers/promises';
import '~/spritesheet/init';
import { Assets } from '../Assets';
import { basePath } from '@test-utils';
import { loadTextures } from '~/assets';
import { Texture } from '~/rendering';

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

        const bunny = await Assets.load('textures/bunny.png');
        const bunny2 = await Assets.load({
            src: 'textures/bunny.png'
        });

        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny2).toBeInstanceOf(Texture);
    });

    it('should load assets with resolver', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load<Texture>('textures/texture.{webp,png}');
        const bunny2 = await Assets.load<Texture>({
            src: 'textures/texture.{webp,png}',
            alias: ['bunny-array', 'bunny-array2'],
        });

        expect(Assets.get('bunny-array')).toBe(bunny2);
        expect(Assets.get('bunny-array2')).toBe(bunny2);
        expect(Assets.get('textures/texture.{webp,png}')).toBe(bunny);
        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny2).toBeInstanceOf(Texture);
        expect(bunny.source['_sourceOrigin'].endsWith('.webp')).toBeTrue();
        expect(bunny2.source['_sourceOrigin'].endsWith('.webp')).toBeTrue();
    });

    it('should get assets once loaded', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add({ alias: 'test', src: 'textures/bunny.png' });
        Assets.add({
            alias: 'test1',
            src: 'textures/bunny.png'
        });

        // not loaded yet!
        const bunny0 = Assets.get('test');
        const bunny3 = Assets.get('test1');

        expect(bunny0).toBe(undefined);
        expect(bunny3).toBe(undefined);

        const bunny = await Assets.load('test');
        const bunny4 = await Assets.load('test1');

        const bunny2 = Assets.get('test');
        const bunny5 = Assets.get('test1');

        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny4).toBeInstanceOf(Texture);
        expect(bunny2).toBe(bunny);
        expect(bunny5).toBe(bunny);
    });

    it('should load a webp if available by default', async () =>
    {
        await Assets.init({
            basePath,
            texturePreference: {
                resolution: 2,
            },
        });

        Assets.add({
            alias: 'test', src: [
                'textures/profile-abel@0.5x.jpg',
                'textures/profile-abel@2x.jpg',
                'textures/profile-abel@0.5x.webp',
                'textures/profile-abel@2x.webp',
            ]
        });

        Assets.add({
            alias: 'test2',
            src: [
                'textures/profile-abel@0.5x.jpg',
                'textures/profile-abel@2x.jpg',
                'textures/profile-abel@0.5x.webp',
                'textures/profile-abel@2x.webp',
            ]
        });

        // not loaded yet!
        const bunny = await Assets.load('test');
        const bunny2 = await Assets.load('test2');

        expect(bunny.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/profile-abel@2x.webp`);
        expect(bunny2.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/profile-abel@2x.webp`);
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

        Assets.add({
            alias: 'test', src: [
                'textures/profile-abel@0.5x.jpg',
                'textures/profile-abel@2x.jpg',
                'textures/profile-abel@0.5x.webp',
                'textures/profile-abel@2x.webp',
            ]
        });

        // not loaded yet!
        const bunny = await Assets.load('test');

        expect(bunny.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/profile-abel@2x.jpg`);
    });

    it('should map all names', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add({ alias: ['fish', 'chicken'], src: 'textures/bunny.png' });
        Assets.add({
            alias: ['fish2', 'chicken2'],
            src: 'textures/bunny.png'
        });

        const bunny = await Assets.load('fish');
        const bunny3 = await Assets.load('fish2');

        // this should be the same as bunny
        const bunny2 = await Assets.get('chicken');
        const bunny4 = await Assets.get('chicken2');

        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny3).toBeInstanceOf(Texture);
        expect(bunny).toBe(bunny2);
        expect(bunny3).toBe(bunny4);
    });

    it('should split url versions correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.add({ alias: 'fish', src: 'textures/bunny.{png,webp}' });
        Assets.add({
            alias: 'fish2',
            src: 'textures/bunny.{png,webp}'
        });
        Assets.add({
            alias: 'fish3',
            src: ['textures/bunny.{png,webp}']
        });
        Assets.add({
            alias: 'fish4',
            src: [
                {
                    src: 'textures/bunny.png',
                },

                {
                    src: 'textures/bunny.webp',
                }
            ]
        });

        const bunny = await Assets.load('fish');
        const bunny2 = await Assets.load('fish2');
        const bunny3 = await Assets.load('fish3');
        const bunny4 = await Assets.load('fish4');

        expect(bunny.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/bunny.webp`);
        expect(bunny2.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/bunny.webp`);
        expect(bunny3.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/bunny.webp`);
        expect(bunny4.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/bunny.webp`);
    });

    it('should background load correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        void Assets.backgroundLoad(['textures/bunny.png']);

        await setTimeout(500);

        const asset = await Assets.loader.promiseCache[`${basePath}textures/bunny.png`].promise;

        expect(asset).toBeInstanceOf(Texture);
        expect(asset.baseTexture['_sourceOrigin']).toBe(`${basePath}textures/bunny.png`);
    });

    it('should error out if loader fails', async () =>
    {
        await Assets.load('chickenSandwich.png').catch((e) =>
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

        const bunny = await Assets.load<Texture>('textures/bunny.png');

        bunny.destroy(true);

        expect(bunny.source).toBe(null);

        const bunnyReloaded = await Assets.load<Texture>('textures/bunny.png');

        expect(bunnyReloaded).toBeInstanceOf(Texture);
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

        Assets.add({ alias: ['chickenSheet', 'alias'], src: 'spritesheet/spritesheet.json' });

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

        const bunny = await Assets.load<Texture>('textures/bunny.png');

        await Assets.unload('textures/bunny.png');

        expect(bunny.baseTexture).toBe(null);
    });

    it('should load TXT assets from data URL', async () =>
    {
        let txtDataURL1 = `
        data:text/plain,Hello, world!
        `;

        txtDataURL1 = encodeURI(txtDataURL1.trim());

        const txt1 = await Assets.load(txtDataURL1);

        expect(txt1).toBe('Hello, world!');

        const txtDataURL2 = 'data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==';

        const txt2 = await Assets.load(txtDataURL2);

        expect(txt2).toBe('Hello, world!');
    });

    it('should load JSON assets from data URL', async () =>
    {
        let jsonDataURL1 = `
        data:application/json,
        {
            "text": "Hello, world!",
            "value": 123
        }
        `;

        jsonDataURL1 = encodeURI(jsonDataURL1.trim());

        const json1 = await Assets.load(jsonDataURL1);

        expect(json1).toStrictEqual({ text: 'Hello, world!', value: 123 });

        const jsonDataURL2 = 'data:application/json;base64,eyJ0ZXh0IjoiSGVsbG8sIHdvcmxkISIsInZhbHVlIjogMTIzfQ==';

        const json2 = await Assets.load(jsonDataURL2);

        expect(json2).toStrictEqual({ text: 'Hello, world!', value: 123 });
    });

    it('should load PNG assets from data URL', async () =>
    {
        // Other formats (JPEG, WEBP, AVIF) can be added similarly.
        let bunnyDataURL = `
        data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBggGBQkIBwgKCQkKDRYODQwMDRoTFBAWHxwhIB8cHh
        4jJzIqIyUvJR4eKzssLzM1ODg4ISo9QTw2QTI3ODX/2wBDAQkKCg0LDRkODhk1JB4kNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NT
        U1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTX/wgARCAAlABoDAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABgUHBP/EABkBAA
        MBAQEAAAAAAAAAAAAAAAIDBAUBBv/aAAwDAQACEAMQAAAAfoMjG9G5byxWYwUHfPaNTTmebMAqZ1zJphvFntQwkNP49fdWrUdeIE
        s1xcBAWmGH/8QANRAAAQMCBAQDAg8AAAAAAAAAAgEDBAURAAYSEwcUIWEQFSIxUjI0NkJFVFVicXWBoqTCw//aAAgBAQABPwDiRs
        HGobM3rBfqoBKb+abaNOlYk/Eb4qz8Cmee0mhjsQpnJIwywC7J6XV5nsl27It/h4y6xSIHEFlnLjLLEN+mPG8DCaBMxcZ037oh+G
        d810nMgQIlIkrKciTleds0aBoRp0LoappLqSexcMsTtp0xjPSmWiu6+KtiLaGSoKKikirbsmMpVFqhV2NLqLjpgEN5g3WoxuKpkT
        Cp6ARVS+2eEz7lv7bgB9x19AMeyivVFxxGyrScswoE6jxliPvz9o7PHo0K06VkBV0j1HFAybCqFGalSTdU3evpW1sUygRJ+fjo07
        dditRX3LA8bSqYG0KLcFRfYZYHIGWg+g4B93GdZfqS9Vxxk+T9J/M/8H8QuKjNBY5BX4jmz7xpcMZCqPm3EMZmtHN+myTund1jw4
        zhbIwzvqEsH9Hv3Qm/74oFO8oy5TqfubvKRWmNdratIoN7YyRTdji/mj1/E9f8lxHv228P/8QAHxEAAgIDAAMBAQAAAAAAAAAAAQ
        IAAwQREgUQIRRR/9oACAECAQE/AL2CoWJi5VfJJaY1osJ0dzqZ1qikgwVJYpcHWp426sM4Hydj+zMrU0kzGwBbV0TPHY6qz7nCzL
        +0tqUfqRNBfk8cGBfv1YNrqARF0xPr/8QAHhEAAgICAwEBAAAAAAAAAAAAAQIAAxESBBAhMTL/2gAIAQMBAT8AQEnAgqckSxWA96
        46HfML6kLOUjEAzQyh23xLeQVbAl9hKjE3Mp/Yli1M32cnGAB0h9hhPnX/2Q==
        `;

        // Prevent eslint max-len warning
        bunnyDataURL = bunnyDataURL.replace(/\s/g, '');

        const bunny = await Assets.load(bunnyDataURL);

        expect(bunny).toBeInstanceOf(Texture);
    });

    it('should load SVG assets from data URL', async () =>
    {
        let svgDataURL1 = `
        data:image/svg+xml,
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="25" fill="red"/>
        </svg>
        `;

        svgDataURL1 = encodeURI(svgDataURL1.trim());

        const svg1 = await Assets.load(svgDataURL1);

        expect(svg1).toBeInstanceOf(Texture);

        let svgDataURL2 = `
        data:image/svg+xml;base64,
        PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIw
        IDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjUiIGZpbGw9InJlZCIvPjwvc3ZnPg==
        `;

        svgDataURL2 = svgDataURL2.replace(/\s/g, '');

        const svg2 = await Assets.load(svgDataURL2);

        expect(svg2).toBeInstanceOf(Texture);
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

    it('should not show a cache warning if the same asset is loaded twice', async () =>
    {
        jest.setTimeout(10000);
        await Assets.init({
            basePath,
        });

        const spy = jest.spyOn(console, 'warn');

        await Promise.all([
            Assets.load('textures/bunny.png'),
            Assets.load('textures/bunny.png'),
            Assets.load({ src: 'textures/bunny.1.{png,webp}' }),
            Assets.load({ src: 'textures/bunny.1.{png,webp}' }),
            Assets.load({ src: ['textures/bunny.2.{png,webp}'] }),
            Assets.load({ src: ['textures/bunny.2.{png,webp}'] }),
            Assets.load({
                src: [
                    {
                        src: 'textures/bunny.3.png',
                    },
                    {
                        src: 'textures/bunny.3.webp',
                    }
                ]
            }),
            Assets.load({
                src: [
                    {
                        src: 'textures/bunny.3.png',
                    },
                    {
                        src: 'textures/bunny.3.webp',
                    }
                ]
            }),
            Assets.load({
                src: {
                    src: 'textures/bunny.4.png',
                },
            }),
            Assets.load({
                src: {
                    src: 'textures/bunny.4.png',
                },
            }),
        ]);

        expect(spy).not.toHaveBeenCalled();

        spy.mockRestore();
    });

    it('should load font assets with space in URL', async () =>
    {
        await Assets.init({
            basePath,
        });

        const font = await Assets.load('fonts/url with space.ttf');

        expect(font).toBeInstanceOf(FontFace);
    });

    it('should load font assets with encoded URL', async () =>
    {
        await Assets.init({
            basePath,
        });

        const font = await Assets.load('fonts/url%20with%20space.ttf');

        expect(font).toBeInstanceOf(FontFace);
    });

    it('should append default url params when specified in the constructor', async () =>
    {
        await Assets.init({
            basePath,
            defaultSearchParams: {
                foo: 'bar',
                chicken: 'nuggets',
            },
        });

        Assets.add({ alias: 'bunny', src: 'textures/bunny.png' });
        const bunnyTexture = await Assets.load<Texture>('bunny');

        expect(bunnyTexture['_source']._sourceOrigin).toEqual(`${basePath}textures/bunny.png?foo=bar&chicken=nuggets`);
    });

    it('should support preferences settings', async () =>
    {
        await Assets.init({
            preferences: {
                preferWorkers: false,
            }
        });

        expect(loadTextures.config.preferWorkers).toBe(false);
        Assets.setPreferences({ preferWorkers: true });
        expect(loadTextures.config.preferWorkers).toBe(true);
    });

    it('should remove the asset from the cache when the texture is destroyed', async () =>
    {
        await Assets.init({
            basePath,
        });

        const url = 'textures/bunny.png';
        const texture1 = await Assets.load(url);

        expect(Assets.cache.has(url)).toBeTrue();

        texture1.destroy();

        expect(Assets.cache.has(url)).toBeFalse();

        const texture2 = await Assets.load(url);

        expect(Assets.cache.has(url)).toBeTrue();
        expect(texture2).not.toBe(texture1);

        texture2.destroy();

        expect(Assets.cache.has(url)).toBeFalse();
    });

    it('should remove the asset from the cache when the base texture is destroyed', async () =>
    {
        await Assets.init({
            basePath,
        });

        const url = 'textures/bunny.png';
        const texture1 = await Assets.load(url);

        expect(Assets.cache.has(url)).toBeTrue();

        texture1.baseTexture.destroy();

        expect(Assets.cache.has(url)).toBeFalse();

        const texture2 = await Assets.load(url);

        expect(Assets.cache.has(url)).toBeTrue();
        expect(texture2).not.toBe(texture1);

        texture2.baseTexture.destroy();

        expect(Assets.cache.has(url)).toBeFalse();
    });
});
