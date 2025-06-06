import { Matrix } from '../../../maths/matrix/Matrix';
import { boundsPool, matrixPool } from './utils/matrixAndBoundsPool';

import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Container } from '../Container';
import type { Bounds } from './Bounds';

/**
 * @param target
 * @param bounds
 * @param relativeMatrix
 * @internal
 */
export function getLocalBounds(target: Container, bounds: Bounds, relativeMatrix?: Matrix): Bounds
{
    bounds.clear();

    relativeMatrix ||= Matrix.IDENTITY;

    _getLocalBounds(target, bounds, relativeMatrix, target, true);

    if (!bounds.isValid)
    {
        bounds.set(0, 0, 0, 0);
    }

    return bounds;
}

function _getLocalBounds(
    target: Container,
    bounds: Bounds,
    parentTransform: Matrix,
    rootContainer: Container,
    isRoot: boolean
): void
{
    let relativeTransform: Matrix;

    if (!isRoot)
    {
        if (!target.visible || !target.measurable) return;

        target.updateLocalTransform();

        const localTransform = target.localTransform;

        relativeTransform = matrixPool.get();
        relativeTransform.appendFrom(localTransform, parentTransform);
    }
    else
    {
        relativeTransform = matrixPool.get();
        relativeTransform = parentTransform.copyTo(relativeTransform);
    }

    const parentBounds = bounds;
    const preserveBounds = !!target.effects.length;

    if (preserveBounds)
    {
        bounds = boundsPool.get().clear();
    }

    if (target.boundsArea)
    {
        bounds.addRect(target.boundsArea, relativeTransform);
    }
    else
    {
        if (target.renderPipeId)
        {
            bounds.matrix = relativeTransform;
            bounds.addBounds((target as Renderable).bounds);
        }

        const children = target.children;

        for (let i = 0; i < children.length; i++)
        {
            _getLocalBounds(children[i], bounds, relativeTransform, rootContainer, false);
        }
    }

    if (preserveBounds)
    {
        for (let i = 0; i < target.effects.length; i++)
        {
            target.effects[i].addLocalBounds?.(bounds, rootContainer);
        }

        // TODO - make a add transformed bounds?
        parentBounds.addBounds(bounds, Matrix.IDENTITY);

        boundsPool.return(bounds);
    }

    matrixPool.return(relativeTransform);
}

