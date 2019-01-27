import { BLEND_MODES } from '@pixi/constants';

/**
 * Maps gl blend combinations to WebGL.
 *
 * @memberof PIXI
 * @function mapWebGLBlendModesToPixi
 * @private
 * @param {WebGLRenderingContext} gl - The rendering context.
 * @param {number[][]} [array=[]] - The array to output into.
 * @return {number[][]} Mapped modes.
 */
export default function mapWebGLBlendModesToPixi(gl, array = [])
{
    // TODO - premultiply alpha would be different.
    // add a boolean for that!
    array[BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.ADD] = [gl.ONE, gl.DST_ALPHA];
    array[BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR];
    array[BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.NONE] = [0, 0];

    // not-premultiplied blend modes
    array[BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.DST_ALPHA, gl.ONE, gl.DST_ALPHA];
    array[BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_COLOR];

    // not-premultiplied blend modes
    array[BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.DST_ALPHA, gl.ONE, gl.DST_ALPHA];
    array[BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_COLOR];

    // composite operations
    array[BLEND_MODES.SOURCE_IN] = [gl.DST_ALPHA, gl.ZERO, gl.DST_ALPHA, gl.ZERO];
    array[BLEND_MODES.SOURCE_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO, gl.ONE_MINUS_DST_ALPHA, gl.ZERO];
    array[BLEND_MODES.SOURCE_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.DESTINATION_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE];
    array[BLEND_MODES.DESTINATION_IN] = [gl.ZERO, gl.SRC_ALPHA, gl.ZERO, gl.SRC_ALPHA];
    array[BLEND_MODES.DESTINATION_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];
    array[BLEND_MODES.DESTINATION_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA];

    // SUBTRACT from flash
    array[BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD];

    // SOURCE_IN:      21,
    //     SOURCE_OUT:     22,
    // SOURCE_ATOP:    23,
    // DESTINATION_OVER: 24,
    // DESTINATION_IN:   25,
    // DESTINATION_OUT:  26,
    // DESTINATION_ATOP: 27,

    return array;
}
