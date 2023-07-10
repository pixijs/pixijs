import { Color } from '@pixi/color';
import { deprecation } from '../logging/deprecation';

/**
 * Converts a hexadecimal color number to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
 * @memberof PIXI.utils
 * @function hex2rgb
 * @see PIXI.Color.toRgbArray
 * @deprecated since 7.2.0
 * @param {number} hex - The hexadecimal number to convert
 * @param  {number[]} [out=[]] - If supplied, this array will be used rather than returning a new one
 * @returns {number[]} An array representing the [R, G, B] of the color where all values are floats.
 */
export function hex2rgb(hex: number, out: Array<number> | Float32Array = []): Array<number> | Float32Array
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', 'utils.hex2rgb is deprecated, use Color#toRgbArray instead');
    }

    return Color.shared.setValue(hex).toRgbArray(out);
}

/**
 * Converts a hexadecimal color number to a string.
 * @see PIXI.Color.toHex
 * @deprecated since 7.2.0
 * @memberof PIXI.utils
 * @function hex2string
 * @param {number} hex - Number in hex (e.g., `0xffffff`)
 * @returns {string} The string color (e.g., `"#ffffff"`).
 */
export function hex2string(hex: number): string
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', 'utils.hex2string is deprecated, use Color#toHex instead');
    }

    return Color.shared.setValue(hex).toHex();
}

/**
 * Converts a string to a hexadecimal color number.
 * @deprecated since 7.2.0
 * @see PIXI.Color.toNumber
 * @memberof PIXI.utils
 * @function string2hex
 * @param {string} string - The string color (e.g., `"#ffffff"`)
 * @returns {number} Number in hexadecimal.
 */
export function string2hex(string: string): number
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', 'utils.string2hex is deprecated, use Color#toNumber instead');
    }

    return Color.shared.setValue(string).toNumber();
}

/**
 * Converts a color as an [R, G, B] array of normalized floats to a hexadecimal number.
 * @deprecated since 7.2.0
 * @see PIXI.Color.toNumber
 * @memberof PIXI.utils
 * @function rgb2hex
 * @param {number[]} rgb - Array of numbers where all values are normalized floats from 0.0 to 1.0.
 * @returns {number} Number in hexadecimal.
 */
export function rgb2hex(rgb: number[] | Float32Array): number
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', 'utils.rgb2hex is deprecated, use Color#toNumber instead');
    }

    return Color.shared.setValue(rgb).toNumber();
}
