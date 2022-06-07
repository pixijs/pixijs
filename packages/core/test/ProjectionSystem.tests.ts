import { Renderer } from '@pixi/core';
import { Point, Rectangle } from '@pixi/math';
import { expect } from 'chai';

describe('ProjectionSystem', () =>
{
    let renderer: Renderer;

    before(() =>
    {
        renderer = new Renderer();
    });

    after(() =>
    {
        renderer = null;
    });

    it('should calculate a projection-matrix that transforms a source-frame to the clipping rectangle', () =>
    {
        const sourceFrame = new Rectangle(16, 16, 1024, 1024);

        renderer.projection.update(null, sourceFrame, 2, true);

        const sourceOrigin = new Point(16, 16);
        const clipOrigin = renderer.projection.projectionMatrix.apply(sourceOrigin);

        expect(clipOrigin.x).to.equal(-1);
        expect(clipOrigin.y).to.equal(1);

        const sourceCorner = new Point(1040, 1040);
        const clipCorner = renderer.projection.projectionMatrix.apply(sourceCorner);

        expect(clipCorner.x).to.equal(1);
        expect(clipCorner.y).to.equal(-1);
    });
});
