import { Matrix } from '../../../maths/matrix/Matrix';
import { updateLocalTransform } from '../utils/updateLocalTransform';

import type { Container } from '../Container';
import type { Bounds } from './Bounds';

export function getGlobalBounds(target: Container, skipUpdateTransform: boolean, bounds: Bounds): Bounds
{
    bounds.clear();

    let parentTransform;

    if (target.parent)
    {
        if (!skipUpdateTransform)
        {
            // TODO new Matrix.. EEEWW! pooling..
            parentTransform = updateTransformBackwards(target, new Matrix());
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

        worldTransform = Matrix.shared.appendFrom(target.localTransform, parentTransform).clone();
    }
    else
    {
        worldTransform = target.worldTransform;
    }

    const parentBounds = bounds;
    const preserveBounds = !!target.effects.length;

    if (preserveBounds)
    {
        // TODO - cloning bounds is slow, we should have a pool (its on the todo list!)
        bounds = bounds.clone();
    }

    if (target.boundsArea)
    {
        bounds.setMatrix(worldTransform);
        bounds.addRect(target.boundsArea);
    }
    else
    {
        if (target.view)
        {
            bounds.setMatrix(worldTransform);

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

        parentBounds.setMatrix(Matrix.IDENTITY);
        parentBounds.addBounds(bounds);
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

