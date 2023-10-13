import { Color } from '@pixi/color';
import { BLEND_MODES } from '@pixi/constants';
import { deprecation } from '../logging/deprecation';

/**
 * Corrects PixiJS blend, takes premultiplied alpha into account
 * @memberof PIXI.utils
 * @function mapPremultipliedBlendModes
 * @private
 * @returns {Array<number[]>} Mapped modes.
 */
function mapPremultipliedBlendModes(): number[][]
{
    const pm = [];
    const npm = [];

    for (let i = 0; i < 32; i++)
    {
        pm[i] = i;
        npm[i] = i;
    }

    pm[BLEND_MODES.NORMAL_NPM] = BLEND_MODES.NORMAL;
    pm[BLEND_MODES.ADD_NPM] = BLEND_MODES.ADD;
    pm[BLEND_MODES.SCREEN_NPM] = BLEND_MODES.SCREEN;

    npm[BLEND_MODES.NORMAL] = BLEND_MODES.NORMAL_NPM;
    npm[BLEND_MODES.ADD] = BLEND_MODES.ADD_NPM;
    npm[BLEND_MODES.SCREEN] = BLEND_MODES.SCREEN_NPM;

    const array: number[][] = [];

    array.push(npm);
    array.push(pm);

    return array;
}

/**
 * maps premultiply flag and blendMode to adjusted blendMode
 * @memberof PIXI.utils
 * @type {Array<number[]>}
 */
export const premultiplyBlendMode = mapPremultipliedBlendModes();

/**
 * changes blendMode according to texture format
 * @memberof PIXI.utils
 * @function correctBlendMode
 * @param {number} blendMode - supposed blend mode
 * @param {boolean} premultiplied - whether source is premultiplied
 * @returns {number} true blend mode for this texture
 */
export function correctBlendMode(blendMode: number, premultiplied: boolean): number
{
    return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}

/**
 * @memberof PIXI.utils
 * @function premultiplyRgba
 * @deprecated since 7.2.0
 * @see PIXI.Color.premultiply
 * @param {Float32Array|number[]} rgb -
 * @param {number} alpha -
 * @param {Float32Array} [out] -
 * @param {boolean} [premultiply=true] -
 */
export function premultiplyRgba(
    rgb: Float32Array | number[],
    alpha: number,
    out?: Float32Array,
    premultiply = true
): Float32Array
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', `utils.premultiplyRgba has moved to Color.premultiply`);
    }

    return Color.shared
        .setValue(rgb)
        .premultiply(alpha, premultiply)
        .toArray(out ?? new Float32Array(4));
}

/**
 * @memberof PIXI.utils
 * @function premultiplyTint
 * @deprecated since 7.2.0
 * @see PIXI.Color.toPremultiplied
 * @param {number} tint -
 * @param {number} alpha -
 */
export function premultiplyTint(tint: number, alpha: number): number
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', `utils.premultiplyTint has moved to Color.toPremultiplied`);
    }

    return Color.shared
        .setValue(tint)
        .toPremultiplied(alpha);
}

/**
 * @memberof PIXI.utils
 * @function premultiplyTintToRgba
 * @deprecated since 7.2.0
 * @see PIXI.Color.premultiply
 * @param {number} tint -
 * @param {number} alpha -
 * @param {Float32Array} [out] -
 * @param {boolean} [premultiply=true] -
 */
export function premultiplyTintToRgba(tint: number, alpha: number, out?: Float32Array, premultiply = true): Float32Array
{
    if (process.env.DEBUG)
    {
        deprecation('7.2.0', `utils.premultiplyTintToRgba has moved to Color.premultiply`);
    }

    return Color.shared
        .setValue(tint)
        .premultiply(alpha, premultiply)
        .toArray(out ?? new Float32Array(4));
}
