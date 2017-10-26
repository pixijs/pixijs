import { BLEND_MODES } from '@pixi/constants';

/**
 * Corrects PixiJS blend, takes premultiplied alpha into account
 *
 * @memberof PIXI
 * @function mapPremultipliedBlendModes
 * @private
 * @param {Array<number[]>} [array] - The array to output into.
 * @return {Array<number[]>} Mapped modes.
 */
function mapPremultipliedBlendModes()
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

    const array = [];

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
export function correctBlendMode(blendMode, premultiplied)
{
    return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}
