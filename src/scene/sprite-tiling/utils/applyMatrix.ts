import type { Matrix } from '../../../maths/matrix/Matrix';
import type { TypedArray } from '../../../rendering/renderers/shared/buffer/Buffer';

export function applyMatrix(array: TypedArray, stride: number, offset: number, matrix: Matrix)
{
    let index = 0;
    const size = array.length / (stride || 2);

    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    const tx = matrix.tx;
    const ty = matrix.ty;

    offset *= stride;

    while (index < size)
    {
        const x = array[offset];
        const y = array[offset + 1];

        array[offset] = (a * x) + (c * y) + tx;
        array[offset + 1] = (b * x) + (d * y) + ty;

        offset += stride;

        index++;
    }
}
