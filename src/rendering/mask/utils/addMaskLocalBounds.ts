import { getLocalBounds } from '../../../scene/container/bounds/getLocalBounds';
import { boundsPool, matrixPool } from '../../../scene/container/bounds/utils/matrixAndBoundsPool';
import { warn } from '../../../utils/logging/warn';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Bounds } from '../../../scene/container/bounds/Bounds';
import type { Container } from '../../../scene/container/Container';

export function addMaskLocalBounds(mask: Container, bounds: Bounds, localRoot: Container): void
{
    const boundsToMask = boundsPool.get();

    mask.measurable = true;

    const tempMatrix = matrixPool.get().identity();

    const relativeMask = getMatrixRelativeToParent(mask, localRoot, tempMatrix);

    getLocalBounds(mask, boundsToMask, relativeMask);

    mask.measurable = false;

    bounds.addBoundsMask(boundsToMask);

    matrixPool.return(tempMatrix);
    boundsPool.return(boundsToMask);
}

export function getMatrixRelativeToParent(target: Container, root: Container, matrix: Matrix): Matrix
{
    if (!target)
    {
        // we have reach the top of the tree!
        // #if _DEBUG
        warn('Mask bounds, renderable is not inside the root container');
        // #endif

        return matrix;
    }

    if (target !== root)
    {
        getMatrixRelativeToParent(target.parent, root, matrix);

        target.updateLocalTransform();

        matrix.append(target.localTransform);
    }

    return matrix;
}
