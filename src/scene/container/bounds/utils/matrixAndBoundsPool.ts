import { Matrix } from '../../../../maths/matrix/Matrix';
import { Pool } from '../../../../utils/pool/Pool';
import { PoolCollector } from '../../../../utils/pool/PoolCollector';
import { Bounds } from '../Bounds';

import type { PoolItem } from '../../../../utils/pool/Pool';

type MatrixPoolItem = Matrix & PoolItem;
type BoundsPoolItem = Bounds & PoolItem;
/** @internal */
export const matrixPool = new Pool<MatrixPoolItem>(Matrix);
/** @internal */
export const boundsPool = new Pool<BoundsPoolItem>(Bounds);

// Register the pools with the PoolCollector for cleanup
PoolCollector.register(matrixPool);
PoolCollector.register(boundsPool);
