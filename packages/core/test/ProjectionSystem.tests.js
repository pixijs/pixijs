const { Renderer } = require('../');
const { Point, Rectangle } = require('@pixi/math');

describe('PIXI.ProjectionSystem', function ()
{
    before(function ()
    {
        this.renderer = new Renderer();
    });

    after(function ()
    {
        this.renderer = null;
    });

    it('should calculate a projection-matrix that transforms a source-frame to the clipping rectangle', function ()
    {
        const sourceFrame = new Rectangle(16, 16, 1024, 1024);

        this.renderer.projection.update(null, sourceFrame, 2, true);

        const sourceOrigin = new Point(16, 16);
        const clipOrigin = this.renderer.projection.projectionMatrix.apply(sourceOrigin);

        expect(clipOrigin.x).to.equal(-1);
        expect(clipOrigin.y).to.equal(1);

        const sourceCorner = new Point(1040, 1040);
        const clipCorner = this.renderer.projection.projectionMatrix.apply(sourceCorner);

        expect(clipCorner.x).to.equal(1);
        expect(clipCorner.y).to.equal(-1);
    });
});
