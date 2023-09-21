import { ALPHA_PRECISION } from './constants';
import { clamp, clampHue, isPresent, round } from './helpers';

import type { HsvaColor, InputObject, RgbaColor } from './types';

export const clampHsva = (hsva: HsvaColor): HsvaColor => ({
    h: clampHue(hsva.h),
    s: clamp(hsva.s, 0, 100),
    v: clamp(hsva.v, 0, 100),
    a: clamp(hsva.a),
});

export const roundHsva = (hsva: HsvaColor): HsvaColor => ({
    h: round(hsva.h),
    s: round(hsva.s),
    v: round(hsva.v),
    a: round(hsva.a, ALPHA_PRECISION),
});

export const parseHsva = ({ h, s, v, a = 1 }: InputObject): RgbaColor | null =>
{
    if (!isPresent(h) || !isPresent(s) || !isPresent(v)) return null;

    const hsva = clampHsva({
        h: Number(h),
        s: Number(s),
        v: Number(v),
        a: Number(a),
    });

    return hsvaToRgba(hsva);
};

export const rgbaToHsva = ({ r, g, b, a }: RgbaColor): HsvaColor =>
{
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);

    const hh = delta
        ? max === r
            ? (g - b) / delta
            : max === g
                ? 2 + (b - r) / delta
                : 4 + (r - g) / delta
        : 0;

    return {
        h: 60 * (hh < 0 ? hh + 6 : hh),
        s: max ? (delta / max) * 100 : 0,
        v: (max / 255) * 100,
        a,
    };
};

export const hsvaToRgba = ({ h, s, v, a }: HsvaColor): RgbaColor =>
{
    h = (h / 360) * 6;
    s = s / 100;
    v = v / 100;

    const hh = Math.floor(h);
    const b = v * (1 - s);
    const c = v * (1 - (h - hh) * s);
    const d = v * (1 - (1 - h + hh) * s);
    const module = hh % 6;

    return {
        r: [v, c, b, b, d, v][module] * 255,
        g: [d, v, v, c, b, b][module] * 255,
        b: [b, b, d, v, v, c][module] * 255,
        a,
    };
};
