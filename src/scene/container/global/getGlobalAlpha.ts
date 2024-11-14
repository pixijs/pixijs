import type { Container } from '../Container';

/**
 * Returns the global (compound) alpha of the container within the scene.
 * @param target - The container to get the global alpha of.
 * @param skipUpdate - Performance optimization flag:
 *   - If false (default): Recalculates the entire alpha chain through parents for accuracy
 *   - If true: Uses cached worldAlpha from the last render pass for better performance
 * @returns The resulting alpha value (between 0 and 1)
 * @example
 * // Accurate but slower - recalculates entire alpha chain
 * const preciseAlpha = getGlobalAlpha(target, false);
 *
 * // Faster but may be outdated - uses cached alpha
 * const cachedAlpha = getGlobalAlpha(target, true);
 */
export function getGlobalAlpha(target: Container, skipUpdate: boolean): number
{
    if (skipUpdate)
    {
        if (target.renderGroup)
        {
            return target.renderGroup.worldAlpha;
        }

        if (target.parentRenderGroup)
        {
            return target.parentRenderGroup.worldAlpha * target.alpha;
        }

        return target.alpha;
    }

    let alpha = target.alpha;
    let current = target.parent;

    while (current)
    {
        alpha *= current.alpha;
        current = current.parent;
    }

    return alpha;
}

