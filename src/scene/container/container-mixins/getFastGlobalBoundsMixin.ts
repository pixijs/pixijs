import { type Bounds } from '../bounds/Bounds';
import { boundsPool } from '../bounds/utils/matrixAndBoundsPool';
import { Matrix } from '~/maths/matrix/Matrix';
import { type Renderable } from '~/rendering/renderers/shared/Renderable';
import { type RenderLayer } from '~/scene/layers/RenderLayer';

import type { Container } from '../Container';

const tempMatrix = new Matrix();

export interface GetFastGlobalBoundsMixin
{
    getFastGlobalBounds(bounds: Bounds, factorRenderLayers?: boolean): Bounds
    _getGlobalBoundsRecursive(
        target: Container,
        bounds: Bounds,
        currentLayer: RenderLayer,
        factorRenderLayers: boolean
    ): void;
}

export const getFastGlobalBoundsMixin: Partial<Container> = {
    getFastGlobalBounds(bounds: Bounds, factorRenderLayers?: boolean): Bounds
    {
        bounds.clear();

        this._getGlobalBoundsRecursive(this, bounds, this.parentRenderLayer, !!factorRenderLayers);

        if (!bounds.isValid)
        {
            bounds.set(0, 0, 0, 0);
        }

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        bounds.applyMatrix(renderGroup.worldTransform);

        return bounds;
    },

    _getGlobalBoundsRecursive(
        target: Container,
        bounds: Bounds,
        currentLayer: RenderLayer,
        factorRenderLayers: boolean
    )
    {
        let localBounds = bounds;

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
                this._getGlobalBoundsRecursive(children[i], localBounds, currentLayer, factorRenderLayers);
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

} as Container;
