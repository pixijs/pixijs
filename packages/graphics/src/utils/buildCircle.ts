// for type only
import { SHAPES } from '@pixi/math';

import type { Circle, Ellipse, RoundedRectangle } from '@pixi/math';
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
        const points = graphicsData.points;

        let x;
        let y;
        let dx;
        let dy;
        let rx;
        let ry;

        if (graphicsData.type === SHAPES.CIRC)
        {
            const circle = graphicsData.shape as Circle;

            x = circle.x;
            y = circle.y;
            rx = ry = circle.radius;
            dx = dy = 0;
        }
        else if (graphicsData.type === SHAPES.ELIP)
        {
            const ellipse = graphicsData.shape as Ellipse;

            x = ellipse.x;
            y = ellipse.y;
            rx = ellipse.width;
            ry = ellipse.height;
            dx = dy = 0;
        }
        else
        {
            const roundedRect = graphicsData.shape as RoundedRectangle;
            const halfWidth = roundedRect.width / 2;
            const halfHeight = roundedRect.height / 2;

            x = roundedRect.x + halfWidth;
            y = roundedRect.y + halfHeight;
            rx = ry = Math.max(0, Math.min(roundedRect.radius, Math.min(halfWidth, halfHeight)));
            dx = halfWidth - rx;
            dy = halfHeight - ry;
        }

        // Choose a number of segments such that the maximum absolute deviation from the circle is approximately 0.029
        const n = Math.ceil(2.3 * Math.sqrt(rx + ry));
        const m = (n * 8) + (dx ? 4 : 0) + (dy ? 4 : 0);

        points.length = m;

        if (m === 0)
        {
            return;
        }

        if (n === 0)
        {
            points.length = 8;
            points[0] = points[6] = x + dx;
            points[1] = points[3] = y + dy;
            points[2] = points[4] = x - dx;
            points[5] = points[7] = y - dy;

            return;
        }

        let j1 = 0;
        let j2 = (n * 4) + (dx ? 2 : 0) + 2;
        let j3 = j2;
        let j4 = m;

        {
            const x0 = dx + rx;
            const y0 = dy;
            const x1 = x + x0;
            const x2 = x - x0;
            const y1 = y + y0;

            points[j1++] = x1;
            points[j1++] = y1;
            points[--j2] = y1;
            points[--j2] = x2;

            if (dy)
            {
                const y2 = y - y0;

                points[j3++] = x2;
                points[j3++] = y2;
                points[--j4] = y2;
                points[--j4] = x1;
            }
        }

        for (let i = 1; i < n; i++)
        {
            const a = Math.PI / 2 * (i / n);
            const x0 = dx + (Math.cos(a) * rx);
            const y0 = dy + (Math.sin(a) * ry);
            const x1 = x + x0;
            const x2 = x - x0;
            const y1 = y + y0;
            const y2 = y - y0;

            points[j1++] = x1;
            points[j1++] = y1;
            points[--j2] = y1;
            points[--j2] = x2;
            points[j3++] = x2;
            points[j3++] = y2;
            points[--j4] = y2;
            points[--j4] = x1;
        }

        {
            const x0 = dx;
            const y0 = dy + ry;
            const x1 = x + x0;
            const x2 = x - x0;
            const y1 = y + y0;
            const y2 = y - y0;

            points[j1++] = x1;
            points[j1++] = y1;
            points[--j4] = y2;
            points[--j4] = x1;

            if (dx)
            {
                points[j1++] = x2;
                points[j1++] = y1;
                points[--j4] = y2;
                points[--j4] = x2;
            }
        }
    },

    triangulate(graphicsData, graphicsGeometry)
    {
        const points = graphicsData.points;
        const verts = graphicsGeometry.points;
        const indices = graphicsGeometry.indices;

        let vertPos = verts.length / 2;
        const center = vertPos;

        let x;
        let y;

        if (graphicsData.type !== SHAPES.RREC)
        {
            const circle = graphicsData.shape as Circle;

            x = circle.x;
            y = circle.y;
        }
        else
        {
            const roundedRect = graphicsData.shape as RoundedRectangle;

            x = roundedRect.x + (roundedRect.width / 2);
            y = roundedRect.y + (roundedRect.height / 2);
        }

        const matrix = graphicsData.matrix;

        // Push center (special point)
        verts.push(
            graphicsData.matrix ? (matrix.a * x) + (matrix.c * y) + matrix.tx : x,
            graphicsData.matrix ? (matrix.b * x) + (matrix.d * y) + matrix.ty : y);

        vertPos++;

        verts.push(points[0], points[1]);

        for (let i = 2; i < points.length; i += 2)
        {
            verts.push(points[i], points[i + 1]);

            // add some uvs
            indices.push(vertPos++, center, vertPos);
        }

        indices.push(center + 1, center, vertPos);
    },
};
