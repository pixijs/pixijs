import { Triangle } from '../shapes/Triangle';

describe('Triangle', () =>
{
    it('should create a new triangle', () =>
    {
        const triangle = new Triangle();

        expect(triangle.x).toEqual(0);
        expect(triangle.y).toEqual(0);
        expect(triangle.x2).toEqual(0);
        expect(triangle.y2).toEqual(0);
        expect(triangle.x3).toEqual(0);
        expect(triangle.y3).toEqual(0);
    });

    it('should create a triangle with the given coordinates', () =>
    {
        const triangle = new Triangle(0, 0, 100, 20, 50, 100);

        expect(triangle.x).toEqual(0);
        expect(triangle.y).toEqual(0);
        expect(triangle.x2).toEqual(100);
        expect(triangle.y2).toEqual(20);
        expect(triangle.x3).toEqual(50);
        expect(triangle.y3).toEqual(100);
    });

    describe('strokeContains', () =>
    {
        // Regression test for #12105. The triangle (0,0), (100,20), (50,100)
        // has three edges:
        //   edge A: (0,0) -> (100,20), midpoint (50,10)
        //   edge B: (100,20) -> (50,100)
        //   edge C: (50,100) -> (0,0)
        // Before the fix, edge A's check used `(x2, y3)` = (100, 100) as the
        // second endpoint, so any point on edge A's true line segment was
        // tested against a phantom segment that ran from the origin to
        // (100, 100) instead.
        const triangle = new Triangle(0, 0, 100, 20, 50, 100);

        it('returns true for a point on the first edge', () =>
        {
            // (50, 10) is the midpoint of edge A and lies on the stroke.
            expect(triangle.strokeContains(50, 10, 4)).toBe(true);
        });

        it('returns false for an interior point that is far from every real edge', () =>
        {
            // (50, 50) is the rough centroid - well inside the triangle but
            // not within 4px of any actual edge.
            expect(triangle.strokeContains(50, 50, 4)).toBe(false);
        });

        it('returns false for a point well outside the triangle', () =>
        {
            expect(triangle.strokeContains(500, 500, 4)).toBe(false);
        });

        it('returns true for a point on the second edge', () =>
        {
            // Midpoint of edge B: ((100 + 50) / 2, (20 + 100) / 2) = (75, 60).
            expect(triangle.strokeContains(75, 60, 4)).toBe(true);
        });

        it('returns true for a point on the third edge', () =>
        {
            // Midpoint of edge C: ((50 + 0) / 2, (100 + 0) / 2) = (25, 50).
            expect(triangle.strokeContains(25, 50, 4)).toBe(true);
        });
    });
});