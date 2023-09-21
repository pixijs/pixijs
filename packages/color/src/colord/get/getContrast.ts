import { getLuminance } from './getLuminance';

import type { RgbaColor } from '../types';

/**
 * Returns a contrast ratio for a color pair [1-21]. http://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * @param rgb1
 * @param rgb2
 */
export const getContrast = (rgb1: RgbaColor, rgb2: RgbaColor): number =>
{
    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);

    return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
};
