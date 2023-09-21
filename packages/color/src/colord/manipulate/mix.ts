import { clampLaba, labaToRgba, rgbaToLaba } from '../colorModels/lab';

import type { RgbaColor } from '../types';

export const mix = (rgba1: RgbaColor, rgba2: RgbaColor, ratio: number): RgbaColor =>
{
    const laba1 = rgbaToLaba(rgba1);
    const laba2 = rgbaToLaba(rgba2);

    const mixture = clampLaba({
        l: laba1.l * (1 - ratio) + laba2.l * ratio,
        a: laba1.a * (1 - ratio) + laba2.a * ratio,
        b: laba1.b * (1 - ratio) + laba2.b * ratio,
        alpha: laba1.alpha * (1 - ratio) + laba2.alpha * ratio,
    });

    return labaToRgba(mixture);
};
