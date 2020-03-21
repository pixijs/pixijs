import type { IShapeBuildCommand } from './IShapeBuildCommand';
import type { Rectangle } from '@pixi/math';

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
 */
export const buildRectangle: IShapeBuildCommand = {

    build(graphicsData)
    {
        // --- //
        // need to convert points to a nice regular data
        //
        const rectData = graphicsData.shape as Rectangle;
        const x = rectData.x;
        const y = rectData.y;
        const width = rectData.width;
        const height = rectData.height;

        const points = graphicsData.points;

        points.length = 0;

        points.push(x, y,
            x + width, y,
            x + width, y + height,
            x, y + height);
    },

    triangulate(graphicsData, graphicsGeometry)
    {
        const points = graphicsData.points;
        const verts = graphicsGeometry.points;

        const vertPos = verts.length / 2;

        verts.push(points[0], points[1],
            points[2], points[3],
            points[6], points[7],
            points[4], points[5]);

        graphicsGeometry.indices.push(vertPos, vertPos + 1, vertPos + 2,
            vertPos + 1, vertPos + 2, vertPos + 3);
    },
};
