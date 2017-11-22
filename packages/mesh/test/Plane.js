const { Plane } = require('../');
const { isWebGLSupported, skipHello } = require('@pixi/utils');
const { Loader } = require('@pixi/loaders');
const { Point } = require('@pixi/math');
const { RenderTexture, Texture } = require('@pixi/core');

skipHello();

function withGL(fn)
{
    return isWebGLSupported() ? fn : undefined;
}

// TODO: fix with webglrenderer
describe('PIXI.mesh.Plane', function ()
{
    it.skip('should create a plane from an external image', withGL(function (done)
    {
        const loader = new Loader();

        loader.add('testBitmap', `file://${__dirname}/resources/bitmap-1.png`)
            .load(function (loader, resources)
            {
                const plane = new Plane(resources.testBitmap.texture, 100, 100);

                expect(plane.verticesX).to.equal(100);
                expect(plane.verticesY).to.equal(100);
                done();
            });
    }));

    it.skip('should create a new empty textured Plane', withGL(function ()
    {
        const plane = new Plane(Texture.EMPTY, 100, 100);

        expect(plane.verticesX).to.equal(100);
        expect(plane.verticesY).to.equal(100);
    }));

    describe('containsPoint', function ()
    {
        it.skip('should return true when point inside', withGL(function ()
        {
            const point = new Point(10, 10);
            const texture = new RenderTexture.create(20, 30);
            const plane = new Plane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.true;
        }));

        it.skip('should return false when point outside', withGL(function ()
        {
            const point = new Point(100, 100);
            const texture = new RenderTexture.create(20, 30);
            const plane = new Plane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.false;
        }));
    });
});
