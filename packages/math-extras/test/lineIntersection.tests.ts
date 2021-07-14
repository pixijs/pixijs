import { Point } from '@pixi/math';
import { lineIntersection } from '@pixi/math-extras';
import { expect } from 'chai';

describe('lineIntersection', function ()
{
    it('should return the point where the lines intersect',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(3, 4);
            const bStart = new Point(5, 8);
            const bEnd = new Point(10, 5);

            const intersect = lineIntersection(aStart, aEnd, bStart, bEnd);

            expect(intersect.x).to.equal(6.25);
            expect(intersect.y).to.equal(7.25);
        });

    it('should return NaN if the lines are parallel',
        function ()
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(3, 4);
            const parallelStart = new Point(5, 6);
            const parallelEnd = new Point(7, 8);

            const parallel = lineIntersection(aStart, aEnd, parallelStart, parallelEnd);

            expect(parallel.x).to.be.NaN;
            expect(parallel.y).to.be.NaN;
        });
    it('should return the same reference given', function ()
    {
        // Point
        const aStart = new Point(1, 2);
        const aEnd = new Point(3, 4);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();
        const intersect = lineIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(intersect).to.equal(outValue);
    });

    it('can output into any IPointData given', function ()
    {
        const aStart = new Point(1, 2);
        const aEnd = new Point(3, 4);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();

        lineIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(outValue.x).to.equal(6.25);
        expect(outValue.y).to.equal(7.25);
    });

    it('can take any IPointData as input', function ()
    {
        const aStart = { x: 1, y: 2 };
        const aEnd = { x: 3, y: 4 };
        const bStart = { x: 5, y: 8 };
        const bEnd = { x: 10, y: 5 };

        const intersect = lineIntersection(aStart, aEnd, bStart, bEnd);

        expect(intersect.x).to.equal(6.25);
        expect(intersect.y).to.equal(7.25);
    });
});
