import { type Bounds } from '../bounds/Bounds';
import { boundsPool } from '../bounds/utils/matrixAndBoundsPool';
import { Matrix } from '~/maths/matrix/Matrix';
import { type Renderable } from '~/rendering/renderers/shared/Renderable';
import { type RenderLayerClass } from '~/scene/layers/RenderLayer';

import type { Container } from '../Container';

const tempMatrix = new Matrix();

export interface GetFastGlobalBoundsMixin
{
    getFastGlobalBounds(bounds: Bounds, factorRenderLayers?: boolean): Bounds
    _getGlobalBoundsRecursive(
        bounds: Bounds,
        currentLayer: RenderLayerClass,
        factorRenderLayers: boolean
    ): void;
}

export const getFastGlobalBoundsMixin: Partial<Container> = {
    getFastGlobalBounds(bounds: Bounds, factorRenderLayers?: boolean): Bounds
    {
        bounds.clear();

        this._getGlobalBoundsRecursive(bounds, this.parentRenderLayer, !!factorRenderLayers);

        if (!bounds.isValid)
        {
            bounds.set(0, 0, 0, 0);
        }

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        bounds.applyMatrix(renderGroup.worldTransform);

        return bounds;
    },

    _getGlobalBoundsRecursive(
        bounds: Bounds,
        currentLayer: RenderLayerClass,
        factorRenderLayers: boolean
    )
    {
        let localBounds = bounds;

        if (factorRenderLayers && this.parentRenderLayer !== currentLayer) return;

        if (this.localDisplayStatus !== 0b111 || (!this.measurable))
        {
            return;
        }

        const manageEffects = !!this.effects.length;

        if (this.renderGroup || manageEffects)
        {
            localBounds = boundsPool.get().clear();
        }

        if (this.boundsArea)
        {
            bounds.addRect(this.boundsArea, this.worldTransform);
        }
        else
        {
            if (this.renderPipeId)
            {
                const viewBounds = (this as Renderable).bounds;

                localBounds.addFrame(
                    viewBounds.minX,
                    viewBounds.minY,
                    viewBounds.maxX,
                    viewBounds.maxY,
                    this.groupTransform
                );
            }

            const children = this.children;

            for (let i = 0; i < children.length; i++)
            {
                children[i]._getGlobalBoundsRecursive(localBounds, currentLayer, factorRenderLayers);
            }
        }

        if (manageEffects)
        {
            let advanced = false;

            const renderGroup = this.renderGroup || this.parentRenderGroup;

            for (let i = 0; i < this.effects.length; i++)
            {
                if (this.effects[i].addBounds)
                {
                    if (!advanced)
                    {
                        advanced = true;
                        localBounds.applyMatrix(renderGroup.worldTransform);
                    }

                    this.effects[i].addBounds(localBounds, true);
                }
            }

            if (advanced)
            {
                localBounds.applyMatrix(renderGroup.worldTransform.copyTo(tempMatrix).invert());
                bounds.addBounds(localBounds, this.relativeGroupTransform);
            }

            bounds.addBounds(localBounds);
            boundsPool.return(localBounds);
        }
        else if (this.renderGroup)
        {
            bounds.addBounds(localBounds, this.relativeGroupTransform);
            boundsPool.return(localBounds);
        }
    }

} as Container;
