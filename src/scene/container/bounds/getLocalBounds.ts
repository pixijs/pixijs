import { Matrix } from '../../../maths/matrix/Matrix';
import { warn } from '../../../utils/logging/warn';
import { updateLocalTransform } from '../utils/updateLocalTransform';
import { Bounds } from './Bounds';

import type { Container } from '../Container';

export function getLocalBounds(target: Container, bounds: Bounds, relativeMatrix?: Matrix): Bounds
{
    bounds.clear();

    // if (!target.visible)// || !target.measurable)
    // {
    //     bounds.set(0, 0, 0, 0);

    //     return bounds;
    // }

    relativeMatrix ||= new Matrix();

    if (target.boundsArea)
    {
        bounds.setMatrix(relativeMatrix);
        bounds.addRect(target.boundsArea);
    }
    else if (target.view)
    {
        bounds.setMatrix(relativeMatrix);
        target.view.addBounds(bounds);
    }

    for (let i = 0; i < target.children.length; i++)
    {
        _getLocalBounds(target.children[i], bounds, relativeMatrix, target);
    }

    if (!bounds.isValid)
    {
        bounds.set(0, 0, 0, 0);
    }

    return bounds;
}

function _getLocalBounds(target: Container, bounds: Bounds, parentTransform: Matrix, rootContainer: Container): void
{
    if (!target.visible || !target.measurable) return;

    // // make sure localTransform is upto date...
    if (target.didChange)
    {
        updateLocalTransform(target.localTransform, target);
    }

    const localTransform = target.localTransform;

    const relativeTransform = Matrix.shared.appendFrom(localTransform, parentTransform).clone();

    const parentBounds = bounds;
    const preserveBounds = !!target.effects.length;

    if (preserveBounds)
    {
        // TODO - cloning bounds is slow, we should have a pool (its on the todo list!)
        bounds = new Bounds();
    }

    if (target.boundsArea)
    {
        bounds.setMatrix(relativeTransform);
        bounds.addRect(target.boundsArea);
    }
    else
    {
        if (target.view)
        {
            bounds.setMatrix(relativeTransform);

            target.view.addBounds(bounds);
        }

        for (let i = 0; i < target.children.length; i++)
        {
            _getLocalBounds(target.children[i], bounds, relativeTransform, rootContainer);
        }
    }

    if (preserveBounds)
    {
        for (let i = 0; i < target.effects.length; i++)
        {
            target.effects[i].addLocalBounds?.(bounds, rootContainer);
        }

        // TODO - make a add transformed bounds?
        parentBounds.setMatrix(Matrix.IDENTITY);
        parentBounds.addBounds(bounds);
    }
}

export function getParent(target: Container, root: Container, matrix: Matrix)
{
    const parent = target.parent;

    if (!parent)
    {
        // we have reach the top of the tree!
        // #if _DEBUG
        warn('Item is not inside the root container');
        // #endif

        return;
    }

    if (parent !== root)
    {
        getParent(parent, root, matrix);

        updateLocalTransform(parent.localTransform, parent);
        matrix.append(parent.localTransform);
    }
}

