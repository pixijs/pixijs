import type { Matrix } from '../../../../maths/matrix/Matrix';

export function calculateProjection(
    pm: Matrix,
    x: number,
    y: number,
    width: number,
    height: number,
    flipY: boolean
): Matrix
{
    const sign = flipY ? 1 : -1;

    pm.identity();

    pm.a = (1 / width * 2);
    pm.d = sign * (1 / height * 2);

    pm.tx = -1 - (x * pm.a);
    pm.ty = -sign - (y * pm.d);

    return pm;
}
