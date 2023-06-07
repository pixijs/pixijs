import type { Matrix } from '../../../../../maths/Matrix';

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
