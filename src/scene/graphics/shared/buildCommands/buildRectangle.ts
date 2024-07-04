import { ExtensionType } from '../../../../extensions/Extensions';

import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { ShapeBuildCommand } from './ShapeBuildCommand';

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 */
export const buildRectangle: ShapeBuildCommand<Rectangle> = {
    extension: {
        type: ExtensionType.ShapeBuilder,
        name: 'rectangle',
    },

    build(shape: Rectangle, points: number[]): number[]
    {
        const rectData = shape;
        const x = rectData.x;
        const y = rectData.y;
        const width = rectData.width;
        const height = rectData.height;

        if (!(width >= 0 && height >= 0))
        {
            return points;
        }

        points[0] = x;
        points[1] = y;
        points[2] = x + width;
        points[3] = y;
        points[4] = x + width;
        points[5] = y + height;
        points[6] = x;
        points[7] = y + height;

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

        vertices[verticesOffset + count] = points[6];
        vertices[verticesOffset + count + 1] = points[7];

        count += verticesStride;

        vertices[verticesOffset + count] = points[4];
        vertices[verticesOffset + count + 1] = points[5];

        count += verticesStride;

        const verticesIndex = verticesOffset / verticesStride;

        // triangle 1
        indices[indicesOffset++] = verticesIndex;
        indices[indicesOffset++] = verticesIndex + 1;
        indices[indicesOffset++] = verticesIndex + 2;

        // triangle 2
        indices[indicesOffset++] = verticesIndex + 1;
        indices[indicesOffset++] = verticesIndex + 3;
        indices[indicesOffset++] = verticesIndex + 2;
    },
};
