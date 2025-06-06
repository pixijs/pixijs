import { updateTransformBackwards } from '../bounds/getGlobalBounds';
import { matrixPool } from '../bounds/utils/matrixAndBoundsPool';
import { multiplyColors } from '../utils/multiplyColors';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../Container';

/**
 * Converts a color from BGR format to RGB format.
 * @param color - The color in BGR format (0xBBGGRR).
 * @returns The color in RGB format (0xRRGGBB).
 * @category utils
 * @internal
 */
export function bgr2rgb(color: number): number
{
    return ((color & 0xFF) << 16) + (color & 0xFF00) + ((color >> 16) & 0xFF);
}

/**
 * Interface for a mixin that provides methods to retrieve global properties of a container.
 * This mixin allows you to get the global alpha, transform matrix, and tint color of a container,
 * taking into account its parent containers and render groups.
 * It includes methods to optimize performance by using cached values when available.
 * @category scene
 * @advanced
 */
export interface GetGlobalMixin
{
    /**
     * Returns the global (compound) alpha of the container within the scene.
     * @param {boolean} skipUpdate - Performance optimization flag:
     *   - If false (default): Recalculates the entire alpha chain through parents for accuracy
     *   - If true: Uses cached worldAlpha from the last render pass for better performance
     * @returns The resulting alpha value (between 0 and 1)
     * @example
     * ```ts
     * // Accurate but slower - recalculates entire alpha chain
     * const preciseAlpha = container.getGlobalAlpha();
     *
     * // Faster but may be outdated - uses cached alpha
     * const cachedAlpha = container.getGlobalAlpha(true);
     * ```
     */
    getGlobalAlpha(skipUpdate: boolean): number;
    /**
     * Returns the global transform matrix of the container within the scene.
     * @param {Matrix} matrix - Optional matrix to store the result. If not provided, a new Matrix will be created.
     * @param {boolean} skipUpdate - Performance optimization flag:
     *   - If false (default): Recalculates the entire transform chain for accuracy
     *   - If true: Uses cached worldTransform from the last render pass for better performance
     * @returns The resulting transformation matrix (either the input matrix or a new one)
     * @example
     * ```ts
     * // Accurate but slower - recalculates entire transform chain
     * const preciseTransform = container.getGlobalTransform();
     *
     * // Faster but may be outdated - uses cached transform
     * const cachedTransform = container.getGlobalTransform(undefined, true);
     *
     * // Reuse existing matrix
     * const existingMatrix = new Matrix();
     * container.getGlobalTransform(existingMatrix);
     * ```
     */
    getGlobalTransform(matrix: Matrix, skipUpdate: boolean): Matrix;
    /**
     * Returns the global (compound) tint color of the container within the scene.
     * @param {boolean} skipUpdate - Performance optimization flag:
     *   - If false (default): Recalculates the entire tint chain through parents for accuracy
     *   - If true: Uses cached worldColor from the last render pass for better performance
     * @returns The resulting tint color as a 24-bit RGB number (0xRRGGBB)
     * @example
     * ```ts
     * // Accurate but slower - recalculates entire tint chain
     * const preciseTint = container.getGlobalTint();
     *
     * // Faster but may be outdated - uses cached tint
     * const cachedTint = container.getGlobalTint(true);
     * ```
     */
    getGlobalTint(skipUpdate?: boolean): number;
}

/** @internal */
export const getGlobalMixin: Partial<Container> = {
    getGlobalAlpha(skipUpdate: boolean): number
    {
        if (skipUpdate)
        {
            if (this.renderGroup)
            {
                return this.renderGroup.worldAlpha;
            }

            if (this.parentRenderGroup)
            {
                return this.parentRenderGroup.worldAlpha * this.alpha;
            }

            return this.alpha;
        }

        let alpha = this.alpha;
        let current = this.parent;

        while (current)
        {
            alpha *= current.alpha;
            current = current.parent;
        }

        return alpha;
    },
    getGlobalTransform(matrix: Matrix, skipUpdate: boolean): Matrix
    {
        if (skipUpdate)
        {
            return matrix.copyFrom(this.worldTransform);
        }

        this.updateLocalTransform();

        const parentTransform = updateTransformBackwards(this, matrixPool.get().identity());

        matrix.appendFrom(this.localTransform, parentTransform);
        matrixPool.return(parentTransform);

        return matrix;
    },
    getGlobalTint(skipUpdate?: boolean): number
    {
        if (skipUpdate)
        {
            if (this.renderGroup)
            {
                return bgr2rgb(this.renderGroup.worldColor);
            }

            if (this.parentRenderGroup)
            {
                return bgr2rgb(
                    multiplyColors(this.localColor, this.parentRenderGroup.worldColor)
                );
            }

            return this.tint;
        }

        let color = this.localColor;
        let parent = this.parent;

        while (parent)
        {
            color = multiplyColors(color, parent.localColor);
            parent = parent.parent;
        }

        return bgr2rgb(color);
    }

} as Container;
