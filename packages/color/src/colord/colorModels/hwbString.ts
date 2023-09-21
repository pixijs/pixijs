import { parseHue } from '../helpers';
import { clampHwba, hwbaToRgba, rgbaToHwba, roundHwba } from './hwb';

import type { RgbaColor } from '../types';

// The only valid HWB syntax
// hwb( <hue> <percentage> <percentage> [ / <alpha-value> ]? )
const hwbaMatcher = /^hwb\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;

/**
 * Parses a valid HWB[A] CSS color function/string https://www.w3.org/TR/css-color-4/#the-hwb-notation
 * @param input
 */
export const parseHwbaString = (input: string): RgbaColor | null =>
{
    const match = hwbaMatcher.exec(input);

    if (!match) return null;

    const hwba = clampHwba({
        h: parseHue(match[1], match[2]),
        w: Number(match[3]),
        b: Number(match[4]),
        a: match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1),
    });

    return hwbaToRgba(hwba);
};

export const rgbaToHwbaString = (rgba: RgbaColor): string =>
{
    const { h, w, b, a } = roundHwba(rgbaToHwba(rgba));

    return a < 1 ? `hwb(${h} ${w}% ${b}% / ${a})` : `hwb(${h} ${w}% ${b}%)`;
};
