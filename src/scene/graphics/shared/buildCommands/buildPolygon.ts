import { ExtensionType } from '../../../../extensions/Extensions';
import { triangulateWithHoles } from '../utils/triangulateWithHoles';

import type { Polygon } from '../../../../maths/shapes/Polygon';
import type { ShapeBuildCommand } from './ShapeBuildCommand';

const emptyArray: number[] = [];

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 * @ignore
 * @private
 */
export const buildPolygon: ShapeBuildCommand<Polygon> = {
    extension: {
        type: ExtensionType.ShapeBuilder,
        name: 'polygon',
    },

    build(shape: Polygon, points: number[]): number[]
    {
        for (let i = 0; i < shape.points.length; i++)
        {
            points[i] = shape.points[i];
        }

        return points;
    },

    triangulate(
        points: number[],
        //  holes: number[],
        vertices: number[],
        verticesStride: number,
        verticesOffset: number,

        indices: number[],
        indicesOffset: number
    )
    {
        triangulateWithHoles(points, emptyArray, vertices, verticesStride, verticesOffset, indices, indicesOffset);
    },

};
