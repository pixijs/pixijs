import { ALPHA_PRECISION } from './constants';
import { clamp, isPresent, round } from './helpers';
import { D50, rgbaToXyza, xyzaToRgba } from './xyz';

import type { InputObject, LabaColor, RgbaColor } from './types';

// Conversion factors from https://en.wikipedia.org/wiki/CIELAB_color_space
const e = 216 / 24389;
const k = 24389 / 27;

/**
 * Clamps LAB axis values as defined in CSS Color Level 4 specs.
 * https://www.w3.org/TR/css-color-4/#specifying-lab-lch
 * @param laba
 */
export const clampLaba = (laba: LabaColor): LabaColor => ({
    // CIE Lightness values less than 0% must be clamped to 0%.
    // Values greater than 100% are permitted for forwards compatibility with HDR.
    l: clamp(laba.l, 0, 400),
    // A and B axis values are signed (allow both positive and negative values)
    // and theoretically unbounded (but in practice do not exceed ±160).
    a: laba.a,
    b: laba.b,
    alpha: clamp(laba.alpha),
});

export const roundLaba = (laba: LabaColor): LabaColor => ({
    l: round(laba.l, 2),
    a: round(laba.a, 2),
    b: round(laba.b, 2),
    alpha: round(laba.alpha, ALPHA_PRECISION),
});

export const parseLaba = ({ l, a, b, alpha = 1 }: InputObject): RgbaColor | null =>
{
    if (!isPresent(l) || !isPresent(a) || !isPresent(b)) return null;

    const laba = clampLaba({
        l: Number(l),
        a: Number(a),
        b: Number(b),
        alpha: Number(alpha),
    });

    return labaToRgba(laba);
};

/**
 * Performs RGB → CIEXYZ → LAB color conversion https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param rgba
 */
export const rgbaToLaba = (rgba: RgbaColor): LabaColor =>
{
    // Compute XYZ scaled relative to D50 reference white
    const xyza = rgbaToXyza(rgba);
    let x = xyza.x / D50.x;
    let y = xyza.y / D50.y;
    let z = xyza.z / D50.z;

    x = x > e ? Math.cbrt(x) : (k * x + 16) / 116;
    y = y > e ? Math.cbrt(y) : (k * y + 16) / 116;
    z = z > e ? Math.cbrt(z) : (k * z + 16) / 116;

    return {
        l: 116 * y - 16,
        a: 500 * (x - y),
        b: 200 * (y - z),
        alpha: xyza.a,
    };
};

/**
 * Performs LAB → CIEXYZ → RGB color conversion https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param laba
 */
export const labaToRgba = (laba: LabaColor): RgbaColor =>
{
    const y = (laba.l + 16) / 116;
    const x = laba.a / 500 + y;
    const z = y - laba.b / 200;

    return xyzaToRgba({
        x: (Math.pow(x, 3) > e ? Math.pow(x, 3) : (116 * x - 16) / k) * D50.x,
        y: (laba.l > k * e ? Math.pow((laba.l + 16) / 116, 3) : laba.l / k) * D50.y,
        z: (Math.pow(z, 3) > e ? Math.pow(z, 3) : (116 * z - 16) / k) * D50.z,
        a: laba.alpha,
    });
};
