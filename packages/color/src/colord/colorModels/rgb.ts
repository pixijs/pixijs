import { ALPHA_PRECISION } from '../constants';
import { clamp, isPresent, round } from '../helpers';

import type { InputObject, RgbaColor } from '../types';

export const clampRgba = (rgba: RgbaColor): RgbaColor => ({
    r: clamp(rgba.r, 0, 255),
    g: clamp(rgba.g, 0, 255),
    b: clamp(rgba.b, 0, 255),
    a: clamp(rgba.a),
});

export const roundRgba = (rgba: RgbaColor): RgbaColor => ({
    r: round(rgba.r),
    g: round(rgba.g),
    b: round(rgba.b),
    a: round(rgba.a, ALPHA_PRECISION),
});

export const parseRgba = ({ r, g, b, a = 1 }: InputObject): RgbaColor | null =>
{
    if (!isPresent(r) || !isPresent(g) || !isPresent(b)) return null;

    return clampRgba({
        r: Number(r),
        g: Number(g),
        b: Number(b),
        a: Number(a),
    });
};

/**
 * Converts an RGB channel [0-255] to its linear light (un-companded) form [0-1].
 * Linearized RGB values are widely used for color space conversions and contrast calculations
 * @param value
 */
export const linearizeRgbChannel = (value: number): number =>
{
    const ratio = value / 255;

    return ratio < 0.04045 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4);
};

/**
 * Converts an linear-light sRGB channel [0-1] back to its gamma corrected form [0-255]
 * @param ratio
 */
export const unlinearizeRgbChannel = (ratio: number): number =>
{
    const value = ratio > 0.0031308 ? 1.055 * Math.pow(ratio, 1 / 2.4) - 0.055 : 12.92 * ratio;

    return value * 255;
};
