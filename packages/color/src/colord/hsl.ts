import { ALPHA_PRECISION } from './constants';
import { clamp, clampHue, isPresent, round } from './helpers';
import { hsvaToRgba, rgbaToHsva } from './hsv';

import type { HslaColor, HsvaColor, InputObject, RgbaColor } from './types';

export const clampHsla = (hsla: HslaColor): HslaColor => ({
    h: clampHue(hsla.h),
    s: clamp(hsla.s, 0, 100),
    l: clamp(hsla.l, 0, 100),
    a: clamp(hsla.a),
});

export const roundHsla = (hsla: HslaColor): HslaColor => ({
    h: round(hsla.h),
    s: round(hsla.s),
    l: round(hsla.l),
    a: round(hsla.a, ALPHA_PRECISION),
});

export const parseHsla = ({ h, s, l, a = 1 }: InputObject): RgbaColor | null =>
{
    if (!isPresent(h) || !isPresent(s) || !isPresent(l)) return null;

    const hsla = clampHsla({
        h: Number(h),
        s: Number(s),
        l: Number(l),
        a: Number(a),
    });

    return hslaToRgba(hsla);
};

export const hslaToHsva = ({ h, s, l, a }: HslaColor): HsvaColor =>
{
    s *= (l < 50 ? l : 100 - l) / 100;

    return {
        h,
        s: s > 0 ? ((2 * s) / (l + s)) * 100 : 0,
        v: l + s,
        a,
    };
};

export const hsvaToHsla = ({ h, s, v, a }: HsvaColor): HslaColor =>
{
    const hh = ((200 - s) * v) / 100;

    return {
        h,
        s: hh > 0 && hh < 200 ? ((s * v) / 100 / (hh <= 100 ? hh : 200 - hh)) * 100 : 0,
        l: hh / 2,
        a,
    };
};

export const hslaToRgba = (hsla: HslaColor): RgbaColor =>
    hsvaToRgba(hslaToHsva(hsla));

export const rgbaToHsla = (rgba: RgbaColor): HslaColor =>
    hsvaToHsla(rgbaToHsva(rgba));
