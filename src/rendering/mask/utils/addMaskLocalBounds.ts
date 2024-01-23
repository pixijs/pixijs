import { Bounds } from '../../../scene/container/bounds/Bounds';
import { getLocalBounds } from '../../../scene/container/bounds/getLocalBounds';
import { matrixPool } from '../../../scene/container/bounds/utils/matrixAndBoundsPool';
import { updateLocalTransform } from '../../../scene/container/utils/updateLocalTransform';
import { warn } from '../../../utils/logging/warn';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../../../scene/container/Container';

export function addMaskLocalBounds(mask: Container, bounds: Bounds, localRoot: Container): void
{
    const boundsToMask = new Bounds();

    mask.measurable = true;

    const tempMatrix = matrixPool.get();

    const relativeMask = getMatrixRelativeToParent(mask, localRoot, tempMatrix);

    getLocalBounds(mask, boundsToMask, relativeMask);

    // // transform bounds to
    mask.measurable = false;

    bounds.addBoundsMask(boundsToMask);

    matrixPool.return(tempMatrix);
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

        if (target.didChange)
        {
            updateLocalTransform(target.localTransform, target);
        }

        matrix.append(target.localTransform);
    }

    return matrix;
}
