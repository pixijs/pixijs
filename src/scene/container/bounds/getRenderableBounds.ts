import { Matrix } from '../../../maths';

import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Bounds } from './Bounds';

/**
 * This matrix is used for calculations of the bounds for renderables placed inside cacheAsTexture render groups.
 * @ignore
 * @internal
 */
const tempProjectionMatrix: Matrix = new Matrix();

/**
 * @param renderables
 * @param bounds
 * @internal
 */
export function getGlobalRenderableBounds(renderables: Renderable[], bounds: Bounds): Bounds
{
    bounds.clear();

    // instead of copying the matrix each time we are assigning it in bounds
    // this is a performance hack :D
    // so we need to restore the matrix after we are done

    const actualMatrix = bounds.matrix;

    for (let i = 0; i < renderables.length; i++)
    {
        const renderable = renderables[i];

        if (renderable.globalDisplayStatus < 0b111)
        {
            continue;
        }

        const renderGroup = renderable.renderGroup ?? renderable.parentRenderGroup;

        if (renderGroup?.isCachedAsTexture)
        {
            bounds.matrix = tempProjectionMatrix.copyFrom(renderGroup.textureOffsetInverseTransform)
                .append(renderable.worldTransform);
        }
        else if (renderGroup?._parentCacheAsTextureRenderGroup)
        {
            bounds.matrix = tempProjectionMatrix
                .copyFrom(renderGroup._parentCacheAsTextureRenderGroup.inverseWorldTransform)
                .append(renderable.groupTransform);
        }
        else
        {
            bounds.matrix = renderable.worldTransform;
        }

        bounds.addBounds(renderable.bounds);
    }

    bounds.matrix = actualMatrix;

    return bounds;
}
