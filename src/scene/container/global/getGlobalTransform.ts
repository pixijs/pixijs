import { updateTransformBackwards } from '../bounds/getGlobalBounds';
import { matrixPool } from '../bounds/utils/matrixAndBoundsPool';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../Container';

/**
 * Returns the global transform matrix of the container within the scene.
 * @param target
 * @param matrix - Optional matrix to store the result. If not provided, a new Matrix will be created.
 * @param skipUpdate - Performance optimization flag:
 *   - If false (default): Recalculates the entire transform chain for accuracy
 *   - If true: Uses cached worldTransform from the last render pass for better performance
 * @returns The resulting transformation matrix (either the input matrix or a new one)
 * @example
 * // Accurate but slower - recalculates entire transform chain
 * const preciseTransform = getGlobalTransform(target, undefined, false);
 *
 * // Faster but may be outdated - uses cached transform
 * const cachedTransform = getGlobalTransform(target, undefined, true);
 *
 * // Reuse existing matrix
 * const existingMatrix = new Matrix();
 * getGlobalTransform(target, existingMatrix, true);
 */
export function getGlobalTransform(target: Container, matrix: Matrix, skipUpdate: boolean): Matrix
{
    if (skipUpdate)
    {
        return matrix.copyFrom(target.worldTransform);
    }

    target.updateLocalTransform();

    if (!target.parent)
    {
        return matrix.copyFrom(target.localTransform);
    }

    const parentTransform = updateTransformBackwards(target, matrixPool.get().identity());

    matrix.appendFrom(parentTransform, target.localTransform);
    matrixPool.return(parentTransform);

    return matrix;
}

