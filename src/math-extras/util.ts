import { Point } from '../maths/point/Point';
import './pointExtras';
import './rectangleExtras';

import type { PointData } from '../maths/point/PointData';

/**
 * The idea of a relative epsilon comparison is to find the difference between the two numbers,
 * and see if it is less than `Math.EPSILON`.
 * @param {number} a - First floating number to compare.
 * @param {number} b - Second floating number to compare.
 * @returns {boolean} Returns `true` if the difference between the values is less than `Math.EPSILON`; otherwise `false`.
 * @memberof maths
 */
export function floatEqual(a: number, b: number): boolean;
/**
 * The idea of a relative epsilon comparison is to find the difference between the two numbers,
 * and see if it is less than a given epsilon.
 * A good epsilon would be the N% of the largest of the two values or `Math.EPSILON`.
 *
 * _Note: Only available with **pixi.js/math-extras**._
 * @param {number} a - First floating number to compare.
 * @param {number} b - Second floating number to compare.
 * @param {number} epsilon - The epsilon to compare to.
 * The larger the epsilon, the easier for the numbers to be considered equals.
 * @returns {boolean} Returns `true` if the difference between the values is less than the given epsilon;
 * otherwise `false`.
 * @memberof maths
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
 * @param {PointData} [outPoint] - A Point-like object in which to store the value,
 * optional (otherwise will create a new Point).
 * @returns {PointData} The point where the lines/segments intersect or a `NaN` Point.
 */
function genericLineIntersection<T extends PointData>(
    aStart: PointData,
    aEnd: PointData,
    bStart: PointData,
    bEnd: PointData,
    isLine: boolean,
    outPoint?: T): T
{
    if (!outPoint)
    {
        outPoint = new Point() as PointData as T;
    }

    const dxa = aEnd.x - aStart.x;
    const dya = aEnd.y - aStart.y;
    const dxb = bEnd.x - bStart.x;
    const dyb = bEnd.y - bStart.y;

    // In order to find the position of the intersection in respect to the line segments, we can define lines
    // in terms of first degree Bézier parameters, and find the two parameters `ua` and `ub` for the two lines to touch.
    // both `ua` and `ub` formula share the same denominator so it is only calculated once.

    const denominator = ((dyb * dxa) - (dxb * dya));

    // If lines are parallel or overlapping, the intersection can be nowhere or everywhere... NaN.
    if (floatEqual(denominator, 0))
    {
        outPoint.x = NaN;
        outPoint.y = NaN;

        return outPoint;
    }

    // ua is the factor of line a where the intersection occurs. ub is the factor of line b where the intersection occurs.
    const ua = ((dxb * (aStart.y - bStart.y)) - (dyb * (aStart.x - bStart.x))) / denominator;
    const ub = ((dxa * (aStart.y - bStart.y)) - (dya * (aStart.x - bStart.x))) / denominator;

    // Line intersection extends beyond the bounds of the segment.
    // The intersection is inside the segments if 0.0 ≤ ua ≤ 1.0 and 0.0 ≤ ub ≤ 1.0
    if (!isLine && (ua < 0 || ua > 1 || ub < 0 || ub > 1))
    {
        outPoint.x = NaN;
        outPoint.y = NaN;

        return outPoint;
    }

    outPoint.x = aStart.x + (ua * dxa);
    outPoint.y = bStart.y + (ub * dyb);

    return outPoint;
}

/**
 * Computes the point where non-coincident and non-parallel Lines intersect.
 * Coincident or parallel lines return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point may land outside the extents of the lines.
 *
 * _Note: Only available with **pixi.js/math-extras**._
 * @param aStart - First point of the first line.
 * @param aEnd - Second point of the first line.
 * @param bStart - First point of the second line.
 * @param bEnd - Second point of the second line.
 * @returns {PointData} The point where the lines intersect.
 * @memberof maths
 */
export function lineIntersection(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData): Point;
/**
 * Computes the point where non-coincident and non-parallel Lines intersect.
 * Coincident or parallel lines return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point may land outside the extents of the lines.
 *
 * _Note: Only available with **pixi.js/math-extras**._
 * @param aStart - First point of the first line.
 * @param aEnd - Second point of the first line.
 * @param bStart - First point of the second line.
 * @param bEnd - Second point of the second line.
 * @param {PointData} outPoint - A Point-like object in which to store the value,
 * optional (otherwise will create a new Point).
 * @returns {PointData} The point where the lines intersect or a `NaN` Point.
 * @memberof maths
 */
export function lineIntersection
<T extends PointData>(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData, outPoint: T): T;
export function lineIntersection
<T extends PointData>(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData, outPoint?: T): T
{
    return genericLineIntersection(aStart, aEnd, bStart, bEnd, true, outPoint);
}

/**
 * Computes the point where non-coincident and non-parallel segments intersect.
 * Coincident, parallel or non-intersecting segments return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point must land inside the extents of the segments or return a `NaN` Point.
 *
 * _Note: Only available with **pixi.js/math-extras**._
 * @param aStart - Starting point of the first segment.
 * @param aEnd - Ending point of the first segment.
 * @param bStart - Starting point of the second segment.
 * @param bEnd - Ending point of the second segment.
 * @returns {PointData} The point where the segments intersect.
 * @memberof maths
 */
export function segmentIntersection(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData): Point;
/**
 * Computes the point where non-coincident and non-parallel segments intersect.
 * Coincident, parallel or non-intersecting segments return a `NaN` point `{x: NaN, y: NaN}`.
 * The intersection point must land inside the extents of the segments or return a `NaN` Point.
 *
 * _Note: Only available with **pixi.js/math-extras**._
 * @param aStart - Starting point of the first segment.
 * @param aEnd - Ending point of the first segment.
 * @param bStart - Starting point of the second segment.
 * @param bEnd - Ending point of the second segment.
 * @param {PointData} outPoint - A Point-like object in which to store the value,
 * optional (otherwise will create a new Point).
 * @returns {PointData} The point where the segments intersect or a `NaN` Point.
 * @memberof maths
 */
export function segmentIntersection
<T extends PointData>(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData, outPoint: T): T;
export function segmentIntersection
<T extends PointData>(aStart: PointData, aEnd: PointData, bStart: PointData, bEnd: PointData, outPoint?: T): T
{
    return genericLineIntersection(aStart, aEnd, bStart, bEnd, false, outPoint);
}
