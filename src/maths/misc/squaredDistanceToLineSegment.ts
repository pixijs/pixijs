/**
 * Calculates the squared distance from a point to a line segment defined by two endpoints.
 * @param x - x coordinate of the point
 * @param y - y coordinate of the point
 * @param x1 - x coordinate of the first endpoint of the line segment
 * @param y1 - y coordinate of the first endpoint of the line segment
 * @param x2 - x coordinate of the second endpoint of the line segment
 * @param y2 - y coordinate of the second endpoint of the line segment
 * @returns The squared distance from the point to the line segment
 * @category maths
 * @internal
 */
export function squaredDistanceToLineSegment(
    x: number, y: number,
    x1: number, y1: number,
    x2: number, y2: number
): number
{
    const a = x - x1;
    const b = y - y1;
    const c = x2 - x1;
    const d = y2 - y1;

    const dot = (a * c) + (b * d);
    const lenSq = (c * c) + (d * d);
    let param = -1;

    if (lenSq !== 0)
    {
        param = dot / lenSq;
    }

    let xx; let
        yy;

    if (param < 0)
    {
        xx = x1;
        yy = y1;
    }
    else if (param > 1)
    {
        xx = x2;
        yy = y2;
    }

    else
    {
        xx = x1 + (param * c);
        yy = y1 + (param * d);
    }

    const dx = x - xx;
    const dy = y - yy;

    return (dx * dx) + (dy * dy);
}
