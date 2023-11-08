import { Point } from '../../src/maths/point/Point';
import { Polygon } from '../../src/maths/shapes/Polygon';

describe('Polygon', () =>
{
    describe('constructor', () =>
    {
        it('should accept a spread of values', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 0, 10);

            expect(polygon.points.length).toEqual(6);
        });

        it('should accept a spread of points', () =>
        {
            const polygon = new Polygon(
                new Point(0, 0),
                new Point(10, 0),
                new Point(0, 10)
            );

            expect(polygon.points.length).toEqual(6);
        });

        it('should accept an array of values', () =>
        {
            const polygon = new Polygon([0, 0, 10, 0, 0, 10]);

            expect(polygon.points.length).toEqual(6);
        });

        it('should accept an array of points', () =>
        {
            const polygon = new Polygon([
                new Point(0, 0),
                new Point(10, 0),
                new Point(0, 10),
            ]);

            expect(polygon.points.length).toEqual(6);
        });
    });

    describe('clone', () =>
    {
        it('should create a copy', () =>
        {
            const polygon1 = new Polygon(0, 0, 10, 0, 0, 10);

            polygon1.closePath = !polygon1.closePath;

            const polygon2 = polygon1.clone();

            expect(polygon1.points.length).toEqual(6);
            expect(polygon1.points.length).toEqual(6);

            for (let i = 0; i < 6; i++)
            {
                expect(polygon1.points[i]).toEqual(polygon2.points[i]);
            }

            expect(polygon1.closePath).toEqual(polygon2.closePath);
            polygon2.points.push(0, 0);

            expect(polygon1.points.length).toEqual(6);
            expect(polygon2.points.length).toEqual(8);
        });
    });

    describe('contains', () =>
    {
        it('should include points inside', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 10, 10, 0, 10, 0, 0);

            expect(polygon.contains(1, 1)).toBe(true);
            expect(polygon.contains(1, 9)).toBe(true);
            expect(polygon.contains(9, 1)).toBe(true);
            expect(polygon.contains(9, 9)).toBe(true);
        });

        it('should exclude bounds', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 10, 10, 0, 10, 0, 0);

            expect(polygon.contains(0, 10)).toBe(false);
            expect(polygon.contains(10, 0)).toBe(false);
            expect(polygon.contains(10, 10)).toBe(false);
        });

        it('should exclude points outside', () =>
        {
            const polygon = new Polygon(0, 0, 10, 0, 10, 10, 0, 10, 0, 0);

            expect(polygon.contains(-1, -1)).toBe(false);
            expect(polygon.contains(-1, 11)).toBe(false);
            expect(polygon.contains(11, -1)).toBe(false);
            expect(polygon.contains(11, 11)).toBe(false);
        });
    });
});
