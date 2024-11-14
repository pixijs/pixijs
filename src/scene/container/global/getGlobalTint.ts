import { multiplyColors } from '../utils/multiplyColors';

import type { Container } from '../Container';

/**
 * Returns the global (compound) tint color of the container within the scene.
 * @param target - The container to get the global tint of.
 * @param skipUpdate - Performance optimization flag:
 *   - If false (default): Recalculates the entire tint chain through parents for accuracy
 *   - If true: Uses cached worldColor from the last render pass for better performance
 * @returns The resulting tint color as a 24-bit RGB number (0xRRGGBB)
 * @example
 * // Accurate but slower - recalculates entire tint chain
 * const preciseTint = getGlobalTint(target, false);
 *
 * // Faster but may be outdated - uses cached tint
 * const cachedTint = getGlobalTint(target, true);
 */
export function getGlobalTint(target: Container, skipUpdate: boolean): number
{
    if (skipUpdate)
    {
        if (target.renderGroup)
        {
            return bgr2rgb(target.renderGroup.worldColor);
        }

        if (target.parentRenderGroup)
        {
            return bgr2rgb(
                multiplyColors(target.localColor, target.parentRenderGroup.worldColor)
            );
        }

        return target.tint;
    }

    let color = target.localColor;
    let parent = target.parent;

    while (parent)
    {
        color = multiplyColors(color, parent.localColor);
        parent = parent.parent;
    }

    return bgr2rgb(color);
}

export function bgr2rgb(color: number): number
{
    return ((color & 0xFF) << 16) + (color & 0xFF00) + ((color >> 16) & 0xFF);
}
