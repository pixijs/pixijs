import { Bounds } from '../../scene/container/bounds/Bounds';

import type { Point } from '../../maths/point/Point';
import type { PointData } from '../../maths/point/PointData';
import type { Renderable } from '../../rendering/renderers/shared/Renderable';
import type { Container } from '../../scene/container/Container';

const tempLocalMapping = { x: 0, y: 0 };

export function isRenderable(container: Container): boolean
{
    return !!container || container.visible || container.renderable || container.includeInBuild || container.measurable;
}

export function prune(
    container: Container,
    location: PointData,
    interactiveListCount: number,
    seenCount: number,
    hitTestFn: (container: Container, location: Point) => boolean
): boolean
{
    // if we have hit tested everything in the interactive list then we can ignore the rest
    if (seenCount === interactiveListCount)
    {
        return true;
    }

    // If container is a mask, invisible, or not renderable then it cannot be hit directly.
    if (!isRenderable(container))
    {
        return true;
    }

    // check if container is a hitArea
    if (container.hitArea)
    {
        container.worldTransform.applyInverse(location, tempLocalMapping);

        if (!container.hitArea.contains(tempLocalMapping.x, tempLocalMapping.y))
        {
            return true;
        }
    }

    // if the container has a mask, check that it applies to the hit test
    if (container.effects?.length)
    {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < container.effects.length; i++)
        {
            const effect = container.effects[i];

            if (effect.containsPoint)
            {
                const effectContainsPoint = effect.containsPoint(location, hitTestFn);

                if (!effectContainsPoint)
                {
                    return true;
                }
            }
        }
    }

    return false;
}

const tempB = new Bounds();

/**
 * Checks whether the container passes hit testing for the given location.
 * @param container - The container to test.
 * @param location - The location to test for overlap.
 * @returns - Whether `container` passes hit testing for `location`.
 */
export function hitTestFn(container: Container, location: Point): boolean
{
    // If the container failed pruning with a hitArea, then it must pass it.
    if (container.hitArea)
    {
        return true;
    }

    if ((container as Renderable)?.containsPoint)
    {
        container.worldTransform.applyInverse(location, tempLocalMapping);

        return (container as Renderable).containsPoint(tempLocalMapping as Point) as boolean;
    }

    // if neither hitArea nor containsPoint, then lets use the bounds
    const bounds = container.getBounds(true, tempB);

    return bounds.rectangle.contains(location.x, location.y);
}
