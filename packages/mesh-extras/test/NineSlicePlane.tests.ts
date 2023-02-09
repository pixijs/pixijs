import { loadJson, loadTextures } from '@pixi/assets';
import { Texture } from '@pixi/core';
import { NineSlicePlane } from '@pixi/mesh-extras';
import { spritesheetAsset } from '@pixi/spritesheet';
import { clearTextureCache } from '@pixi/utils';
import { Loader } from '../../assets/src/loader/Loader';

import type { Spritesheet } from '@pixi/spritesheet';

describe('NineSlicePlane', () =>
{
    let loader: Loader;
    const serverPath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/mesh-extras/test/resources/`
        : 'http://localhost:8080/mesh-extras/test/resources/';

    beforeEach(() =>
    {
        clearTextureCache();
        loader.reset();
    });

    beforeAll(() =>
    {
        loader = new Loader();
        loader['_parsers'].push(loadJson, loadTextures, spritesheetAsset.loader);
    });

    it('should be able to create an instance', () =>
    {
        const plane = new NineSlicePlane(Texture.WHITE);

        expect(plane).toBeInstanceOf(NineSlicePlane);
        expect(plane.leftWidth).toEqual(10);
        expect(plane.rightWidth).toEqual(10);
        expect(plane.topHeight).toEqual(10);
        expect(plane.bottomHeight).toEqual(10);
        expect(plane.width).toEqual(Texture.WHITE.width);
        expect(plane.height).toEqual(Texture.WHITE.height);

        plane.destroy();
    });

    it('should return correct scaling for NineSlicePlane corners', () =>
    {
        const plane = new NineSlicePlane(Texture.EMPTY, 10, 10, 10, 10);

        plane.width = 100;
        plane.height = 100;
        expect(plane['_getMinScale']()).toEqual(1);
        plane.width = 10;
        plane.height = 100;
        expect(plane['_getMinScale']()).toEqual(0.5);
        plane.width = 100;
        plane.height = 10;
        expect(plane['_getMinScale']()).toEqual(0.5);

        plane.destroy();
    });

    it('should load border values from spritesheet', async () =>
    {
        await loader.load<Spritesheet>(`${serverPath}sheet-9slice.json`);
        const texture = Texture.from('button.png');
        const plane = new NineSlicePlane(texture);

        expect(plane.leftWidth).toEqual(35);
        expect(plane.topHeight).toEqual(36);
        expect(plane.rightWidth).toEqual(37);
        expect(plane.bottomHeight).toEqual(38);
    });

    it('should prefer parameters values to spritesheet values', async () =>
    {
        await loader.load<Spritesheet>(`${serverPath}sheet-9slice.json`);
        const texture = Texture.from('button.png');
        // right+bottom not specified, they are taken from json sprite sheet file:
        const plane = new NineSlicePlane(texture, 40, 40);

        expect(plane.leftWidth).toEqual(40);
        expect(plane.topHeight).toEqual(40);
        expect(plane.rightWidth).toEqual(37);
        expect(plane.bottomHeight).toEqual(38);
    });
});
