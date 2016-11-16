import { BLEND_MODES } from '../../../const';
import canUseNewCanvasBlendModes from './canUseNewCanvasBlendModes';

/**
 * Maps blend combinations to Canvas.
 *
 * @memberof PIXI
 * @function mapCanvasBlendModesToPixi
 * @private
 * @param {string[]} [array=[]] - The array to output into.
 * @return {string[]} Mapped modes.
 */
export default function mapCanvasBlendModesToPixi(array = [])
{
    if (canUseNewCanvasBlendModes())
    {
        array[BLEND_MODES.NORMAL] = 'source-over';
        array[BLEND_MODES.ADD] = 'lighter'; // IS THIS OK???
        array[BLEND_MODES.MULTIPLY] = 'multiply';
        array[BLEND_MODES.SCREEN] = 'screen';
        array[BLEND_MODES.OVERLAY] = 'overlay';
        array[BLEND_MODES.DARKEN] = 'darken';
        array[BLEND_MODES.LIGHTEN] = 'lighten';
        array[BLEND_MODES.COLOR_DODGE] = 'color-dodge';
        array[BLEND_MODES.COLOR_BURN] = 'color-burn';
        array[BLEND_MODES.HARD_LIGHT] = 'hard-light';
        array[BLEND_MODES.SOFT_LIGHT] = 'soft-light';
        array[BLEND_MODES.DIFFERENCE] = 'difference';
        array[BLEND_MODES.EXCLUSION] = 'exclusion';
        array[BLEND_MODES.HUE] = 'hue';
        array[BLEND_MODES.SATURATION] = 'saturate';
        array[BLEND_MODES.COLOR] = 'color';
        array[BLEND_MODES.LUMINOSITY] = 'luminosity';
    }
    else
    {
        // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
        array[BLEND_MODES.NORMAL] = 'source-over';
        array[BLEND_MODES.ADD] = 'lighter'; // IS THIS OK???
        array[BLEND_MODES.MULTIPLY] = 'source-over';
        array[BLEND_MODES.SCREEN] = 'source-over';
        array[BLEND_MODES.OVERLAY] = 'source-over';
        array[BLEND_MODES.DARKEN] = 'source-over';
        array[BLEND_MODES.LIGHTEN] = 'source-over';
        array[BLEND_MODES.COLOR_DODGE] = 'source-over';
        array[BLEND_MODES.COLOR_BURN] = 'source-over';
        array[BLEND_MODES.HARD_LIGHT] = 'source-over';
        array[BLEND_MODES.SOFT_LIGHT] = 'source-over';
        array[BLEND_MODES.DIFFERENCE] = 'source-over';
        array[BLEND_MODES.EXCLUSION] = 'source-over';
        array[BLEND_MODES.HUE] = 'source-over';
        array[BLEND_MODES.SATURATION] = 'source-over';
        array[BLEND_MODES.COLOR] = 'source-over';
        array[BLEND_MODES.LUMINOSITY] = 'source-over';
    }

    return array;
}
