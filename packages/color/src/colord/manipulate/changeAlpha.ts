import type { RgbaColor } from '../types';

export const changeAlpha = (rgba: RgbaColor, a: number): RgbaColor => ({
    r: rgba.r,
    g: rgba.g,
    b: rgba.b,
    a,
});
