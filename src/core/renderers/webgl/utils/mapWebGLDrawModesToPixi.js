import { DRAW_MODES } from '../../../const';

/**
 * Generic Mask Stack data structure.
 *
 * @memberof PIXI
 * @function mapWebGLDrawModesToPixi
 * @private
 * @param {WebGLRenderingContext} gl - The current WebGL drawing context
 * @param {object} [object={}] - The object to map into
 * @return {object} The mapped draw modes.
 */
export default function mapWebGLDrawModesToPixi(gl, object = {})
{
    object[DRAW_MODES.POINTS] = gl.POINTS;
    object[DRAW_MODES.LINES] = gl.LINES;
    object[DRAW_MODES.LINE_LOOP] = gl.LINE_LOOP;
    object[DRAW_MODES.LINE_STRIP] = gl.LINE_STRIP;
    object[DRAW_MODES.TRIANGLES] = gl.TRIANGLES;
    object[DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
    object[DRAW_MODES.TRIANGLE_FAN] = gl.TRIANGLE_FAN;

    return object;
}
