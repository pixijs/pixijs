import { Matrix } from '../../../maths/matrix/Matrix';
import { type Renderable } from '../../../rendering/renderers/shared/Renderable';
import { type IRenderLayer } from '../../layers/RenderLayer';
import { Bounds } from '../bounds/Bounds';
import { boundsPool } from '../bounds/utils/matrixAndBoundsPool';

import type { Container } from '../Container';

const tempMatrix = new Matrix();

/**
 * Interface for the GetFastGlobalBoundsMixin, which provides methods to compute
 * an approximate global bounding box for a container and its children.
 */
export interface GetFastGlobalBoundsMixin
{
    /**
     * Computes an approximate global bounding box for the container and its children.
     * This method is optimized for speed by using axis-aligned bounding boxes (AABBs),
     * and uses the last render results from when it updated the transforms. This function does not update them.
     * which may result in slightly larger bounds but never smaller than the actual bounds.
     *
     * for accurate (but less performant) results use `container.getGlobalBounds`
     * @param {boolean} [factorRenderLayers] - A flag indicating whether to consider render layers in the calculation.
     * @param {Bounds} [bounds] - The output bounds object to store the result. If not provided, a new one is created.
     * @returns {Bounds} The computed bounds.
     * @memberof scene.Container#
     */
    getFastGlobalBounds(factorRenderLayers?: boolean, bounds?: Bounds): Bounds;

    /**
     * Recursively calculates the global bounds for the container and its children.
     * This method is used internally by getFastGlobalBounds to traverse the scene graph.
     * @param {boolean} factorRenderLayers - A flag indicating whether to consider render layers in the calculation.
     * @param {Bounds} bounds - The bounds object to update with the calculated values.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    _getGlobalBoundsRecursive(
        factorRenderLayers: boolean,
        bounds: Bounds,
        currentLayer: IRenderLayer,
    ): void;
}

/**
 * Mixin providing the implementation of the GetFastGlobalBoundsMixin interface.
 * It includes methods to compute and recursively calculate global bounds for containers.
 */
export const getFastGlobalBoundsMixin: Partial<Container> = {
    /**
     * Computes the global bounds for the container, considering its children and optionally
     * factoring in render layers. It starts by clearing the provided bounds object, then
     * recursively calculates the bounds, and finally applies the world transformation.
     * @param {boolean} [factorRenderLayers] - Whether to consider render layers in the calculation.
     * @param {Bounds} [bounds] - The bounds object to store the result. If not provided, a new one is created.
     * @returns {Bounds} The computed bounds.
     * @memberof scene.Container#
     */
    getFastGlobalBounds(factorRenderLayers?: boolean, bounds?: Bounds): Bounds
    {
        bounds ||= new Bounds();

        // Initialize the bounds for fresh calculations.
        bounds.clear();

        // Calculate bounds recursively, starting from the current container.
        this._getGlobalBoundsRecursive(!!factorRenderLayers, bounds, this.parentRenderLayer);

        // Validate the calculated bounds, resetting if invalid.
        if (!bounds.isValid)
        {
            bounds.set(0, 0, 0, 0);
        }

        // Apply the world transformation to the bounds.
        const renderGroup = this.renderGroup || this.parentRenderGroup;

        bounds.applyMatrix(renderGroup.worldTransform);

        return bounds;
    },

    /**
     * Recursively calculates the global bounds for the container and its children.
     * It considers visibility, measurability, and effects, and applies transformations
     * as necessary to compute the bounds accurately.
     * @param {boolean} factorRenderLayers - Whether to consider render layers in the calculation.
     * @param {Bounds} bounds - The bounds object to update with the calculated values.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    _getGlobalBoundsRecursive(
        factorRenderLayers: boolean,
        bounds: Bounds,
        currentLayer: IRenderLayer,
    )
    {
        let localBounds = bounds;

        // Skip if the container is not in the current render layer when factoring render layers.
        if (factorRenderLayers && this.parentRenderLayer !== currentLayer) return;

        // Skip if the container is not fully visible or not measurable.
        if (this.localDisplayStatus !== 0b111 || (!this.measurable))
        {
            return;
        }

        // Determine if effects need to be managed, requiring separate bounds handling.
        const manageEffects = !!this.effects.length;

        // Use a temporary bounds object if the container is a render group or has effects.
        if (this.renderGroup || manageEffects)
        {
            localBounds = boundsPool.get().clear();
        }

        // Add the container's own bounds area to the bounds if it exists.
        if (this.boundsArea)
        {
            bounds.addRect(this.boundsArea, this.worldTransform);
        }
        else
        {
            // If the container is renderable, add its bounds to the local bounds.
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

            // Recursively process each child to include their bounds.
            const children = this.children;

            for (let i = 0; i < children.length; i++)
            {
                children[i]._getGlobalBoundsRecursive(factorRenderLayers, localBounds, currentLayer);
            }
        }

        // If effects are managed, apply them to the bounds.
        if (manageEffects)
        {
            let advanced = false;
            const renderGroup = this.renderGroup || this.parentRenderGroup;

            // Apply each effect that modifies bounds.
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

            // Adjust bounds back to the local coordinate space if advanced bounds were calculated.
            if (advanced)
            {
                localBounds.applyMatrix(renderGroup.worldTransform.copyTo(tempMatrix).invert());
                bounds.addBounds(localBounds, this.relativeGroupTransform);
            }

            // Add the local bounds to the final bounds and return the temporary bounds object.
            bounds.addBounds(localBounds);
            boundsPool.return(localBounds);
        }
        else if (this.renderGroup)
        {
            // If the container is a render group, add its local bounds to the final bounds.
            bounds.addBounds(localBounds, this.relativeGroupTransform);
            boundsPool.return(localBounds);
        }
    }

} as Container;
