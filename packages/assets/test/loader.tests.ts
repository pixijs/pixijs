import { Cache, loadJson, loadSVG, loadTextures, loadWebFont } from '@pixi/assets';
import { Texture } from '@pixi/core';
import { Loader } from '../src/loader/Loader';

import type { LoaderParser } from '@pixi/assets';

describe('Loader', () =>
{
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/assets/test/assets/`
        : 'http://localhost:8080/assets/test/assets/';

    beforeEach(() =>
    {
        Cache.reset();
    });

    it('should load a single image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texture = await loader.load<Texture>(`${serverPath}textures/bunny.png`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(26);
        expect(texture.height).toBe(37);
    });

    it('should load an svg', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadSVG);

        const texture = await loader.load<Texture>(`${serverPath}svg/logo.svg`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(512);
        expect(texture.height).toBe(512);
    });

    it('should load svg if autoLoad is true', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadSVG);

        const texture = await loader.load<Texture>({
            src: `${serverPath}svg/logo.svg`,
            data: { resourceOptions: { autoLoad: true } }
        });

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(512);
        expect(texture.height).toBe(512);
    });

    it('should load svg if autoLoad is false', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadSVG);

        const texture = await loader.load<Texture>({
            src: `${serverPath}svg/logo.svg`,
            data: { resourceOptions: { autoLoad: false } }
        });

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(512);
        expect(texture.height).toBe(512);
    });

    it('should allow setting SVG width/height through metadata', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadSVG);

        const texture = await loader.load<Texture>({
            data: {
                resourceOptions: {
                    width: 128,
                    height: 256,
                }
            },
            src: `${serverPath}svg/logo.svg`,
        });

        const { width, height } = texture.baseTexture;

        expect(width).toEqual(128);
        expect(height).toEqual(256);
    });

    it('should load a single image one after multiple loads', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texturesPromises = [];

        for (let i = 0; i < 10; i++)
        {
            texturesPromises.push(loader.load<Texture>(`${serverPath}textures/bunny.png`));
        }

        const textures = await Promise.all(texturesPromises);

        const ogTexture = textures[0];

        textures.forEach((texture) =>
        {
            expect(texture).toBe(ogTexture);
        });
    });

    it('should load multiple images', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const assetsUrls = [`${serverPath}textures/bunny.png`, `${serverPath}textures/bunny-2.png`];

        const textures = await loader.load<Texture>(assetsUrls);

        expect(textures[`${serverPath}textures/bunny.png`]).toBeInstanceOf(Texture);
        expect(textures[`${serverPath}textures/bunny-2.png`]).toBeInstanceOf(Texture);
    });

    it('should load json file', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadJson);

        const json = await loader.load(`${serverPath}json/test.json`);

        expect(json).toEqual({
            testNumber: 23,
            testString: 'Test String 23',
        });
    });

    it('should load a web font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadWebFont);

        const font = await loader.load<FontFace>(`${serverPath}fonts/outfit.woff2`);

        let foundFont = false;

        document.fonts.forEach((f: FontFace) =>
        {
            if (f.family === 'Outfit')
            {
                foundFont = true;
            }
        });

        document.fonts.delete(font);

        expect(foundFont).toBe(true);
    });

    it('should load a web font with custom attributes', async () =>
    {
        const loader = new Loader();

        document.fonts.clear();
        loader['_parsers'].push(loadWebFont);

        const font = await loader.load<FontFace>({
            data: {
                family: 'Overridden',
                style: 'italic',
                weights: ['normal'],
            },
            src: `${serverPath}fonts/outfit.woff2`,
        });

        let count = 0;

        document.fonts.forEach((f: FontFace) =>
        {
            count++;
            expect(f.family).toBe('Overridden');
            expect(f.weight).toBe('normal');
            expect(f.style).toBe('italic');
        });

        document.fonts.delete(font);

        expect(count).toBe(1);
    });

    it('should load with metaData', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push({
            name: 'test',
            test: () => true,
            load: async (url, options) =>
                url + options.data.whatever,
        } as LoaderParser<string>);

        const sillyID = await loader.load<string>({
            src: `${serverPath}textures/bunny.png`,
            data: { whatever: 23 },
        });

        expect(sillyID).toBe(`${serverPath}textures/bunny.png23`);
    });

    it('should unload a texture', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texture = await loader.load<Texture>(`${serverPath}textures/bunny.png`);

        expect(texture.baseTexture.destroyed).toBe(false);

        const baseTexture = texture.baseTexture;

        await loader.unload(`${serverPath}textures/bunny.png`);

        expect(texture.baseTexture).toBe(null);
        expect(baseTexture.destroyed).toBe(true);
    });

    it('should unload a web font', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadWebFont);

        await loader.load(`${serverPath}fonts/outfit.woff2`);

        await loader.unload(`${serverPath}fonts/outfit.woff2`);

        let foundFont = false;

        document.fonts.forEach((f: FontFace) =>
        {
            if (f.family === 'Outfit')
            {
                foundFont = true;
            }
        });

        expect(foundFont).toBe(false);
    });

    it('should throw a warning if a parser specified does not exist', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const spy = jest.spyOn(console, 'warn');

        await loader.load({
            src: `${serverPath}textures/bunny.png`,
            loadParser: 'chicken'
        });

        // eslint-disable-next-line max-len
        expect(spy).toHaveBeenCalledWith(`[Assets] specified load parser "chicken" not found while loading ${serverPath}textures/bunny.png`);

        spy.mockRestore();
    });

    it('should throw a warning if a parser is added with the same name', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);
        loader['_parsers'].push(loadTextures);

        const spy = jest.spyOn(console, 'warn');

        await loader.load({
            src: `${serverPath}textures/bunny.other`,
            loadParser: 'loadTextures'
        });

        // eslint-disable-next-line max-len
        expect(spy).toHaveBeenCalledWith('[Assets] loadParser name conflict "loadTextures"');

        spy.mockRestore();
    });

    it('should load and parse with specified loader', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        const texture = await loader.load({
            src: `${serverPath}textures/bunny.other`,
            loadParser: 'loadTextures'
        });

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(26);
        expect(texture.height).toBe(37);
    });
});
