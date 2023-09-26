import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../Container';

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
