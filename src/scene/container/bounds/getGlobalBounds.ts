import { Matrix } from '../../../maths/matrix/Matrix';
import { updateLocalTransform } from '../utils/updateLocalTransform';
import { boundsPool, matrixPool } from './utils/matrixAndBoundsPool';

import type { Container } from '../Container';
import type { Bounds } from './Bounds';

export function getGlobalBounds(target: Container, skipUpdateTransform: boolean, bounds: Bounds): Bounds
{
    bounds.clear();

    let parentTransform;
    let pooledMatrix;

    if (target.parent)
    {
        if (!skipUpdateTransform)
        {
            pooledMatrix = matrixPool.get().identity();
            parentTransform = updateTransformBackwards(target, pooledMatrix);
        }
        else
        {
            parentTransform = target.parent.worldTransform;
        }
    }
    else
    {
        parentTransform = Matrix.IDENTITY;
    }

    // then collect them...

    _getGlobalBounds(target, bounds, parentTransform, skipUpdateTransform);

    if (pooledMatrix)
    {
        matrixPool.put(pooledMatrix);
    }

    if (!bounds.isValid)
    {
        bounds.set(0, 0, 0, 0);
    }

    return bounds;
}

export function _getGlobalBounds(
    target: Container,
    bounds: Bounds,
    parentTransform: Matrix,
    skipUpdateTransform: boolean,
): void
{
    if (!target.visible || !target.measurable) return;

    let worldTransform: Matrix;

    if (!skipUpdateTransform)
    {
        if (target.didChange)
        {
            updateLocalTransform(target.localTransform, target);
        }

        worldTransform = matrixPool.get();

        worldTransform.appendFrom(target.localTransform, parentTransform);
    }
    else
    {
        worldTransform = target.worldTransform;
    }

    const parentBounds = bounds;
    const preserveBounds = !!target.effects.length;

    if (preserveBounds)
    {
        bounds = boundsPool.get().clear();
    }

    if (target.boundsArea)
    {
        bounds.addRect(target.boundsArea, worldTransform);
    }
    else
    {
        if (target.view)
        {
            // save a copy
            bounds.matrix = worldTransform;

            target.view.addBounds(bounds);
        }

        for (let i = 0; i < target.children.length; i++)
        {
            _getGlobalBounds(target.children[i], bounds, worldTransform, skipUpdateTransform);
        }
    }

    if (preserveBounds)
    {
        for (let i = 0; i < target.effects.length; i++)
        {
            target.effects[i].addBounds?.(bounds);
        }

        parentBounds.addBounds(bounds, Matrix.IDENTITY);

        boundsPool.put(bounds);
    }

    if (!skipUpdateTransform)
    {
        matrixPool.put(worldTransform);
    }
}

export function updateTransformBackwards(target: Container, parentTransform: Matrix)
{
    const parent = target.parent;

    if (parent)
    {
        updateTransformBackwards(parent, parentTransform);

        if (parent.didChange)
        {
            updateLocalTransform(parent.localTransform, parent);
        }

        parentTransform.append(parent.localTransform);
    }

    return parentTransform;
}
