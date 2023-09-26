import { default as earcut } from 'earcut';

export function triangulateWithHoles(
    points: number[],
    holes: number[],
    vertices: number[],
    verticesStride: number,
    verticesOffset: number,

    indices: number[],
    indicesOffset: number
)
{
    const triangles = earcut(points, holes, 2);

    if (!triangles)
    {
        return;
    }

    for (let i = 0; i < triangles.length; i += 3)
    {
        indices[indicesOffset++] = (triangles[i] + verticesOffset);
        indices[indicesOffset++] = (triangles[i + 1] + verticesOffset);
        indices[indicesOffset++] = (triangles[i + 2] + verticesOffset);
    }

    let index = verticesOffset * verticesStride;

    for (let i = 0; i < points.length; i += 2)
    {
        vertices[index] = points[i];
        vertices[index + 1] = points[i + 1];

        index += verticesStride;
    }
}

