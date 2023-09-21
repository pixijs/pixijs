import { parseHue } from './helpers';
import { clampLcha, lchaToRgba, rgbaToLcha, roundLcha } from './lch';

import type { RgbaColor } from './types';

// The only valid LCH syntax
// lch() = lch( <percentage> <number> <hue> [ / <alpha-value> ]? )
const lchaMatcher = /^lch\(\s*([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;

/**
 * Parses a valid LCH CSS color function/string https://www.w3.org/TR/css-color-4/#specifying-lab-lch
 * @param input
 */
export const parseLchaString = (input: string): RgbaColor | null =>
{
    const match = lchaMatcher.exec(input);

    if (!match) return null;

    const lcha = clampLcha({
        l: Number(match[1]),
        c: Number(match[2]),
        h: parseHue(match[3], match[4]),
        a: match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1),
    });

    return lchaToRgba(lcha);
};

export const rgbaToLchaString = (rgba: RgbaColor): string =>
{
    const { l, c, h, a } = roundLcha(rgbaToLcha(rgba));

    return a < 1 ? `lch(${l}% ${c} ${h} / ${a})` : `lch(${l}% ${c} ${h})`;
};
