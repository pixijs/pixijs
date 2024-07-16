import { DOMAdapter } from '../../../../environment/adapter';

import type { BLEND_MODES } from '../../shared/state/const';
import type { GlRenderingContext } from '../context/GlRenderingContext';

/**
 * Maps gl blend combinations to WebGL.
 * @param gl
 * @returns {object} Map of gl blend combinations to WebGL.
 */
export function mapWebGLBlendModesToPixi(gl: GlRenderingContext): Record<BLEND_MODES, number[]>
{
    const blendMap: Partial<Record<BLEND_MODES, number[]>> = {};

    // TODO - premultiply alpha would be different.
    // add a boolean for that!
    blendMap.normal = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    blendMap.add = [gl.ONE, gl.ONE];
    blendMap.multiply = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    blendMap.screen = [gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    blendMap.none = [0, 0];

    // not-premultiplied blend modes
    blendMap['normal-npm'] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
    blendMap['add-npm'] = [gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE];
    blendMap['screen-npm'] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

    blendMap.erase = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];

    const isWebGl2 = !(gl instanceof DOMAdapter.get().getWebGLRenderingContext());

    if (isWebGl2)
    {
        blendMap.min = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.MIN, gl.MIN];
        blendMap.max = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.MAX, gl.MAX];
    }
    else
    {
        const ext = gl.getExtension('EXT_blend_minmax');

        if (ext)
        {
            blendMap.min = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, ext.MIN_EXT, ext.MIN_EXT];
            blendMap.max = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, ext.MAX_EXT, ext.MAX_EXT];
        }
    }

    // TODO - implement if requested!
    // composite operations
    // array[BLEND_MODES.SRC_IN] = [gl.DST_ALPHA, gl.ZERO];
    // array[BLEND_MODES.SRC_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO];
    // array[BLEND_MODES.SRC_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
    // array[BLEND_MODES.DST_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE];
    // array[BLEND_MODES.DST_IN] = [gl.ZERO, gl.SRC_ALPHA];
    // array[BLEND_MODES.DST_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];
    // array[BLEND_MODES.DST_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA];
    // array[BLEND_MODES.XOR] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
    // SUBTRACT from flash
    // array[BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD];

    return blendMap as Record<BLEND_MODES, number[]>;
}
