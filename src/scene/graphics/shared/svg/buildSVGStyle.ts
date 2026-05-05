import { Color } from '../../../../color/Color';

import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../FillTypes';
import type { SVGDefsCollector } from './buildSVGDefinitions';

/**
 * Converts a fill style into SVG attribute string fragments.
 * Handles solid colours and gradients (via the defs collector).
 * @param style
 * @param defs
 * @internal
 */
export function buildSVGFillAttributes(style: ConvertedFillStyle, defs: SVGDefsCollector): string
{
    const gradRef = defs.addStyle(style);
    const parts: string[] = [];

    if (gradRef)
    {
        parts.push(`fill="${gradRef}"`);
    }
    else
    {
        parts.push(`fill="${Color.shared.setValue(style.color).toHex()}"`);
    }

    if (style.alpha < 1)
    {
        parts.push(`fill-opacity="${style.alpha}"`);
    }

    return parts.join(' ');
}

/**
 * Converts a stroke style into SVG attribute string fragments.
 * @param style
 * @param defs
 * @internal
 */
export function buildSVGStrokeAttributes(style: ConvertedStrokeStyle, defs: SVGDefsCollector): string
{
    const gradRef = defs.addStyle(style);
    const parts: string[] = [];

    parts.push('fill="none"');

    if (gradRef)
    {
        parts.push(`stroke="${gradRef}"`);
    }
    else
    {
        parts.push(`stroke="${Color.shared.setValue(style.color).toHex()}"`);
    }

    parts.push(`stroke-width="${style.width}"`);

    if (style.cap !== 'butt')
    {
        parts.push(`stroke-linecap="${style.cap}"`);
    }

    if (style.join !== 'miter')
    {
        parts.push(`stroke-linejoin="${style.join}"`);
    }
    else if (style.miterLimit !== 10)
    {
        parts.push(`stroke-miterlimit="${style.miterLimit}"`);
    }

    if (style.alpha < 1)
    {
        parts.push(`stroke-opacity="${style.alpha}"`);
    }

    return parts.join(' ');
}
