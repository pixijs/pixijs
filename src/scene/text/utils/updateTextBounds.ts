import { updateQuadBounds } from '../../../utils/data/updateQuadBounds';
import { type BatchableSprite } from '../../sprite/BatchableSprite';
import { type AbstractText } from '../AbstractText';
import { type TextStyle, type TextStyleOptions } from '../TextStyle';

/**
 * Updates the bounds of the given batchable sprite based on the provided text object.
 *
 * This function adjusts the bounds of the batchable sprite to match the dimensions
 * and anchor point of the text's texture. Additionally, it compensates for any padding
 * specified in the text's style to ensure the text is rendered correctly on screen.
 * @param {BatchableSprite} batchableSprite - The sprite whose bounds need to be updated.
 * @param {AbstractText} text - The text object containing the texture and style information.
 * @internal
 */
export function updateTextBounds(batchableSprite: BatchableSprite, text: AbstractText<TextStyle, TextStyleOptions>)
{
    const { texture, bounds } = batchableSprite;
    const padding = text._style._getFinalPadding();

    // When HTML text textures are created, they include the padding around the text content
    // to prevent text clipping and provide a buffer zone. This padding is built into
    // the texture itself. However, we don't want this padding to affect the text's
    // actual position on screen.

    // First, calculate bounds using the full padded texture
    updateQuadBounds(bounds, text._anchor, texture);

    // Then adjust by the padding amount to compensate for the buffer zone
    // This shifts the render position back by the padding amount, ensuring the text
    // appears exactly where intended while maintaining the buffer zone around it.
    const paddingOffset = text._anchor._x * padding * 2;
    const paddingOffsetY = text._anchor._y * padding * 2;

    bounds.minX -= padding - paddingOffset;
    bounds.minY -= padding - paddingOffsetY;
    bounds.maxX -= padding - paddingOffset;
    bounds.maxY -= padding - paddingOffsetY;
}
