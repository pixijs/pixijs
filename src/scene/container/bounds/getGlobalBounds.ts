import { Matrix } from '../../../maths/matrix/Matrix';
import { boundsPool, matrixPool } from './utils/matrixAndBoundsPool';

import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
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
        matrixPool.return(pooledMatrix);
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
        target.updateLocalTransform();

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
        if ((target as Renderable).bounds)
        {
            // save a copy
            bounds.matrix = worldTransform;
            bounds.addBounds((target as Renderable).bounds);
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

        boundsPool.return(bounds);
    }

    if (!skipUpdateTransform)
    {
        matrixPool.return(worldTransform);
    }
}

export function updateTransformBackwards(target: Container, parentTransform: Matrix)
{
    const parent = target.parent;

    if (parent)
    {
        updateTransformBackwards(parent, parentTransform);

        parent.updateLocalTransform();

        parentTransform.append(parent.localTransform);
    }

    return parentTransform;
}
