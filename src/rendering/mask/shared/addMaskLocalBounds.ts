import { Matrix } from '../../../maths/Matrix';
import { Bounds } from '../../scene/bounds/Bounds';
import { getLocalBounds } from '../../scene/bounds/getLocalBounds';
import { updateLocalTransform } from '../../scene/utils/updateLocalTransform';

import type { Container } from '../../scene/Container';

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
        console.warn('Item is not inside the root container');

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
