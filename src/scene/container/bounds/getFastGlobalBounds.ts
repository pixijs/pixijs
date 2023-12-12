import { Bounds } from './Bounds';

import type { Container } from '../Container';

// TODO could we cache local bounds on the render groups?

export function getFastGlobalBounds(target: Container, bounds: Bounds): Bounds
{
    bounds.clear();

    _getGlobalBoundsRecursive(target, bounds);

    if (!target.isRenderGroupRoot)
    {
        bounds.applyMatrix(target.renderGroup.worldTransform);
    }

    if (!bounds.isValid)
    {
        bounds.set(0, 0, 0, 0);
    }

    return bounds;
}

export function _getGlobalBoundsRecursive(
    target: Container,
    bounds: Bounds,
)
{
    if (target.localVisibleRenderable !== 0b11 || !target.measurable)
    {
        return;
    }

    const manageEffects = !!target.effects.length;

    let localBounds = bounds;

    if (target.isRenderGroupRoot || manageEffects)
    {
        localBounds = new Bounds();
    }

    if (target.boundsArea)
    {
        bounds.addRect(target.boundsArea, target.worldTransform);
    }
    else
    {
        if (target.view)
        {
            const viewBounds = target.view.bounds;

            localBounds.addFrame(
                viewBounds.minX,
                viewBounds.minY,
                viewBounds.maxX,
                viewBounds.maxY,
                target.rgTransform
            );
        }

        const children = target.children;

        for (let i = 0; i < children.length; i++)
        {
            _getGlobalBoundsRecursive(children[i], localBounds);
        }
    }

    if (manageEffects)
    {
        let advanced = false;

        for (let i = 0; i < target.effects.length; i++)
        {
            if (target.effects[i].addBounds)
            {
                if (!advanced)
                {
                    advanced = true;
                    localBounds.applyMatrix(target.renderGroup.worldTransform);
                }

                target.effects[i].addBounds?.(localBounds);
            }
        }

        if (advanced)
        {
            localBounds.applyMatrix(target.renderGroup.worldTransform.clone().invert());
            bounds.addBounds(localBounds, target.rgTransform);
        }

        bounds.addBounds(localBounds);
    }
    else if (target.isRenderGroupRoot)
    {
        bounds.addBounds(localBounds, target.rgTransform);
    }
}
