import { clampCmyka, cmykaToRgba, rgbaToCmyka, roundCmyka } from './cmyk';

import type { RgbaColor } from './types';

const cmykMatcher = /^device-cmyk\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;

/**
 * Parses a valid CMYK CSS color function/string https://www.w3.org/TR/css-color-4/#device-cmyk
 * @param input
 */
export const parseCmykaString = (input: string): RgbaColor | null =>
{
    const match = cmykMatcher.exec(input);

    if (!match) return null;

    const cmyka = clampCmyka({
        c: Number(match[1]) * (match[2] ? 1 : 100),
        m: Number(match[3]) * (match[4] ? 1 : 100),
        y: Number(match[5]) * (match[6] ? 1 : 100),
        k: Number(match[7]) * (match[8] ? 1 : 100),
        a: match[9] === undefined ? 1 : Number(match[9]) / (match[10] ? 100 : 1),
    });

    return cmykaToRgba(cmyka);
};

export function rgbaToCmykaString(rgb: RgbaColor): string
{
    const { c, m, y, k, a } = roundCmyka(rgbaToCmyka(rgb));

    return a < 1
        ? `device-cmyk(${c}% ${m}% ${y}% ${k}% / ${a})`
        : `device-cmyk(${c}% ${m}% ${y}% ${k}%)`;
}
