import { squaredDistanceToLineSegment } from '../misc/squaredDistanceToLineSegment';

describe('squaredDistanceToLineSegment', () =>
{
    it('should return 0 for a point on the line segment', () =>
    {
        // Point at start of segment
        expect(squaredDistanceToLineSegment(0, 0, 0, 0, 10, 0)).toEqual(0);
        // Point at end of segment
        expect(squaredDistanceToLineSegment(10, 0, 0, 0, 10, 0)).toEqual(0);
        // Point in middle of segment
        expect(squaredDistanceToLineSegment(5, 0, 0, 0, 10, 0)).toEqual(0);
    });

    it('should calculate distance to a horizontal segment', () =>
    {
        // Point above the segment
        expect(squaredDistanceToLineSegment(5, 3, 0, 0, 10, 0)).toEqual(9);
        // Point below the segment
        expect(squaredDistanceToLineSegment(5, -4, 0, 0, 10, 0)).toEqual(16);
    });

    it('should calculate distance to a vertical segment', () =>
    {
        // Point to the right of the segment
        expect(squaredDistanceToLineSegment(3, 5, 0, 0, 0, 10)).toEqual(9);
        // Point to the left of the segment
        expect(squaredDistanceToLineSegment(-4, 5, 0, 0, 0, 10)).toEqual(16);
    });

    it('should calculate distance to segment endpoints when projection is outside', () =>
    {
        // Point beyond the end of a horizontal segment
        expect(squaredDistanceToLineSegment(15, 0, 0, 0, 10, 0)).toEqual(25);
        // Point before the start of a horizontal segment
        expect(squaredDistanceToLineSegment(-5, 0, 0, 0, 10, 0)).toEqual(25);
    });

    it('should handle degenerate segment (point)', () =>
    {
        // Distance from point to another point
        expect(squaredDistanceToLineSegment(3, 4, 0, 0, 0, 0)).toEqual(25);
        expect(squaredDistanceToLineSegment(0, 0, 0, 0, 0, 0)).toEqual(0);
    });

    it('should handle diagonal segments', () =>
    {
        // Point on the diagonal
        expect(squaredDistanceToLineSegment(5, 5, 0, 0, 10, 10)).toBeCloseTo(0, 10);
        // Point perpendicular to the diagonal
        const dist = squaredDistanceToLineSegment(0, 10, 0, 0, 10, 10);

        expect(dist).toBeCloseTo(50, 10);
    });

    it('should handle negative coordinates', () =>
    {
        // Point (0,0) is on the line from (-5,-5) to (5,5)
        expect(squaredDistanceToLineSegment(0, 0, -5, -5, 5, 5)).toBeCloseTo(0, 10);
        // Point (-10,0) is closest to the start of the segment (-5,-5)
        // Distance: sqrt((-10-(-5))^2 + (0-(-5))^2) = sqrt(25+25) = sqrt(50), squared = 50
        expect(squaredDistanceToLineSegment(-10, 0, -5, -5, 5, 5)).toBeCloseTo(50, 5);
    });
});
