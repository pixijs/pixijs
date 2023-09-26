import { buildSimpleUvs, buildUvs } from '../../../../rendering/renderers/shared/geometry/utils/buildUvs';
import { transformVertices } from '../../../../rendering/renderers/shared/geometry/utils/transformVertices';
import { MeshGeometry } from '../../../mesh/shared/MeshGeometry';
import { buildCircle } from '../buildCommands/buildCircle';
import { buildPolygon } from '../buildCommands/buildPolygon';
import { buildRectangle } from '../buildCommands/buildRectangle';
import { buildTriangle } from '../buildCommands/buildTriangle';

import type { Matrix } from '../../../../maths/matrix/Matrix';
import type { ShapeBuildCommand } from '../buildCommands/ShapeBuildCommand';
import type { GraphicsPath } from '../path/GraphicsPath';

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
    path: GraphicsPath
    textureMatrix?: Matrix
    out: MeshGeometry
}

export function buildGeometryFromPath(options: GeometryPathOptions): MeshGeometry
{
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
