import { earcut } from '@pixi/utils';

// for type only
import type { IShapeBuildCommand } from './IShapeBuildCommand';
import type { RoundedRectangle } from '@pixi/math';

/**
 * Calculate a single point for a quadratic bezier curve.
 * Utility function used by quadraticBezierCurve.
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {number} n1 - first number
 * @param {number} n2 - second number
 * @param {number} perc - percentage
 * @return {number} the result
 *
 */
function getPt(n1: number, n2: number, perc: number): number
{
    const diff = n2 - n1;

    return n1 + (diff * perc);
}

/**
 * Calculate the points for a quadratic bezier curve. (helper function..)
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {number} fromX - Origin point x
 * @param {number} fromY - Origin point x
 * @param {number} cpX - Control point x
 * @param {number} cpY - Control point y
 * @param {number} toX - Destination point x
 * @param {number} toY - Destination point y
 * @param {number[]} [out=[]] - The output array to add points into. If not passed, a new array is created.
 * @return {number[]} an array of points
 */
function quadraticBezierCurve(
    fromX: number, fromY: number,
    cpX: number, cpY: number,
    toX: number, toY: number,
    out: Array<number> = []): Array<number>
{
    const n = 20;
    const points = out;

    let xa = 0;
    let ya = 0;
    let xb = 0;
    let yb = 0;
    let x = 0;
    let y = 0;

    for (let i = 0, j = 0; i <= n; ++i)
    {
        j = i / n;

        // The Green Line
        xa = getPt(fromX, cpX, j);
        ya = getPt(fromY, cpY, j);
        xb = getPt(cpX, toX, j);
        yb = getPt(cpY, toY, j);

        // The Black Dot
        x = getPt(xa, xb, j);
        y = getPt(ya, yb, j);

        points.push(x, y);
    }

    return points;
}

/**
 * Builds a rounded rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
 */
export const buildRoundedRectangle: IShapeBuildCommand = {

    build(graphicsData)
    {
        const rrectData = graphicsData.shape as RoundedRectangle;
        const points = graphicsData.points;
        const x = rrectData.x;
        const y = rrectData.y;
        const width = rrectData.width;
        const height = rrectData.height;

        // Don't allow negative radius or greater than half the smallest width
        const radius = Math.max(0, Math.min(rrectData.radius, Math.min(width, height) / 2));

        points.length = 0;

        // No radius, do a simple rectangle
        if (!radius)
        {
            points.push(x, y,
                x + width, y,
                x + width, y + height,
                x, y + height);
        }
        else
        {
            quadraticBezierCurve(x, y + radius,
                x, y,
                x + radius, y,
                points);
            quadraticBezierCurve(x + width - radius,
                y, x + width, y,
                x + width, y + radius,
                points);
            quadraticBezierCurve(x + width, y + height - radius,
                x + width, y + height,
                x + width - radius, y + height,
                points);
            quadraticBezierCurve(x + radius, y + height,
                x, y + height,
                x, y + height - radius,
                points);
        }

        // this tiny number deals with the issue that occurs when points overlap and earcut fails to triangulate the item.
        // TODO - fix this properly, this is not very elegant.. but it works for now.
    },

    triangulate(graphicsData, graphicsGeometry)
    {
        const points = graphicsData.points;

        const verts = graphicsGeometry.points;
        const indices = graphicsGeometry.indices;

        const vecPos = verts.length / 2;

        const triangles = earcut(points, null, 2);

        for (let i = 0, j = triangles.length; i < j; i += 3)
        {
            indices.push(triangles[i] + vecPos);
            //     indices.push(triangles[i] + vecPos);
            indices.push(triangles[i + 1] + vecPos);
            //   indices.push(triangles[i + 2] + vecPos);
            indices.push(triangles[i + 2] + vecPos);
        }

        for (let i = 0, j = points.length; i < j; i++)
        {
            verts.push(points[i], points[++i]);
        }
    },
};
