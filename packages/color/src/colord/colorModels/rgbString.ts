import { clampRgba, roundRgba } from './rgb';

import type { RgbaColor } from '../types';

// Functional syntax
// rgb( <percentage>#{3} , <alpha-value>? )
// rgb( <number>#{3} , <alpha-value>? )
const commaRgbaMatcher = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;

// Whitespace syntax
// rgb( <percentage>{3} [ / <alpha-value> ]? )
// rgb( <number>{3} [ / <alpha-value> ]? )
const spaceRgbaMatcher = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;

/**
 * Parses a valid RGB[A] CSS color function/string https://www.w3.org/TR/css-color-4/#rgb-functions
 * @param input
 */
export const parseRgbaString = (input: string): RgbaColor | null =>
{
    const match = commaRgbaMatcher.exec(input) || spaceRgbaMatcher.exec(input);

    if (!match) return null;

    // Mixing numbers and percentages is not allowed
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_syntax_variations
    if (match[2] !== match[4] || match[4] !== match[6]) return null;

    return clampRgba({
        r: Number(match[1]) / (match[2] ? 100 / 255 : 1),
        g: Number(match[3]) / (match[4] ? 100 / 255 : 1),
        b: Number(match[5]) / (match[6] ? 100 / 255 : 1),
        a: match[7] === undefined ? 1 : Number(match[7]) / (match[8] ? 100 : 1),
    });
};

export const rgbaToRgbaString = (rgba: RgbaColor): string =>
{
    const { r, g, b, a } = roundRgba(rgba);

    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
};
