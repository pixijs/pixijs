import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../Container';

/**
 * Updates the local transform of a container based on its properties.
 * @param lt - The matrix to update with the local transform values.
 * @param container - The container whose local transform is being updated.
 * @deprecated
 * @internal
 */
export function updateLocalTransform(lt: Matrix, container: Container): void
{
    const scale = container._scale;
    const pivot = container._pivot;
    const position = container._position;

    const sx = scale._x;
    const sy = scale._y;

    const px = pivot._x;
    const py = pivot._y;

    // get the matrix values of the container based on its this properties..
    lt.a = container._cx * sx;
    lt.b = container._sx * sx;
    lt.c = container._cy * sy;
    lt.d = container._sy * sy;

    lt.tx = position._x - ((px * lt.a) + (py * lt.c));
    lt.ty = position._y - ((px * lt.b) + (py * lt.d));
}
