import { rgbaToHsla } from '../colorModels/hsl';
import { clamp } from '../helpers';

import type { HslaColor, RgbaColor } from '../types';

export const saturate = (rgba: RgbaColor, amount: number): HslaColor =>
{
    const hsla = rgbaToHsla(rgba);

    return {
        h: hsla.h,
        s: clamp(hsla.s + amount * 100, 0, 100),
        l: hsla.l,
        a: hsla.a,
    };
};
