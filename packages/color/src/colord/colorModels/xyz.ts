import { ALPHA_PRECISION } from '../constants';
import { clamp, isPresent, round } from '../helpers';
import { clampRgba, linearizeRgbChannel, unlinearizeRgbChannel } from './rgb';

import type { InputObject, RgbaColor, XyzaColor, XyzColor } from '../types';

// Theoretical light source that approximates "warm daylight" and follows the CIE standard.
// https://en.wikipedia.org/wiki/Standard_illuminant
export const D50 = {
    x: 96.422,
    y: 100,
    z: 82.521,
};

/**
 * Limits XYZ axis values assuming XYZ is relative to D50.
 * @param xyza
 */
export const clampXyza = (xyza: XyzaColor): XyzaColor => ({
    x: clamp(xyza.x, 0, D50.x),
    y: clamp(xyza.y, 0, D50.y),
    z: clamp(xyza.z, 0, D50.z),
    a: clamp(xyza.a),
});

export const roundXyza = (xyza: XyzaColor): XyzaColor => ({
    x: round(xyza.x, 2),
    y: round(xyza.y, 2),
    z: round(xyza.z, 2),
    a: round(xyza.a, ALPHA_PRECISION),
});

export const parseXyza = ({ x, y, z, a = 1 }: InputObject): RgbaColor | null =>
{
    if (!isPresent(x) || !isPresent(y) || !isPresent(z)) return null;

    const xyza = clampXyza({
        x: Number(x),
        y: Number(y),
        z: Number(z),
        a: Number(a),
    });

    return xyzaToRgba(xyza);
};

/**
 * Performs Bradford chromatic adaptation from D65 to D50
 * @param xyza
 */
export const adaptXyzaToD50 = (xyza: XyzaColor): XyzaColor => ({
    x: xyza.x * 1.0478112 + xyza.y * 0.0228866 + xyza.z * -0.050127,
    y: xyza.x * 0.0295424 + xyza.y * 0.9904844 + xyza.z * -0.0170491,
    z: xyza.x * -0.0092345 + xyza.y * 0.0150436 + xyza.z * 0.7521316,
    a: xyza.a,
});

/**
 * Performs Bradford chromatic adaptation from D50 to D65
 * @param xyza
 */
export const adaptXyzToD65 = (xyza: XyzColor): XyzColor => ({
    x: xyza.x * 0.9555766 + xyza.y * -0.0230393 + xyza.z * 0.0631636,
    y: xyza.x * -0.0282895 + xyza.y * 1.0099416 + xyza.z * 0.0210077,
    z: xyza.x * 0.0122982 + xyza.y * -0.020483 + xyza.z * 1.3299098,
});

/**
 * Converts an CIE XYZ color (D50) to RGBA color space (D65) https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param sourceXyza
 */
export const xyzaToRgba = (sourceXyza: XyzaColor): RgbaColor =>
{
    const xyz = adaptXyzToD65(sourceXyza);

    return clampRgba({
        r: unlinearizeRgbChannel(0.032404542 * xyz.x - 0.015371385 * xyz.y - 0.004985314 * xyz.z),
        g: unlinearizeRgbChannel(-0.00969266 * xyz.x + 0.018760108 * xyz.y + 0.00041556 * xyz.z),
        b: unlinearizeRgbChannel(0.000556434 * xyz.x - 0.002040259 * xyz.y + 0.010572252 * xyz.z),
        a: sourceXyza.a,
    });
};

/**
 * Converts an RGB color (D65) to CIE XYZ (D50)
 * https://image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz
 * @param rgba
 */
export const rgbaToXyza = (rgba: RgbaColor): XyzaColor =>
{
    const sRed = linearizeRgbChannel(rgba.r);
    const sGreen = linearizeRgbChannel(rgba.g);
    const sBlue = linearizeRgbChannel(rgba.b);

    // Convert an array of linear-light sRGB values to CIE XYZ
    // using sRGB own white (D65 no chromatic adaptation)
    const xyza: XyzaColor = {
        x: (sRed * 0.4124564 + sGreen * 0.3575761 + sBlue * 0.1804375) * 100,
        y: (sRed * 0.2126729 + sGreen * 0.7151522 + sBlue * 0.072175) * 100,
        z: (sRed * 0.0193339 + sGreen * 0.119192 + sBlue * 0.9503041) * 100,
        a: rgba.a,
    };

    return clampXyza(adaptXyzaToD50(xyza));
};
