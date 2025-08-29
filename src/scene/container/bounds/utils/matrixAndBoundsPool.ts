import { Matrix } from '../../../../maths/matrix/Matrix';
import { BigPool } from '../../../../utils/pool/PoolGroup';
import { Bounds } from '../Bounds';

import type { PoolItem } from '../../../../utils/pool/Pool';

type MatrixPoolItem = Matrix & PoolItem;
type BoundsPoolItem = Bounds & PoolItem;
/** @internal */
export const matrixPool = BigPool.getPool<MatrixPoolItem>(Matrix);
/** @internal */
export const boundsPool = BigPool.getPool<BoundsPoolItem>(Bounds);
