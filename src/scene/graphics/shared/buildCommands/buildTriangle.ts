import { ExtensionType } from '../../../../extensions/Extensions';

import type { Triangle } from '../../../../maths/shapes/Triangle';
import type { ShapeBuildCommand } from './ShapeBuildCommand';

/**
 * Builds a triangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 */
export const buildTriangle: ShapeBuildCommand<Triangle> = {
    extension: {
        type: ExtensionType.ShapeBuilder,
        name: 'triangle',
    },

    build(shape: Triangle, points: number[]): number[]
    {
        points[0] = shape.x;
        points[1] = shape.y;
        points[2] = shape.x2;
        points[3] = shape.y2;
        points[4] = shape.x3;
        points[5] = shape.y3;

        return points;
    },

    triangulate(
        points: number[],

        vertices: number[],
        verticesStride: number,
        verticesOffset: number,

        indices: number[],
        indicesOffset: number
    )
    {
        let count = 0;

        verticesOffset *= verticesStride;

        vertices[verticesOffset + count] = points[0];
        vertices[verticesOffset + count + 1] = points[1];

        count += verticesStride;

        vertices[verticesOffset + count] = points[2];
        vertices[verticesOffset + count + 1] = points[3];

        count += verticesStride;

        vertices[verticesOffset + count] = points[4];
        vertices[verticesOffset + count + 1] = points[5];

        const verticesIndex = verticesOffset / verticesStride;

        // triangle 1
        indices[indicesOffset++] = verticesIndex;
        indices[indicesOffset++] = verticesIndex + 1;
        indices[indicesOffset++] = verticesIndex + 2;
    },
};
