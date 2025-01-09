import type { ObservablePoint } from '../../maths/point/ObservablePoint';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BoundsData } from '../../scene/container/bounds/Bounds';

/**
 * Updates the bounds of a quad (a rectangular area) based on the provided texture and anchor point.
 *
 * This function calculates the minimum and maximum x and y coordinates of the bounds, taking into
 * account the texture's original dimensions and any trimming that may have been applied to it.
 * @param {BoundsData} bounds - The bounds object to be updated. It contains minX, maxX, minY, and maxY properties.
 * @param {ObservablePoint} anchor - The anchor point of the texture, which affects the positioning of the bounds.
 * @param {Texture} texture - The texture whose dimensions and trimming information are used to update the bounds.
 */
export function updateQuadBounds(
    bounds: BoundsData,
    anchor: ObservablePoint,
    texture: Texture
): void
{
    const { width, height } = texture.orig;
    const trim = texture.trim;

    // If the texture has trimming information, adjust the bounds accordingly
    if (trim)
    {
        // Calculate the source width and height from the trim
        const sourceWidth = trim.width;
        const sourceHeight = trim.height;

        // Update the bounds using the trim's x and y offsets and the anchor point
        bounds.minX = trim.x - (anchor._x * width);
        bounds.maxX = bounds.minX + sourceWidth;

        bounds.minY = trim.y - (anchor._y * height);
        bounds.maxY = bounds.minY + sourceHeight;
    }
    // If there is no trimming, calculate the bounds based solely on the texture's original dimensions
    else
    {
        bounds.minX = -anchor._x * width;
        bounds.maxX = bounds.minX + width;

        bounds.minY = -anchor._y * height;
        bounds.maxY = bounds.minY + height;
    }
}
