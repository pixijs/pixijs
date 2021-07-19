import { NineSlicePlane } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Texture } from '@pixi/core';
import { expect } from 'chai';

skipHello();

describe('NineSlicePlane', function ()
{
    it('should be able to create an instance', function ()
    {
        const plane = new NineSlicePlane(Texture.WHITE);

        expect(plane).to.be.an.instanceOf(NineSlicePlane);
        expect(plane.leftWidth).equals(10);
        expect(plane.rightWidth).equals(10);
        expect(plane.topHeight).equals(10);
        expect(plane.bottomHeight).equals(10);
        expect(plane.width).equals(Texture.WHITE.width);
        expect(plane.height).equals(Texture.WHITE.height);

        plane.destroy();
    });

    it('shold return correct scaling for NineSlicePlane corners', function ()
    {
        const plane = new NineSlicePlane(Texture.EMPTY, 10, 10, 10, 10);

        plane.width = 100;
        plane.height = 100;
        expect(plane._getMinScale()).to.equal(1);
        plane.width = 10;
        plane.height = 100;
        expect(plane._getMinScale()).to.equal(0.5);
        plane.width = 100;
        plane.height = 10;
        expect(plane._getMinScale()).to.equal(0.5);

        plane.destroy();
    });
});
