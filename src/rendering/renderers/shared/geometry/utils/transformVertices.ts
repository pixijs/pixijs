import type { Matrix } from '../../../../../maths/matrix/Matrix';

/**
 * Transforms the vertices in an array with the given matrix.
 * @param vertices - the vertices to transform
 * @param m - the matrix to apply to the vertices
 * @param offset - the offset of the vertices (defaults to 0)
 * @param stride - the stride of the vertices (defaults to 2)
 * @param size - the size of the vertices (defaults to vertices.length / stride - offset)
 * @memberof rendering
 */
export function transformVertices(vertices: number[], m: Matrix, offset?: number, stride?: number, size?: number)
{
    const a = m.a;
    const b = m.b;
    const c = m.c;
    const d = m.d;
    const tx = m.tx;
    const ty = m.ty;

    offset ||= 0;
    stride ||= 2;
    size ||= (vertices.length / stride) - offset;

    let index = offset * stride;

    for (let i = 0; i < size; i++)
    {
        const x = vertices[index];
        const y = vertices[index + 1];

        vertices[index] = (a * x) + (c * y) + tx;
        vertices[index + 1] = (b * x) + (d * y) + ty;

        index += stride;
    }
}
