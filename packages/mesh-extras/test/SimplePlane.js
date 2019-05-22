const { SimplePlane } = require('../');
const { skipHello } = require('@pixi/utils');
const { Loader } = require('@pixi/loaders');
const { Point } = require('@pixi/math');
const { RenderTexture, Texture } = require('@pixi/core');

skipHello();

// TODO: fix with webglrenderer
describe('PIXI.SimplePlane', function ()
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
            const texture = new RenderTexture.create(20, 30);
            const plane = new SimplePlane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new Point(100, 100);
            const texture = new RenderTexture.create(20, 30);
            const plane = new SimplePlane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.false;
        });
    });
});
