var CONST = require('../../../const'),
canUseNewCanvasBlendModes = require('./canUseNewCanvasBlendModes');

/**
 * Maps gl blend combinations to WebGL
 * @class
 * @memberof PIXI
 */
function mapWebGLBlendModesToPixi(array)
{
    array = array || [];

    if (canUseNewCanvasBlendModes())
    {
        array[CONST.BLEND_MODES.NORMAL]        = 'source-over';
        array[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
        array[CONST.BLEND_MODES.MULTIPLY]      = 'multiply';
        array[CONST.BLEND_MODES.SCREEN]        = 'screen';
        array[CONST.BLEND_MODES.OVERLAY]       = 'overlay';
        array[CONST.BLEND_MODES.DARKEN]        = 'darken';
        array[CONST.BLEND_MODES.LIGHTEN]       = 'lighten';
        array[CONST.BLEND_MODES.COLOR_DODGE]   = 'color-dodge';
        array[CONST.BLEND_MODES.COLOR_BURN]    = 'color-burn';
        array[CONST.BLEND_MODES.HARD_LIGHT]    = 'hard-light';
        array[CONST.BLEND_MODES.SOFT_LIGHT]    = 'soft-light';
        array[CONST.BLEND_MODES.DIFFERENCE]    = 'difference';
        array[CONST.BLEND_MODES.EXCLUSION]     = 'exclusion';
        array[CONST.BLEND_MODES.HUE]           = 'hue';
        array[CONST.BLEND_MODES.SATURATION]    = 'saturate';
        array[CONST.BLEND_MODES.COLOR]         = 'color';
        array[CONST.BLEND_MODES.LUMINOSITY]    = 'luminosity';
    }
    else
    {
        // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
        array[CONST.BLEND_MODES.NORMAL]        = 'source-over';
        array[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
        array[CONST.BLEND_MODES.MULTIPLY]      = 'source-over';
        array[CONST.BLEND_MODES.SCREEN]        = 'source-over';
        array[CONST.BLEND_MODES.OVERLAY]       = 'source-over';
        array[CONST.BLEND_MODES.DARKEN]        = 'source-over';
        array[CONST.BLEND_MODES.LIGHTEN]       = 'source-over';
        array[CONST.BLEND_MODES.COLOR_DODGE]   = 'source-over';
        array[CONST.BLEND_MODES.COLOR_BURN]    = 'source-over';
        array[CONST.BLEND_MODES.HARD_LIGHT]    = 'source-over';
        array[CONST.BLEND_MODES.SOFT_LIGHT]    = 'source-over';
        array[CONST.BLEND_MODES.DIFFERENCE]    = 'source-over';
        array[CONST.BLEND_MODES.EXCLUSION]     = 'source-over';
        array[CONST.BLEND_MODES.HUE]           = 'source-over';
        array[CONST.BLEND_MODES.SATURATION]    = 'source-over';
        array[CONST.BLEND_MODES.COLOR]         = 'source-over';
        array[CONST.BLEND_MODES.LUMINOSITY]    = 'source-over';
    }

    return array;
}

module.exports = mapWebGLBlendModesToPixi;
