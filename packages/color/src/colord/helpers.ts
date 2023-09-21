import { ANGLE_UNITS } from './constants';

export const isPresent = (value: unknown): boolean =>
{
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return true;

    return false;
};

export const round = (number: number, digits = 0, base = Math.pow(10, digits)): number =>
    Math.round(base * number) / base + 0;

export const floor = (number: number, digits = 0, base = Math.pow(10, digits)): number =>
    Math.floor(base * number) / base + 0;

/**
 * Clamps a value between an upper and lower bound.
 * We use ternary operators because it makes the minified code
 * is 2 times shorter then `Math.min(Math.max(a,b),c)`
 * NaN is clamped to the lower bound
 * @param number
 * @param min
 * @param max
 */
export const clamp = (number: number, min = 0, max = 1): number =>
    (number > max ? max : number > min ? number : min);

/**
 * Processes and clamps a degree (angle) value properly.
 * Any `NaN` or `Infinity` will be converted to `0`.
 * Examples: -1 => 359, 361 => 1
 * @param degrees
 */
export const clampHue = (degrees: number): number =>
{
    degrees = isFinite(degrees) ? degrees % 360 : 0;

    return degrees > 0 ? degrees : degrees + 360;
};

/**
 * Converts a hue value to degrees from 0 to 360 inclusive.
 * @param value
 * @param unit
 */
export const parseHue = (value: string, unit = 'deg'): number =>
    Number(value) * (ANGLE_UNITS[unit] || 1);
