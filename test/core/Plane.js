'use strict';

describe('PIXI.mesh.Plane', function ()
{
    it('should create a plane from an external image', function (done)
    {
        PIXI.loader.add('testBitmap', `file://${__dirname}/../renders/tests/assets/bitmap-1.png`)
            .load(function (loader, resources)
            {
                const plane = new PIXI.mesh.Plane(resources.testBitmap.texture, 100, 100);

                expect(plane.verticesX).to.equal(100);
                expect(plane.verticesY).to.equal(100);
                done();
            });
    });

    it('should create a new empty textured Plane', function ()
    {
        const plane = new PIXI.mesh.Plane(PIXI.Texture.EMPTY, 100, 100);

        expect(plane.verticesX).to.equal(100);
        expect(plane.verticesY).to.equal(100);
    });

    describe('containsPoint', function ()
    {
        it('should return true when point inside', function ()
        {
            const point = new PIXI.Point(10, 10);
            const texture = new PIXI.RenderTexture.create(20, 30);
            const plane = new PIXI.mesh.Plane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new PIXI.Point(100, 100);
            const texture = new PIXI.RenderTexture.create(20, 30);
            const plane = new PIXI.mesh.Plane(texture, 100, 100);

            expect(plane.containsPoint(point)).to.be.false;
        });
    });
});
