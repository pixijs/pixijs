import { Rectangle } from '../shapes/Rectangle';
import { Triangle } from '../shapes/Triangle';

describe('Triangle', () =>
{
    it('should create a new triangle with default values', () =>
    {
        const triangle = new Triangle();

        expect(triangle.x).toEqual(0);
        expect(triangle.y).toEqual(0);
        expect(triangle.x2).toEqual(0);
        expect(triangle.y2).toEqual(0);
        expect(triangle.x3).toEqual(0);
        expect(triangle.y3).toEqual(0);
        expect(triangle.type).toEqual('triangle');
    });

    it('should create a new triangle with specified values', () =>
    {
        const triangle = new Triangle(0, 0, 100, 0, 50, 100);

        expect(triangle.x).toEqual(0);
        expect(triangle.y).toEqual(0);
        expect(triangle.x2).toEqual(100);
        expect(triangle.y2).toEqual(0);
        expect(triangle.x3).toEqual(50);
        expect(triangle.y3).toEqual(100);
    });

    it('should create a triangle with partial arguments', () =>
    {
        const triangle = new Triangle(10, 20);

        expect(triangle.x).toEqual(10);
        expect(triangle.y).toEqual(20);
        expect(triangle.x2).toEqual(0);
        expect(triangle.y2).toEqual(0);
        expect(triangle.x3).toEqual(0);
        expect(triangle.y3).toEqual(0);
    });

    describe('contains', () =>
    {
        it('should check if a point is within the triangle', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);

            // Center of the triangle
            expect(triangle.contains(50, 33)).toBe(true);

            // Near each vertex (inside)
            expect(triangle.contains(5, 1)).toBe(true);
            expect(triangle.contains(95, 1)).toBe(true);
            expect(triangle.contains(50, 95)).toBe(true);
        });

        it('should return false for points outside the triangle', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);

            // Outside left
            expect(triangle.contains(-10, 50)).toBe(false);
            // Outside right
            expect(triangle.contains(110, 50)).toBe(false);
            // Above
            expect(triangle.contains(50, -10)).toBe(false);
            // Below
            expect(triangle.contains(50, 110)).toBe(false);
            // Far away
            expect(triangle.contains(200, 200)).toBe(false);
        });

        it('should return true for points on the edges', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);

            // On the top edge (between vertex 1 and vertex 2)
            expect(triangle.contains(50, 0)).toBe(true);
            // On the vertices
            expect(triangle.contains(0, 0)).toBe(true);
            expect(triangle.contains(100, 0)).toBe(true);
            expect(triangle.contains(50, 100)).toBe(true);
        });

        it('should handle degenerate triangle (all points same)', () =>
        {
            const triangle = new Triangle(5, 5, 5, 5, 5, 5);

            expect(triangle.contains(5, 5)).toBe(true);
            expect(triangle.contains(6, 6)).toBe(false);
        });

        it('should handle right triangle', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 0, 100);

            expect(triangle.contains(10, 10)).toBe(true);
            expect(triangle.contains(90, 90)).toBe(false);
            expect(triangle.contains(50, 50)).toBe(true); // on the hypotenuse
        });

        it('should handle inverted triangle (clockwise winding)', () =>
        {
            const triangle = new Triangle(0, 0, 50, 100, 100, 0);

            expect(triangle.contains(50, 33)).toBe(true);
            expect(triangle.contains(50, -10)).toBe(false);
        });

        it('should handle negative coordinates', () =>
        {
            const triangle = new Triangle(-50, -50, 50, -50, 0, 50);

            expect(triangle.contains(0, 0)).toBe(true);
            expect(triangle.contains(0, -40)).toBe(true);
            expect(triangle.contains(-100, 0)).toBe(false);
        });
    });

    describe('strokeContains', () =>
    {
        it('should check if a point is within the triangle stroke', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);

            // On the top edge
            expect(triangle.strokeContains(50, 0, 4)).toBe(true);
            // Near the top edge
            expect(triangle.strokeContains(50, 1, 4)).toBe(true);
        });

        it('should return false for points far from the stroke', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);

            // Center of the triangle (far from edges)
            expect(triangle.strokeContains(50, 33, 2)).toBe(false);
        });

        it('should handle zero stroke width', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);

            // Even exactly on the edge, zero-width stroke should be very restrictive
            expect(triangle.strokeContains(50, 0, 0)).toBe(true);
        });
    });

    describe('clone', () =>
    {
        it('should create an independent copy', () =>
        {
            const original = new Triangle(10, 20, 30, 40, 50, 60);
            const copy = original.clone();

            expect(copy.x).toEqual(10);
            expect(copy.y).toEqual(20);
            expect(copy.x2).toEqual(30);
            expect(copy.y2).toEqual(40);
            expect(copy.x3).toEqual(50);
            expect(copy.y3).toEqual(60);
            expect(copy).not.toBe(original);
        });

        it('should be independent from the original', () =>
        {
            const original = new Triangle(10, 20, 30, 40, 50, 60);
            const copy = original.clone();

            copy.x = 999;
            expect(original.x).toEqual(10);
        });
    });

    describe('copyFrom', () =>
    {
        it('should copy values from another triangle', () =>
        {
            const source = new Triangle(1, 2, 3, 4, 5, 6);
            const target = new Triangle();

            target.copyFrom(source);

            expect(target.x).toEqual(1);
            expect(target.y).toEqual(2);
            expect(target.x2).toEqual(3);
            expect(target.y2).toEqual(4);
            expect(target.x3).toEqual(5);
            expect(target.y3).toEqual(6);
        });

        it('should return itself for chaining', () =>
        {
            const source = new Triangle(1, 2, 3, 4, 5, 6);
            const target = new Triangle();

            const result = target.copyFrom(source);

            expect(result).toBe(target);
        });
    });

    describe('copyTo', () =>
    {
        it('should copy values to another triangle', () =>
        {
            const source = new Triangle(1, 2, 3, 4, 5, 6);
            const target = new Triangle();

            source.copyTo(target);

            expect(target.x).toEqual(1);
            expect(target.y).toEqual(2);
            expect(target.x2).toEqual(3);
            expect(target.y2).toEqual(4);
            expect(target.x3).toEqual(5);
            expect(target.y3).toEqual(6);
        });

        it('should return the target triangle', () =>
        {
            const source = new Triangle(1, 2, 3, 4, 5, 6);
            const target = new Triangle();

            const result = source.copyTo(target);

            expect(result).toBe(target);
        });
    });

    describe('getBounds', () =>
    {
        it('should return the bounding rectangle', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);
            const bounds = triangle.getBounds();

            expect(bounds.x).toEqual(0);
            expect(bounds.y).toEqual(0);
            expect(bounds.width).toEqual(100);
            expect(bounds.height).toEqual(100);
        });

        it('should handle triangles with negative coordinates', () =>
        {
            const triangle = new Triangle(-50, -30, 50, -30, 0, 70);
            const bounds = triangle.getBounds();

            expect(bounds.x).toEqual(-50);
            expect(bounds.y).toEqual(-30);
            expect(bounds.width).toEqual(100);
            expect(bounds.height).toEqual(100);
        });

        it('should reuse the provided output rectangle', () =>
        {
            const triangle = new Triangle(0, 0, 100, 0, 50, 100);
            const out = new Rectangle();
            const result = triangle.getBounds(out);

            expect(result).toBe(out);
            expect(out.x).toEqual(0);
            expect(out.y).toEqual(0);
            expect(out.width).toEqual(100);
            expect(out.height).toEqual(100);
        });

        it('should create a new rectangle if none provided', () =>
        {
            const triangle = new Triangle(10, 20, 30, 40, 50, 60);
            const bounds = triangle.getBounds();

            expect(bounds).toBeInstanceOf(Rectangle);
            expect(bounds.x).toEqual(10);
            expect(bounds.y).toEqual(20);
            expect(bounds.width).toEqual(40);
            expect(bounds.height).toEqual(40);
        });

        it('should handle degenerate triangle (single point)', () =>
        {
            const triangle = new Triangle(5, 5, 5, 5, 5, 5);
            const bounds = triangle.getBounds();

            expect(bounds.x).toEqual(5);
            expect(bounds.y).toEqual(5);
            expect(bounds.width).toEqual(0);
            expect(bounds.height).toEqual(0);
        });

        it('should handle collinear points', () =>
        {
            const triangle = new Triangle(0, 0, 50, 0, 100, 0);
            const bounds = triangle.getBounds();

            expect(bounds.x).toEqual(0);
            expect(bounds.y).toEqual(0);
            expect(bounds.width).toEqual(100);
            expect(bounds.height).toEqual(0);
        });
    });
});
