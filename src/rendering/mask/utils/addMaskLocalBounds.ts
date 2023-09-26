import { Matrix } from '../../../maths/matrix/Matrix';
import { Bounds } from '../../../scene/container/bounds/Bounds';
import { getLocalBounds } from '../../../scene/container/bounds/getLocalBounds';
import { updateLocalTransform } from '../../../scene/container/utils/updateLocalTransform';
import { warn } from '../../../utils/logging/warn';

import type { Container } from '../../../scene/container/Container';

export function addMaskLocalBounds(mask: Container, bounds: Bounds, localRoot: Container): void
{
    const boundsToMask = new Bounds();

    mask.measurable = true;

    const relativeMask = getMatrixRelativeToParent(mask, localRoot, new Matrix());

    getLocalBounds(mask, boundsToMask, relativeMask);

    // // transform bounds to
    mask.measurable = false;

    bounds.addBoundsMask(boundsToMask);
}

export function getMatrixRelativeToParent(target: Container, root: Container, matrix: Matrix): Matrix
{
    if (!target)
    {
        // we have reach the top of the tree!
        // #if _DEBUG
        warn('Item is not inside the root container');
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
