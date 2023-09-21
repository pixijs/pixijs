import { ALPHA_PRECISION } from '../constants';
import { clamp, clampHue, isPresent, round } from '../helpers';
import { hsvaToRgba, rgbaToHsva } from './hsv';

import type { HwbaColor, InputObject, RgbaColor } from '../types';

export const clampHwba = (hwba: HwbaColor): HwbaColor => ({
    h: clampHue(hwba.h),
    w: clamp(hwba.w, 0, 100),
    b: clamp(hwba.b, 0, 100),
    a: clamp(hwba.a),
});

export const roundHwba = (hwba: HwbaColor): HwbaColor => ({
    h: round(hwba.h),
    w: round(hwba.w),
    b: round(hwba.b),
    a: round(hwba.a, ALPHA_PRECISION),
});

export const rgbaToHwba = (rgba: RgbaColor): HwbaColor =>
{
    const { h } = rgbaToHsva(rgba);
    const w = (Math.min(rgba.r, rgba.g, rgba.b) / 255) * 100;
    const b = 100 - (Math.max(rgba.r, rgba.g, rgba.b) / 255) * 100;

    return { h, w, b, a: rgba.a };
};

export const hwbaToRgba = (hwba: HwbaColor): RgbaColor =>
    hsvaToRgba({
        h: hwba.h,
        s: hwba.b === 100 ? 0 : 100 - (hwba.w / (100 - hwba.b)) * 100,
        v: 100 - hwba.b,
        a: hwba.a,
    });

export const parseHwba = ({ h, w, b, a = 1 }: InputObject): RgbaColor | null =>
{
    if (!isPresent(h) || !isPresent(w) || !isPresent(b)) return null;

    const hwba = clampHwba({
        h: Number(h),
        w: Number(w),
        b: Number(b),
        a: Number(a),
    });

    return hwbaToRgba(hwba);
};
