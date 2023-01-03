import { Texture } from '@pixi/core';
import { NineSlicePlane } from '@pixi/mesh-extras';

describe('NineSlicePlane', () =>
{
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

    it('shold return correct scaling for NineSlicePlane corners', () =>
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
});
