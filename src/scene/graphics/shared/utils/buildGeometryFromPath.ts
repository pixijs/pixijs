import { buildSimpleUvs, buildUvs } from '../../../../rendering/renderers/shared/geometry/utils/buildUvs';
import { transformVertices } from '../../../../rendering/renderers/shared/geometry/utils/transformVertices';
import { MeshGeometry } from '../../../mesh/shared/MeshGeometry';
import { buildCircle } from '../buildCommands/buildCircle';
import { buildPolygon } from '../buildCommands/buildPolygon';
import { buildRectangle } from '../buildCommands/buildRectangle';
import { buildTriangle } from '../buildCommands/buildTriangle';
import { GraphicsPath } from '../path/GraphicsPath';

import type { Matrix } from '../../../../maths/matrix/Matrix';
import type { ShapeBuildCommand } from '../buildCommands/ShapeBuildCommand';

const buildMap: Record<string, ShapeBuildCommand> = {
    rectangle: buildRectangle,
    polygon: buildPolygon,
    triangle: buildTriangle,
    circle: buildCircle,
    ellipse: buildCircle,
    roundedRectangle: buildCircle,
};

export interface GeometryPathOptions
{
    /** the path to build the geometry from */
    path: GraphicsPath
    /** a `Matrix` that can be used to modify the the texture UVs of the the path being built */
    textureMatrix?: Matrix
    /** an optional `MeshGeometry` to write too instead of creating a new one*/
    out?: MeshGeometry
}

/**
 * When building a mesh, it helps to leverage the simple API we have in `GraphicsPath` as it can often be easier to
 * to define the geometry in a more human readable way. This function takes a `GraphicsPath` and returns a `MeshGeometry`.
 * @example
 * ```ts
 *
 * const path = new GraphicsPath()
 *    .drawRect(0, 0, 100, 100)
 *
 * const geometry:MeshGeometry = buildGeometryFromPath(path);
 *
 * const mesh = new Mesh({geometry});
 *
 * ```
 * You can also pass in a Matrix to transform the uvs as by default you may want to control how they are set up.
 * @param options - either a `GraphicsPath` or `GeometryPathOptions`
 * @returns a new `MeshGeometry` instance build from the path
 */
export function buildGeometryFromPath(options: GraphicsPath | GeometryPathOptions): MeshGeometry
{
    if (options instanceof GraphicsPath)
    {
        options = {
            path: options,
            textureMatrix: null,
            out: null,
        };
    }

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // build path collection of polygons and shapes points..
    const shapePath = options.path.shapePath;
    const textureMatrix = options.textureMatrix;

    shapePath.shapePrimitives.forEach(({ shape, transform: matrix }) =>
    {
        const indexOffset = indices.length;
        const vertOffset = vertices.length / 2;

        const points: number[] = [];

        const build = buildMap[shape.type];

        build.build(shape, points);

        if (matrix)
        {
            transformVertices(points, matrix);
        }

        build.triangulate(points, vertices, 2, vertOffset, indices, indexOffset);

        const uvsOffset = uvs.length / 2;

        if (textureMatrix)
        {
            // todo can prolly do this before calculating uvs..
            if (matrix)
            {
                textureMatrix.append(matrix.clone().invert());
            }

            buildUvs(vertices, 2, vertOffset, uvs, uvsOffset, 2, (vertices.length / 2) - vertOffset, textureMatrix);
        }
        else
        {
            buildSimpleUvs(uvs, uvsOffset, 2, (vertices.length / 2) - vertOffset);
        }
    });

    const out = options.out;

    if (out)
    {
        out.positions = new Float32Array(vertices);
        out.uvs = new Float32Array(uvs);
        out.indices = new Uint32Array(indices);

        return out;
    }

    const geometry = new MeshGeometry({
        positions: new Float32Array(vertices),
        uvs: new Float32Array(uvs),
        indices: new Uint32Array(indices),
    });

    return geometry;
}
