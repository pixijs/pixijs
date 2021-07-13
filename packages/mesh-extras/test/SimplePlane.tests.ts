import { SimplePlane } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Loader } from '@pixi/loaders';
import { Point } from '@pixi/math';
import { RenderTexture, Texture } from '@pixi/core';
import { expect } from 'chai';

skipHello();

// TODO: fix with webglrenderer
describe('SimplePlane', function ()
{
    it('should create a plane from an external image', function (done)
    {
        const loader = new Loader();

        loader.add('testBitmap', `file://${__dirname}/resources/bitmap-1.png`)
            .load(function (loader, resources)
            {
                const plane = new SimplePlane(resources.testBitmap.texture, 100, 100);

                expect(plane.geometry.segWidth).to.equal(100);
                expect(plane.geometry.segHeight).to.equal(100);
                done();
            });
    });

    it('should create a new empty textured SimplePlane', function ()
    {
        const plane = new SimplePlane(Texture.EMPTY, 100, 100);

        expect(plane.geometry.segWidth).to.equal(100);
        expect(plane.geometry.segHeight).to.equal(100);
    });

    describe('containsPoint', function ()
    {
        it('should return true when point inside', function ()
        {
            const point = new Point(10, 10);
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const plane = new SimplePlane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new Point(100, 100);
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const plane = new SimplePlane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.false;
        });
    });
});
