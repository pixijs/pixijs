import { BitmapFontManager } from '../BitmapFontManager';

import type { TextStyle } from '../../text/TextStyle';

/**
 * Compute baseline position from the top of a line box, based on the style's textBaseline.
 * Returns a y-offset (in line box units) to add to the line top to reach the desired baseline.
 *
 * Mapping notes:
 * - alphabetic: ascent (top to alphabetic baseline)
 * - top: 0
 * - bottom: lineHeight
 * - middle: lineHeight / 2
 * - ideographic: lineHeight - descent
 * - hanging: approximated as ~0.2 * lineHeight
 * @param text - The text to get the baseline offset for.
 * @param style - Text style containing `textBaseline`.
 * @param effectiveLineHeight - Optional. The line height to use. Falls back to the default font's line height.
 * @category text
 * @returns The baseline offset in line box units.
 * @internal
 */
export function getBaselineOffset(
    text: string,
    style: TextStyle,
    effectiveLineHeight?: number
): number
{
    const font = BitmapFontManager.getFont(text, style);

    const lineHeight = effectiveLineHeight ?? font.lineHeight;

    let distanceFieldOffset = 0;

    if (font.distanceField?.type && font.distanceField.type !== 'none')
    {
        distanceFieldOffset = font.distanceField.range / 2;
    }

    let result;

    switch (style.textBaseline)
    {
        case 'top':
            result = 0;
            break;
        case 'bottom':
            result = lineHeight;
            break;
        case 'middle':
            result = lineHeight / 2;
            break;
        case 'ideographic':
            result = lineHeight - font.fontMetrics.descent;
            break;
        case 'hanging':
            // No direct metric; approximate at ~20% of line height from top
            result = Math.max(0, Math.min(lineHeight, lineHeight * 0.2));
            break;
        case 'alphabetic':
        default:
            result = font.fontMetrics.ascent;
            break;
    }

    return result - distanceFieldOffset;
}

