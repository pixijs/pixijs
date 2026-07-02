import { Triangle } from '../shapes/Triangle';

describe('Triangle', () =>
{
    it('should stroke-contain a point on the first edge', () =>
    {
        // vertices (0,0), (100,20), (50,100); first edge is (0,0)->(100,20)
        const triangle = new Triangle(0, 0, 100, 20, 50, 100);

        // (50,10) is the midpoint of the first edge, so it lies on the stroke
        expect(triangle.strokeContains(50, 10, 4)).toBe(true);
    });

    it('should not stroke-contain an interior point far from every edge', () =>
    {
        const triangle = new Triangle(0, 0, 100, 20, 50, 100);

        // (50,50) is well inside the triangle, far from all three edges
        expect(triangle.strokeContains(50, 50, 4)).toBe(false);
    });
});
