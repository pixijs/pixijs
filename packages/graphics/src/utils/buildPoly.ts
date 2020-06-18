import { earcut } from '@pixi/utils';

import type { IShapeBuildCommand } from './IShapeBuildCommand';
import type { Polygon } from '@pixi/math';

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
            const holeArray = [];
            // Process holes..

            for (let i = 0; i < holes.length; i++)
            {
                const hole = holes[i];

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
