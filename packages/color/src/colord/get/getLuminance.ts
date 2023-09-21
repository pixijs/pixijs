import { linearizeRgbChannel } from '../colorModels/rgb';

import type { RgbaColor } from '../types';

/**
 * Returns the perceived luminance of a color [0-1] according to WCAG 2.0.
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @param rgba
 */
export const getLuminance = (rgba: RgbaColor): number =>
{
    const sRed = linearizeRgbChannel(rgba.r);
    const sGreen = linearizeRgbChannel(rgba.g);
    const sBlue = linearizeRgbChannel(rgba.b);

    return 0.2126 * sRed + 0.7152 * sGreen + 0.0722 * sBlue;
};
