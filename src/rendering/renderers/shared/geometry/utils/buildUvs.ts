import type { Matrix } from '../../../../../maths/matrix/Matrix';

/**
 * Takes a vertices array and a matrix and transforms the vertices based on the matrix.
 * this out put is written to the uvs array
 * @param vertices - the vertices to calculate uvs from
 * @param verticesStride - the stride of the vertice
 * @param verticesOffset - the offset of the vertices
 * @param uvs - the uvs to fill
 * @param uvsOffset - the offset of the uvs
 * @param uvsStride - the stride of the uvs
 * @param size - the size of the vertices
 * @param matrix - the matrix to apply to the uvs
 * @memberof rendering
 */
export function buildUvs(
    vertices: number[],
    verticesStride: number,
    verticesOffset: number,

    uvs: number[],
    uvsOffset: number,
    uvsStride: number,

    size: number,
    matrix: Matrix = null
): void
{
    let index = 0;

    verticesOffset *= verticesStride;
    uvsOffset *= uvsStride;

    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    const tx = matrix.tx;
    const ty = matrix.ty;

    while (index < size)
    {
        const x = vertices[verticesOffset];
        const y = vertices[verticesOffset + 1];

        uvs[uvsOffset] = (a * x) + (c * y) + tx;
        uvs[uvsOffset + 1] = (b * x) + (d * y) + ty;

        uvsOffset += uvsStride;

        verticesOffset += verticesStride;

        index++;
    }
}

export function buildSimpleUvs(
    uvs: number[],
    uvsOffset: number,
    uvsStride: number,
    size: number,
)
{
    let index = 0;

    uvsOffset *= uvsStride;

    while (index < size)
    {
        uvs[uvsOffset] = 0;
        uvs[uvsOffset + 1] = 0;

        uvsOffset += uvsStride;

        index++;
    }
}
