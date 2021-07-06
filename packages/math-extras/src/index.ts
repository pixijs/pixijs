import './pointExtras';
import './rectangleExtras';

import { IPointData, Point } from '@pixi/math';

/**
 * The idea of a relative epsilon comparison is to find the difference between the two numbers,
 * and see if it is less than `Math.EPSILON`.
 * @param {number} a - First floating number to compare.
 * @param {number} b - Second floating number to compare.
 * @returns {boolean} Returns `true` if the difference between the values is less than `Math.EPSILON`; otherwise `false`.
 */
export function floatEqual(a: number, b: number): boolean;
/**
 * The idea of a relative epsilon comparison is to find the difference between the two numbers,
 * and see if it is less than a given epsilon.
 * A good epsilon would be the N% of the largest of the two values or `Math.EPSILON`.
 * @memberof PIXI
 * @param {number} a - First floating number to compare.
 * @param {number} b - Second floating number to compare.
 * @param {number} epsilon - The epsilon to compare to.
 * The larger the epsilon, the easier for the numbers to be considered equals.
 * @returns {boolean} Returns `true` if the difference between the values is less than the given epsilon;
 * otherwise `false`.
 */
export function floatEqual(a: number, b: number, epsilon: number): boolean;
export function floatEqual(a: number, b: number, epsilon: number = Number.EPSILON): boolean
{
    if (a === b)
    {
        return true;
    }

    const diff = Math.abs(a - b);

    return diff < epsilon;
}

/**
 * Generic line or segment intersection.
 * A line can intersect outside the two points defining it, the segment can't.
 * @param aStart - First point of the first line.
 * @param aEnd - Second point of the first line.
 * @param bStart - First point of the second line.
 * @param bEnd - Second point of the second line.
 * @param isLine - Set to true if you want Line (unbounded) intersection.
 * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
 * optional (otherwise will create a new Point).
 * @returns {IPointData} The point where the lines/segments intersect or a `NaN` Point.
 */
function genericLineIntersection<T extends IPointData>(
    aStart: IPointData,
    aEnd: IPointData,
    bStart: IPointData,
    bEnd: IPointData,
    isLine: boolean,
    outPoint?: T): T
{
    if (!outPoint)
    {
        (outPoint as any) = new Point();
    }

    const denominator = (((bEnd.y - bStart.y) * (aEnd.x - aStart.x)) - ((bEnd.x - bStart.x) * (aEnd.y - aStart.y)));

    // If lines are parallel or overlapping, the intersection can be nowhere or everywhere... NaN.
    if (denominator === 0)
    {
        outPoint.x = NaN;
        outPoint.y = NaN;

        return outPoint;
    }

    // ua is the factor of line a where the intersection occurs. ub is the factor of line b where the intersection occurs.
    const ua = (((bEnd.x - bStart.x) * (aStart.y - bStart.y)) - ((bEnd.y - bStart.y) * (aStart.x - bStart.x))) / denominator;
    const ub = (((aEnd.x - aStart.x) * (aStart.y - bStart.y)) - ((aEnd.y - aStart.y) * (aStart.x - bStart.x))) / denominator;

    // Line intersection extends beyond the bounds of the segment.
    if (!isLine && (ua < 0 || ua > 1 || ub < 0 || ub > 1))
    {
        outPoint.x = NaN;
        outPoint.y = NaN;

        return outPoint;
    }

    outPoint.x = aStart.x + (ua * (aEnd.x - aStart.x));
    outPoint.y = bStart.y + (ub * (bEnd.y - bStart.y));

    return outPoint;
}

/**
 * Computes the point where non-coincident and non-parallel Lines intersect.
 * Coincident or parallel lines return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point may land outside the extents of the lines.
 * @param aStart - First point of the first line.
 * @param aEnd - Second point of the first line.
 * @param bStart - First point of the second line.
 * @param bEnd - Second point of the second line.
 * @returns {IPointData} The point where the lines intersect.
 */
export function lineIntersection(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData): Point;
/**
 * Computes the point where non-coincident and non-parallel Lines intersect.
 * Coincident or parallel lines return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point may land outside the extents of the lines.
 * @memberof PIXI
 * @param aStart - First point of the first line.
 * @param aEnd - Second point of the first line.
 * @param bStart - First point of the second line.
 * @param bEnd - Second point of the second line.
 * @param {IPointData} outPoint - A Point-like object in which to store the value,
 * optional (otherwise will create a new Point).
 * @returns {IPointData} The point where the lines intersect or a `NaN` Point.
 */
export function lineIntersection
<T extends IPointData>(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData, outPoint: T): T;
export function lineIntersection
<T extends IPointData>(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData, outPoint?: T): T
{
    return genericLineIntersection(aStart, aEnd, bStart, bEnd, true, outPoint);
}

/**
 * Computes the point where non-coincident and non-parallel segments intersect.
 * Coincident, parallel or non-intersecting segments return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point must land inside the extents of the segments or return a `NaN` Point.
 * @param aStart - Starting point of the first segment.
 * @param aEnd - Ending point of the first segment.
 * @param bStart - Starting point of the second segment.
 * @param bEnd - Ending point of the second segment.
 * @returns {IPointData} The point where the segments intersect.
 */
export function segmentIntersection(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData): Point;
/**
  * Computes the point where non-coincident and non-parallel segments intersect.
  * Coincident, parallel or non-intersecting segments return a `NaN` point `{x: NaN, y: NaN}`.
  * The intersection point must land inside the extents of the segments or return a `NaN` Point.
  * @memberof PIXI
  * @param aStart - Starting point of the first segment.
  * @param aEnd - Ending point of the first segment.
  * @param bStart - Starting point of the second segment.
  * @param bEnd - Ending point of the second segment.
  * @param {IPointData} outPoint - A Point-like object in which to store the value,
  * optional (otherwise will create a new Point).
  * @returns {IPointData} The point where the segments intersect or a `NaN` Point.
  */
export function segmentIntersection
<T extends IPointData>(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData, outPoint: T): T;
export function segmentIntersection
<T extends IPointData>(aStart: IPointData, aEnd: IPointData, bStart: IPointData, bEnd: IPointData, outPoint?: T): T
{
    return genericLineIntersection(aStart, aEnd, bStart, bEnd, false, outPoint);
}
