import { Matrix } from '../../../maths/matrix/Matrix';
import { boundsPool } from './utils/matrixAndBoundsPool';

import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { RenderLayer } from '../../layers/RenderLayer';
import type { Container } from '../Container';
import type { Bounds } from './Bounds';

// TODO could we cache local bounds on the render groups?

const tempMatrix = new Matrix();
/**
 * Does exactly the same as getGlobalBounds, but instead makes use of transforming AABBs
 * of the various children within the scene graph. This is much faster, but less accurate.
 *
 * The result will never be smaller - only ever slightly larger (in most cases, it will be the same).
 *
 * When factorRenderLayers is true, this calculates the visible bounds of the container by:
 * 1. Including objects in child render layers
 * 2. Excluding objects that render in different layers than their parent
 * This gives you the actual screen space taken up by visible elements, rather than just the raw bounds
 * of all children regardless of visibility.
 * @param target - The target container to get the bounds from
 * @param bounds - The output bounds object.
 * @param factorRenderLayers - Whether to factor in render layers when calculating bounds.
 * If true, only includes objects in child render layers and excludes objects that render
 * in different layers than their parent.
 * @returns The bounds.
 */

export function getFastGlobalBounds(target: Container, bounds: Bounds, factorRenderLayers?: boolean): Bounds
{
    bounds.clear();

    _getGlobalBoundsRecursive(target, bounds, target.parentRenderLayer, !!factorRenderLayers);

    if (!bounds.isValid)
    {
        bounds.set(0, 0, 0, 0);
    }

    const renderGroup = target.renderGroup || target.parentRenderGroup;

    bounds.applyMatrix(renderGroup.worldTransform);

    return bounds;
}

export function _getGlobalBoundsRecursive(
    target: Container,
    bounds: Bounds,
    currentLayer: RenderLayer,
    factorRenderLayers: boolean
)
{
    let localBounds = bounds;

    if (factorRenderLayers && target.isRenderLayer)
    {
        const layer = target as RenderLayer;

        currentLayer = layer;

        const children = layer.renderLayerChildren;

        for (let i = 0; i < children.length; i++)
        {
            _getGlobalBoundsRecursive(children[i], localBounds, currentLayer, factorRenderLayers);
        }

        return;
    }

    if (factorRenderLayers && target.parentRenderLayer !== currentLayer) return;

    if (target.localDisplayStatus !== 0b111 || (!target.measurable))
    {
        return;
    }

    const manageEffects = !!target.effects.length;

    if (target.renderGroup || manageEffects)
    {
        localBounds = boundsPool.get().clear();
    }

    if (target.boundsArea)
    {
        bounds.addRect(target.boundsArea, target.worldTransform);
    }
    else
    {
        if (target.renderPipeId)
        {
            const viewBounds = (target as Renderable).bounds;

            localBounds.addFrame(
                viewBounds.minX,
                viewBounds.minY,
                viewBounds.maxX,
                viewBounds.maxY,
                target.groupTransform
            );
        }

        const children = target.children;

        for (let i = 0; i < children.length; i++)
        {
            _getGlobalBoundsRecursive(children[i], localBounds, currentLayer, factorRenderLayers);
        }
    }

    if (manageEffects)
    {
        let advanced = false;

        const renderGroup = target.renderGroup || target.parentRenderGroup;

        for (let i = 0; i < target.effects.length; i++)
        {
            if (target.effects[i].addBounds)
            {
                if (!advanced)
                {
                    advanced = true;
                    localBounds.applyMatrix(renderGroup.worldTransform);
                }

                target.effects[i].addBounds(localBounds, true);
            }
        }

        if (advanced)
        {
            localBounds.applyMatrix(renderGroup.worldTransform.copyTo(tempMatrix).invert());
            bounds.addBounds(localBounds, target.relativeGroupTransform);
        }

        bounds.addBounds(localBounds);
        boundsPool.return(localBounds);
    }
    else if (target.renderGroup)
    {
        bounds.addBounds(localBounds, target.relativeGroupTransform);
        boundsPool.return(localBounds);
    }
}
