import type { LabaColor } from '../types';

/**
 * Calculates the perceived color difference according to [Delta E2000](https://en.wikipedia.org/wiki/Color_difference#CIEDE2000).
 *
 * ΔE - (Delta E, dE) The measure of change in visual perception of two given colors.
 *
 * Delta E is a metric for understanding how the human eye perceives color difference.
 * The term delta comes from mathematics, meaning change in a variable or function.
 * The suffix E references the German word Empfindung, which broadly means sensation.
 *
 * On a typical scale, the Delta E value will range from 0 to 100.
 *
 * | Delta E | Perception                             |
 * |---------|----------------------------------------|
 * | <= 1.0  | Not perceptible by human eyes          |
 * | 1 - 2   | Perceptible through close observation  |
 * | 2 - 10  | Perceptible at a glance                |
 * | 11 - 49 | Colors are more similar than opposite  |
 * | 100     | Colors are exact opposite              |
 *
 * [Source](http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html)
 * [Read about Delta E](https://zschuessler.github.io/DeltaE/learn/#toc-delta-e-2000)
 * @param color1
 * @param color2
 */
export function getDeltaE00(color1: LabaColor, color2: LabaColor): number
{
    const { l: l1, a: a1, b: b1 } = color1;
    const { l: l2, a: a2, b: b2 } = color2;

    const rad2deg = 180 / Math.PI;
    const deg2rad = Math.PI / 180;

    // dc -> delta c;
    // ml -> median l;
    const c1 = (a1 ** 2 + b1 ** 2) ** 0.5;
    const c2 = (a2 ** 2 + b2 ** 2) ** 0.5;
    const mc = (c1 + c2) / 2;
    const ml = (l1 + l2) / 2;

    // reuse
    const c7 = mc ** 7;
    const g = 0.5 * (1 - (c7 / (c7 + 25 ** 7)) ** 0.5);

    const a11 = a1 * (1 + g);
    const a22 = a2 * (1 + g);

    const c11 = (a11 ** 2 + b1 ** 2) ** 0.5;
    const c22 = (a22 ** 2 + b2 ** 2) ** 0.5;
    const mc1 = (c11 + c22) / 2;

    let h1 = a11 === 0 && b1 === 0 ? 0 : Math.atan2(b1, a11) * rad2deg;
    let h2 = a22 === 0 && b2 === 0 ? 0 : Math.atan2(b2, a22) * rad2deg;

    if (h1 < 0) h1 += 360;
    if (h2 < 0) h2 += 360;

    let dh = h2 - h1;
    const dhAbs = Math.abs(h2 - h1);

    if (dhAbs > 180 && h2 <= h1)
    {
        dh += 360;
    }
    else if (dhAbs > 180 && h2 > h1)
    {
        dh -= 360;
    }

    let H = h1 + h2;

    if (dhAbs <= 180)
    {
        H /= 2;
    }
    else
    {
        H = (h1 + h2 < 360 ? H + 360 : H - 360) / 2;
    }

    const T
    = 1
    - 0.17 * Math.cos(deg2rad * (H - 30))
    + 0.24 * Math.cos(deg2rad * 2 * H)
    + 0.32 * Math.cos(deg2rad * (3 * H + 6))
    - 0.2 * Math.cos(deg2rad * (4 * H - 63));

    const dL = l2 - l1;
    const dC = c22 - c11;
    const dH = 2 * Math.sin((deg2rad * dh) / 2) * (c11 * c22) ** 0.5;

    const sL = 1 + (0.015 * (ml - 50) ** 2) / (20 + (ml - 50) ** 2) ** 0.5;
    const sC = 1 + 0.045 * mc1;
    const sH = 1 + 0.015 * mc1 * T;

    const dTheta = 30 * Math.exp(-1 * ((H - 275) / 25) ** 2);
    const Rc = 2 * (c7 / (c7 + 25 ** 7)) ** 0.5;
    const Rt = -Rc * Math.sin(deg2rad * 2 * dTheta);

    const kl = 1; // 1 for graphic arts, 2 for textiles
    const kc = 1; // unity factor
    const kh = 1; // weighting factor

    return (
        ((dL / kl / sL) ** 2
      + (dC / kc / sC) ** 2
      + (dH / kh / sH) ** 2
      + (Rt * dC * dH) / (kc * sC * kh * sH))
    ** 0.5
    );
}
