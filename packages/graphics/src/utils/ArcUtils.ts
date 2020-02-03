import { GRAPHICS_CURVES } from '../const';
import { PI_2 } from '@pixi/math';

interface IArcLikeShape {
    cx: number;
    cy: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    anticlockwise: boolean;
}

/**
 * Utilities for arc curves
 * @class
 * @private
 */
export class ArcUtils
{
    /**
     * The arcTo() method creates an arc/curve between two tangents on the canvas.
     *
     * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
     *
     * @private
     * @param {number} x1 - The x-coordinate of the beginning of the arc
     * @param {number} y1 - The y-coordinate of the beginning of the arc
     * @param {number} x2 - The x-coordinate of the end of the arc
     * @param {number} y2 - The y-coordinate of the end of the arc
     * @param {number} radius - The radius of the arc
     * @return {object} If the arc length is valid, return center of circle, radius and other info otherwise `null`.
     */
    static curveTo(x1: number, y1: number, x2: number, y2: number, radius: number, points: Array<number>): IArcLikeShape
    {
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        const a1 = fromY - y1;
        const b1 = fromX - x1;
        const a2 = y2 - y1;
        const b2 = x2 - x1;
        const mm = Math.abs((a1 * b2) - (b1 * a2));

        if (mm < 1.0e-8 || radius === 0)
        {
            if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1)
            {
                points.push(x1, y1);
            }

            return null;
        }

        const dd = (a1 * a1) + (b1 * b1);
        const cc = (a2 * a2) + (b2 * b2);
        const tt = (a1 * a2) + (b1 * b2);
        const k1 = radius * Math.sqrt(dd) / mm;
        const k2 = radius * Math.sqrt(cc) / mm;
        const j1 = k1 * tt / dd;
        const j2 = k2 * tt / cc;
        const cx = (k1 * b2) + (k2 * b1);
        const cy = (k1 * a2) + (k2 * a1);
        const px = b1 * (k2 + j1);
        const py = a1 * (k2 + j1);
        const qx = b2 * (k1 + j2);
        const qy = a2 * (k1 + j2);
        const startAngle = Math.atan2(py - cy, px - cx);
        const endAngle = Math.atan2(qy - cy, qx - cx);

        return {
            cx: (cx + x1),
            cy: (cy + y1),
            radius,
            startAngle,
            endAngle,
            anticlockwise: (b1 * a2 > b2 * a1),
        };
    }

    /**
     * The arc method creates an arc/curve (used to create circles, or parts of circles).
     *
     * @private
     * @param {number} startX - Start x location of arc
     * @param {number} startY - Start y location of arc
     * @param {number} cx - The x-coordinate of the center of the circle
     * @param {number} cy - The y-coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
     *  of the arc's circle)
     * @param {number} endAngle - The ending angle, in radians
     * @param {boolean} anticlockwise - Specifies whether the drawing should be
     *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
     *  indicates counter-clockwise.
     * @param {number} n - Number of segments
     * @param {number[]} points - Collection of points to add to
     */

    /* eslint-disable max-len, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    static arc(startX: number, startY: number, cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean, points: Array<number>): void
    {
        const sweep = endAngle - startAngle;
        const n = GRAPHICS_CURVES._segmentsCount(
            Math.abs(sweep) * radius,
            Math.ceil(Math.abs(sweep) / PI_2) * 40
        );

        const theta = (sweep) / (n * 2);
        const theta2 = theta * 2;
        const cTheta = Math.cos(theta);
        const sTheta = Math.sin(theta);
        const segMinus = n - 1;
        const remainder = (segMinus % 1) / segMinus;

        for (let i = 0; i <= segMinus; ++i)
        {
            const real = i + (remainder * i);
            const angle = ((theta) + startAngle + (theta2 * real));
            const c = Math.cos(angle);
            const s = -Math.sin(angle);

            points.push(
                (((cTheta * c) + (sTheta * s)) * radius) + cx,
                (((cTheta * -s) + (sTheta * c)) * radius) + cy
            );
        }
    }
    /* eslint-enable max-len, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-ignore */
}
