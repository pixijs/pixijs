// for type only
import { SHAPES } from '@pixi/math';

import type { Circle, Ellipse } from '@pixi/math';
import type { IShapeBuildCommand } from './IShapeBuildCommand';

/**
 * Builds a circle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object to draw
 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
 */
export const buildCircle: IShapeBuildCommand = {

    build(graphicsData)
    {
        // need to convert points to a nice regular data
        const circleData = graphicsData.shape as Circle & Ellipse;
        const points = graphicsData.points;
        const x = circleData.x;
        const y = circleData.y;
        let width;
        let height;

        points.length = 0;

        // TODO - bit hacky??
        if (graphicsData.type === SHAPES.CIRC)
        {
            width = circleData.radius;
            height = circleData.radius;
        }
        else
        {
            width = circleData.width;
            height = circleData.height;
        }

        if (width === 0 || height === 0)
        {
            return;
        }

        let totalSegs = Math.floor(30 * Math.sqrt(circleData.radius))
            || Math.floor(15 * Math.sqrt(circleData.width + circleData.height));

        totalSegs /= 2.3;

        const seg = (Math.PI * 2) / totalSegs;

        for (let i = 0; i < totalSegs - 0.5; i++)
        {
            points.push(
                x + (Math.sin(-seg * i) * width),
                y + (Math.cos(-seg * i) * height)
            );
        }

        points.push(points[0], points[1]);
    },

    triangulate(graphicsData, graphicsGeometry)
    {
        const points = graphicsData.points;
        const verts = graphicsGeometry.points;
        const indices = graphicsGeometry.indices;

        let vertPos = verts.length / 2;
        const center = vertPos;

        const circle = (graphicsData.shape) as Circle;
        const matrix = graphicsData.matrix;
        const x = circle.x;
        const y = circle.y;

        // Push center (special point)
        verts.push(
            graphicsData.matrix ? (matrix.a * x) + (matrix.c * y) + matrix.tx : x,
            graphicsData.matrix ? (matrix.b * x) + (matrix.d * y) + matrix.ty : y);

        for (let i = 0; i < points.length; i += 2)
        {
            verts.push(points[i], points[i + 1]);

            // add some uvs
            indices.push(vertPos++, center, vertPos);
        }
    },
};
