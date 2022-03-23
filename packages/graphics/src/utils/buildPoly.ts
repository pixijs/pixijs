import { earcut } from '@pixi/utils';

import type { IShapeBuildCommand } from './IShapeBuildCommand';
import type { Polygon } from '@pixi/math';

function fixOrientation(points: number[], hole = false)
{
    const m = points.length;

    if (m < 6)
    {
        return;
    }

    let area = 0;

    for (let i = 0, x1 = points[m - 2], y1 = points[m - 1]; i < m; i += 2)
    {
        const x2 = points[i];
        const y2 = points[i + 1];

        area += (x2 - x1) * (y2 + y1);

        x1 = x2;
        y1 = y2;
    }

    if ((!hole && area > 0) || (hole && area <= 0))
    {
        const n = m / 2;

        for (let i = n + (n % 2); i < m; i += 2)
        {
            const i1 = m - i - 2;
            const i2 = m - i - 1;
            const i3 = i;
            const i4 = i + 1;

            [points[i1], points[i3]] = [points[i3], points[i1]];
            [points[i2], points[i4]] = [points[i4], points[i2]];
        }
    }
}
/**
 * Builds a polygon to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
 */
export const buildPoly: IShapeBuildCommand = {

    build(graphicsData)
    {
        graphicsData.points = (graphicsData.shape as Polygon).points.slice();
    },

    triangulate(graphicsData, graphicsGeometry)
    {
        let points = graphicsData.points;
        const holes = graphicsData.holes;
        const verts = graphicsGeometry.points;
        const indices = graphicsGeometry.indices;

        if (points.length >= 6)
        {
            fixOrientation(points, false);

            const holeArray = [];
            // Process holes..

            for (let i = 0; i < holes.length; i++)
            {
                const hole = holes[i];

                fixOrientation(hole.points, true);

                holeArray.push(points.length / 2);
                points = points.concat(hole.points);
            }

            // sort color
            const triangles = earcut(points, holeArray, 2);

            if (!triangles)
            {
                return;
            }

            const vertPos = verts.length / 2;

            for (let i = 0; i < triangles.length; i += 3)
            {
                indices.push(triangles[i] + vertPos);
                indices.push(triangles[i + 1] + vertPos);
                indices.push(triangles[i + 2] + vertPos);
            }

            for (let i = 0; i < points.length; i++)
            {
                verts.push(points[i]);
            }
        }
    },
};
