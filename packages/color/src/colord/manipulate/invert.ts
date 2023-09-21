import type { RgbaColor } from '../types';

export const invert = (rgba: RgbaColor): RgbaColor => ({
    r: 255 - rgba.r,
    g: 255 - rgba.g,
    b: 255 - rgba.b,
    a: rgba.a,
});
