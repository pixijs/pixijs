import { segmentIntersection } from '../util';
import { Point } from '~/maths';

describe('segmentIntersection', () =>
{
    it('should return the point where the segments intersect',
        () =>
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(11, 12);
            const bStart = new Point(5, 8);
            const bEnd = new Point(10, 5);

            const intersect = segmentIntersection(aStart, aEnd, bStart, bEnd);

            expect(intersect.x).toEqual(6.25);
            expect(intersect.y).toEqual(7.25);
        });

    it('should return NaN if the segments are parallel',
        () =>
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(11, 12);
            const parallelStart = new Point(5, 6);
            const parallelEnd = new Point(7, 8);

            const parallel = segmentIntersection(aStart, aEnd, parallelStart, parallelEnd);

            expect(parallel.x).toBeNaN();
            expect(parallel.y).toBeNaN();
        });
    it('should return NaN if the segments dont intersect',
        () =>
        {
            const aStart = new Point(1, 2);
            const aEnd = new Point(3, 4);
            const bStart = new Point(5, 8);
            const bEnd = new Point(10, 5);

            const parallel = segmentIntersection(aStart, aEnd, bStart, bEnd);

            expect(parallel.x).toBeNaN();
            expect(parallel.y).toBeNaN();
        });
    it('should return the same reference given', () =>
    {
        // Point
        const aStart = new Point(1, 2);
        const aEnd = new Point(11, 12);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();
        const intersect = segmentIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(intersect).toEqual(outValue);
    });

    it('can output into any IPointData given', () =>
    {
        const aStart = new Point(1, 2);
        const aEnd = new Point(11, 12);
        const bStart = new Point(5, 8);
        const bEnd = new Point(10, 5);
        const outValue = new Point();

        segmentIntersection(aStart, aEnd, bStart, bEnd, outValue);

        expect(outValue.x).toEqual(6.25);
        expect(outValue.y).toEqual(7.25);
    });

    it('can take any IPointData as input', () =>
    {
        const aStart = { x: 1, y: 2 };
        const aEnd = { x: 11, y: 12 };
        const bStart = { x: 5, y: 8 };
        const bEnd = { x: 10, y: 5 };

        const intersect = segmentIntersection(aStart, aEnd, bStart, bEnd);

        expect(intersect.x).toEqual(6.25);
        expect(intersect.y).toEqual(7.25);
    });
});

