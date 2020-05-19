import { GRAPHICS_CURVES } from '../const';

/**
 * Utilities for bezier curves
 * @class
 * @private
 */
export class BezierUtils
{
    /**
     * Calculate length of bezier curve.
     * Analytical solution is impossible, since it involves an integral that does not integrate in general.
     * Therefore numerical solution is used.
     *
     * @private
     * @param {number} fromX - Starting point x
     * @param {number} fromY - Starting point y
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {number} Length of bezier curve
     */
    static curveLength(
        fromX: number, fromY: number,
        cpX: number, cpY: number,
        cpX2: number, cpY2: number,
        toX: number, toY: number): number
    {
        const n = 10;
        let result = 0.0;
        let t = 0.0;
        let t2 = 0.0;
        let t3 = 0.0;
        let nt = 0.0;
        let nt2 = 0.0;
        let nt3 = 0.0;
        let x = 0.0;
        let y = 0.0;
        let dx = 0.0;
        let dy = 0.0;
        let prevX = fromX;
        let prevY = fromY;

        for (let i = 1; i <= n; ++i)
        {
            t = i / n;
            t2 = t * t;
            t3 = t2 * t;
            nt = (1.0 - t);
            nt2 = nt * nt;
            nt3 = nt2 * nt;

            x = (nt3 * fromX) + (3.0 * nt2 * t * cpX) + (3.0 * nt * t2 * cpX2) + (t3 * toX);
            y = (nt3 * fromY) + (3.0 * nt2 * t * cpY) + (3 * nt * t2 * cpY2) + (t3 * toY);
            dx = prevX - x;
            dy = prevY - y;
            prevX = x;
            prevY = y;

            result += Math.sqrt((dx * dx) + (dy * dy));
        }

        return result;
    }

    /**
     * Calculate the points for a bezier curve and then draws it.
     *
     * Ignored from docs since it is not directly exposed.
     *
     * @ignore
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @param {number[]} points - Path array to push points into
     */
    static curveTo(
        cpX: number, cpY: number,
        cpX2: number, cpY2: number,
        toX: number, toY: number,
        points: Array<number>): void
    {
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        points.length -= 2;

        const n = GRAPHICS_CURVES._segmentsCount(
            BezierUtils.curveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY)
        );

        let dt = 0;
        let dt2 = 0;
        let dt3 = 0;
        let t2 = 0;
        let t3 = 0;

        points.push(fromX, fromY);

        for (let i = 1, j = 0; i <= n; ++i)
        {
            j = i / n;

            dt = (1 - j);
            dt2 = dt * dt;
            dt3 = dt2 * dt;

            t2 = j * j;
            t3 = t2 * j;

            points.push(
                (dt3 * fromX) + (3 * dt2 * j * cpX) + (3 * dt * t2 * cpX2) + (t3 * toX),
                (dt3 * fromY) + (3 * dt2 * j * cpY) + (3 * dt * t2 * cpY2) + (t3 * toY)
            );
        }
    }
}
