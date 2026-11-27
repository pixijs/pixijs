import { GraphicsPath } from '../path/GraphicsPath';

import type { Polygon } from '~/maths';

describe('ShapePath after closePath', () =>
{
    const shapes = (path: GraphicsPath) =>
        path.shapePath.shapePrimitives.map((primitive) => (primitive.shape as Polygon).points);

    it('should start the next segment at the start of the closed subpath', () =>
    {
        // like the canvas API, closePath moves the current point back to the start of the subpath
        const path = new GraphicsPath()
            .moveTo(10, 10)
            .lineTo(15, 10)
            .lineTo(15, 15)
            .closePath()
            .lineTo(20, 10);

        expect(shapes(path)).toEqual([
            [10, 10, 15, 10, 15, 15],
            [10, 10, 20, 10],
        ]);
    });

    it('should do the same for an SVG path that keeps drawing after Z', () =>
    {
        expect(shapes(new GraphicsPath('M10 10 h5 v5 Z h10'))).toEqual([
            [10, 10, 15, 10, 15, 15],
            [10, 10, 20, 10],
        ]);
    });

    it('should not throw for an arc right after closePath', () =>
    {
        const path = new GraphicsPath('M10 10 h5 v5 Z A5 5 0 0 1 20 10');

        expect(() => path.shapePath).not.toThrow();

        const arc = shapes(path)[1];

        expect(arc.slice(0, 2)).toEqual([10, 10]);
        expect(arc[arc.length - 2]).toBeCloseTo(20);
        expect(arc[arc.length - 1]).toBeCloseTo(10);
    });

    it('should start the next segment at a closed moveTo point', () =>
    {
        expect(shapes(new GraphicsPath('M50 50 Z L60 60'))).toEqual([[50, 50, 60, 60]]);
    });
});
