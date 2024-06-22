import { ExtensionType } from '../../../../extensions/Extensions';

import type { Circle } from '../../../../maths/shapes/Circle';
import type { Ellipse } from '../../../../maths/shapes/Ellipse';
import type { RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import type { ShapeBuildCommand } from './ShapeBuildCommand';

type RoundedShape = Circle | Ellipse | RoundedRectangle;

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 */
export const buildCircle: ShapeBuildCommand<RoundedShape> = {
    extension: {
        type: ExtensionType.ShapeBuilder,
        name: 'circle',
    },

    build(shape: RoundedShape, points: number[])
    {
        let x;
        let y;
        let dx;
        let dy;

        let rx;
        let ry;

        if (shape.type === 'circle')
        {
            const circle = shape as Circle;

            x = circle.x;
            y = circle.y;
            rx = ry = circle.radius;
            dx = dy = 0;
        }

        else if (shape.type === 'ellipse')
        {
            const ellipse = shape as Ellipse;

            x = ellipse.x;
            y = ellipse.y;
            rx = ellipse.halfWidth;
            ry = ellipse.halfHeight;
            dx = dy = 0;
        }
        else
        {
            const roundedRect = shape as RoundedRectangle;
            const halfWidth = roundedRect.width / 2;
            const halfHeight = roundedRect.height / 2;

            x = roundedRect.x + halfWidth;
            y = roundedRect.y + halfHeight;
            rx = ry = Math.max(0, Math.min(roundedRect.radius, Math.min(halfWidth, halfHeight)));
            dx = halfWidth - rx;
            dy = halfHeight - ry;
        }

        if (!(rx >= 0 && ry >= 0 && dx >= 0 && dy >= 0))
        {
            return points;
        }

        // Choose a number of segments such that the maximum absolute deviation from the circle is approximately 0.029
        const n = Math.ceil(2.3 * Math.sqrt(rx + ry));
        const m = (n * 8) + (dx ? 4 : 0) + (dy ? 4 : 0);

        if (m === 0)
        {
            return points;
        }

        if (n === 0)
        {
            points[0] = points[6] = x + dx;
            points[1] = points[3] = y + dy;
            points[2] = points[4] = x - dx;
            points[5] = points[7] = y - dy;

            return points;
        }

        let j1 = 0;
        let j2 = (n * 4) + (dx ? 2 : 0) + 2;
        let j3 = j2;
        let j4 = m;

        let x0 = dx + rx;
        let y0 = dy;
        let x1 = x + x0;
        let x2 = x - x0;
        let y1 = y + y0;

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

        x0 = dx;
        y0 = dy + ry;
        x1 = x + x0;
        x2 = x - x0;
        y1 = y + y0;
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

        return points;
    },

    triangulate(points, vertices, verticesStride, verticesOffset, indices, indicesOffset)
    {
        if (points.length === 0)
        {
            return;
        }

        // Compute center (average of all points)
        let centerX = 0; let
            centerY = 0;

        for (let i = 0; i < points.length; i += 2)
        {
            centerX += points[i];
            centerY += points[i + 1];
        }
        centerX /= (points.length / 2);
        centerY /= (points.length / 2);

        // Set center vertex
        let count = verticesOffset;

        vertices[count * verticesStride] = centerX;
        vertices[(count * verticesStride) + 1] = centerY;
        const centerIndex = count++;

        // Set edge vertices and indices
        for (let i = 0; i < points.length; i += 2)
        {
            vertices[count * verticesStride] = points[i];
            vertices[(count * verticesStride) + 1] = points[i + 1];

            if (i > 0)
            { // Skip first point for indices
                indices[indicesOffset++] = count;
                indices[indicesOffset++] = centerIndex;
                indices[indicesOffset++] = count - 1;
            }
            count++;
        }

        // Connect last point to the first edge point
        indices[indicesOffset++] = centerIndex + 1;
        indices[indicesOffset++] = centerIndex;
        indices[indicesOffset++] = count - 1;
    }

};

export const buildEllipse = { ...buildCircle, extension: { ...buildCircle.extension, name: 'ellipse' } };
export const buildRoundedRectangle = { ...buildCircle, extension: { ...buildCircle.extension, name: 'roundedRectangle' } };
