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
 *
 * If ascent/descent are missing, falls back to centering using lineHeight/2.
 * @param style - Text style containing `textBaseline`.
 * @param lineHeight - The height of the line box.
 * @param ascent - Distance from top to alphabetic baseline.
 * @param descent - Distance from alphabetic baseline to bottom.
 * @category text
 * @returns The baseline offset in line box units.
 * @internal
 */
export function getBaselineOffset(
    style: TextStyle,
    lineHeight: number,
    ascent?: number,
    descent?: number
): number
{
    const baseline = style.textBaseline ?? 'alphabetic';

    let safeAscent = lineHeight / 2;
    let safeDescent = lineHeight / 2;

    if (Number.isFinite(ascent) && Number.isFinite(descent))
    {
        safeAscent = ascent;
        safeDescent = descent;
    }

    switch (baseline)
    {
        case 'top':
            return 0;
        case 'bottom':
            return lineHeight;
        case 'middle':
            return lineHeight / 2;
        case 'ideographic':
            return lineHeight - safeDescent;
        case 'hanging':
            // No direct metric; approximate at ~20% of line height from top
            return Math.max(0, Math.min(lineHeight, lineHeight * 0.2));
        case 'alphabetic':
        default:
            return safeAscent;
    }
}

