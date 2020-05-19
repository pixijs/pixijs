import { BLEND_MODES } from '@pixi/constants';

/**
 * Corrects PixiJS blend, takes premultiplied alpha into account
 *
 * @memberof PIXI.utils
 * @function mapPremultipliedBlendModes
 * @private
 * @return {Array<number[]>} Mapped modes.
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
 * @const premultiplyBlendMode
 * @type {Array<number[]>}
 */
export const premultiplyBlendMode = mapPremultipliedBlendModes();

/**
 * changes blendMode according to texture format
 *
 * @memberof PIXI.utils
 * @function correctBlendMode
 * @param {number} blendMode supposed blend mode
 * @param {boolean} premultiplied  whether source is premultiplied
 * @returns {number} true blend mode for this texture
 */
export function correctBlendMode(blendMode: number, premultiplied: boolean): number
{
    return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}

/**
 * combines rgb and alpha to out array
 *
 * @memberof PIXI.utils
 * @function premultiplyRgba
 * @param {Float32Array|number[]} rgb input rgb
 * @param {number} alpha alpha param
 * @param {Float32Array} [out] output
 * @param {boolean} [premultiply=true] do premultiply it
 * @returns {Float32Array} vec4 rgba
 */
export function premultiplyRgba(
    rgb: Float32Array|number[],
    alpha: number,
    out: Float32Array,
    premultiply: boolean
): Float32Array
{
    out = out || new Float32Array(4);
    if (premultiply || premultiply === undefined)
    {
        out[0] = rgb[0] * alpha;
        out[1] = rgb[1] * alpha;
        out[2] = rgb[2] * alpha;
    }
    else
    {
        out[0] = rgb[0];
        out[1] = rgb[1];
        out[2] = rgb[2];
    }
    out[3] = alpha;

    return out;
}

/**
 * premultiplies tint
 *
 * @memberof PIXI.utils
 * @function premultiplyTint
 * @param {number} tint integer RGB
 * @param {number} alpha floating point alpha (0.0-1.0)
 * @returns {number} tint multiplied by alpha
 */
export function premultiplyTint(tint: number, alpha: number): number
{
    if (alpha === 1.0)
    {
        return (alpha * 255 << 24) + tint;
    }
    if (alpha === 0.0)
    {
        return 0;
    }
    let R = ((tint >> 16) & 0xFF);
    let G = ((tint >> 8) & 0xFF);
    let B = (tint & 0xFF);

    R = ((R * alpha) + 0.5) | 0;
    G = ((G * alpha) + 0.5) | 0;
    B = ((B * alpha) + 0.5) | 0;

    return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
}

/**
 * converts integer tint and float alpha to vec4 form, premultiplies by default
 *
 * @memberof PIXI.utils
 * @function premultiplyTintToRgba
 * @param {number} tint input tint
 * @param {number} alpha alpha param
 * @param {Float32Array} [out] output
 * @param {boolean} [premultiply=true] do premultiply it
 * @returns {Float32Array} vec4 rgba
 */
export function premultiplyTintToRgba(tint: number, alpha: number, out: Float32Array, premultiply: boolean): Float32Array
{
    out = out || new Float32Array(4);
    out[0] = ((tint >> 16) & 0xFF) / 255.0;
    out[1] = ((tint >> 8) & 0xFF) / 255.0;
    out[2] = (tint & 0xFF) / 255.0;
    if (premultiply || premultiply === undefined)
    {
        out[0] *= alpha;
        out[1] *= alpha;
        out[2] *= alpha;
    }
    out[3] = alpha;

    return out;
}
