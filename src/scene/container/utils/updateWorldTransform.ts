import type { Matrix } from '../../../maths/matrix/Matrix';

export function updateWorldTransform(local: Matrix, parent: Matrix, world: Matrix): void
{
    const lta = local.a;
    const ltb = local.b;
    const ltc = local.c;
    const ltd = local.d;
    const lttx = local.tx;
    const ltty = local.ty;

    const pta = parent.a;
    const ptb = parent.b;
    const ptc = parent.c;
    const ptd = parent.d;

    world.a = (lta * pta) + (ltb * ptc);
    world.b = (lta * ptb) + (ltb * ptd);
    world.c = (ltc * pta) + (ltd * ptc);
    world.d = (ltc * ptb) + (ltd * ptd);
    world.tx = (lttx * pta) + (ltty * ptc) + parent.tx;
    world.ty = (lttx * ptb) + (ltty * ptd) + parent.ty;
}
