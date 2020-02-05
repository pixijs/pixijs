import { GRAPHICS_CURVES } from '../const';

/**
 * Utilities for quadratic curves
 * @class
 * @private
 */
export class QuadraticUtils
{
    /**
     * Calculate length of quadratic curve
     * @see {@link http://www.malczak.linuxpl.com/blog/quadratic-bezier-curve-length/}
     * for the detailed explanation of math behind this.
     *
     * @private
     * @param {number} fromX - x-coordinate of curve start point
     * @param {number} fromY - y-coordinate of curve start point
     * @param {number} cpX - x-coordinate of curve control point
     * @param {number} cpY - y-coordinate of curve control point
     * @param {number} toX - x-coordinate of curve end point
     * @param {number} toY - y-coordinate of curve end point
     * @return {number} Length of quadratic curve
     */
    static curveLength(
        fromX: number, fromY: number,
        cpX: number, cpY: number,
        toX: number, toY: number): number
    {
        const ax = fromX - (2.0 * cpX) + toX;
        const ay = fromY - (2.0 * cpY) + toY;
        const bx = (2.0 * cpX) - (2.0 * fromX);
        const by = (2.0 * cpY) - (2.0 * fromY);
        const a = 4.0 * ((ax * ax) + (ay * ay));
        const b = 4.0 * ((ax * bx) + (ay * by));
        const c = (bx * bx) + (by * by);

        const s = 2.0 * Math.sqrt(a + b + c);
        const a2 = Math.sqrt(a);
        const a32 = 2.0 * a * a2;
        const c2 = 2.0 * Math.sqrt(c);
        const ba = b / a2;

        return (
            (a32 * s)
                + (a2 * b * (s - c2))
                + (
                    ((4.0 * c * a) - (b * b))
                   * Math.log(((2.0 * a2) + ba + s) / (ba + c2))
                )
        ) / (4.0 * a32);
    }

    /**
     * Calculate the points for a quadratic bezier curve and then draws it.
     * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
     *
     * @private
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @param {number[]} points - Points to add segments to.
     */
    static curveTo(cpX: number, cpY: number, toX: number, toY: number, points: Array<number>): void
    {
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        const n = GRAPHICS_CURVES._segmentsCount(
            QuadraticUtils.curveLength(fromX, fromY, cpX, cpY, toX, toY)
        );

        let xa = 0;
        let ya = 0;

        for (let i = 1; i <= n; ++i)
        {
            const j = i / n;

            xa = fromX + ((cpX - fromX) * j);
            ya = fromY + ((cpY - fromY) * j);

            points.push(xa + (((cpX + ((toX - cpX) * j)) - xa) * j),
                ya + (((cpY + ((toY - cpY) * j)) - ya) * j));
        }
    }
}
