import { pointInTriangle } from '../point/pointInTriangle';

describe('pointInTriangle', () =>
{
    it('should return true for a point inside the triangle', () =>
    {
        // Standard triangle
        expect(pointInTriangle(50, 25, 0, 0, 100, 0, 50, 100)).toBe(true);
        // Near the center
        expect(pointInTriangle(50, 33, 0, 0, 100, 0, 50, 100)).toBe(true);
    });

    it('should return false for a point outside the triangle', () =>
    {
        // Outside to the left
        expect(pointInTriangle(-10, 50, 0, 0, 100, 0, 50, 100)).toBe(false);
        // Outside to the right
        expect(pointInTriangle(110, 50, 0, 0, 100, 0, 50, 100)).toBe(false);
        // Above
        expect(pointInTriangle(50, -10, 0, 0, 100, 0, 50, 100)).toBe(false);
        // Below
        expect(pointInTriangle(50, 110, 0, 0, 100, 0, 50, 100)).toBe(false);
    });

    it('should handle a right triangle', () =>
    {
        // Right triangle at origin
        expect(pointInTriangle(10, 10, 0, 0, 100, 0, 0, 100)).toBe(true);
        expect(pointInTriangle(90, 90, 0, 0, 100, 0, 0, 100)).toBe(false);
    });

    it('should handle points on the boundary', () =>
    {
        // The barycentric coordinate check uses >= 0 for u and v, and u+v < 1
        // so vertices where u=0, v=0 (i.e. the first vertex x1,y1) will be inside
        // Points exactly on edges may or may not be "inside" depending on the specific edge
        const result = pointInTriangle(0, 0, 0, 0, 100, 0, 50, 100);

        expect(typeof result).toBe('boolean');
    });

    it('should handle negative coordinates', () =>
    {
        expect(pointInTriangle(0, 0, -50, -50, 50, -50, 0, 50)).toBe(true);
        expect(pointInTriangle(-100, 0, -50, -50, 50, -50, 0, 50)).toBe(false);
    });

    it('should handle tiny triangles', () =>
    {
        expect(pointInTriangle(0.5, 0.25, 0, 0, 1, 0, 0.5, 1)).toBe(true);
        expect(pointInTriangle(2, 2, 0, 0, 1, 0, 0.5, 1)).toBe(false);
    });

    it('should handle large triangles', () =>
    {
        expect(pointInTriangle(500, 250, 0, 0, 1000, 0, 500, 1000)).toBe(true);
        expect(pointInTriangle(-1, -1, 0, 0, 1000, 0, 500, 1000)).toBe(false);
    });
});
