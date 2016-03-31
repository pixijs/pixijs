var CONST = require('../../../const');

/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */
function mapWebGLDrawModesToPixi(gl, object)
{
	object= object || {};

    object[CONST.DRAW_MODES.POINTS]         = gl.POINTS;
    object[CONST.DRAW_MODES.LINES]          = gl.LINES;
    object[CONST.DRAW_MODES.LINE_LOOP]      = gl.LINE_LOOP;
    object[CONST.DRAW_MODES.LINE_STRIP]     = gl.LINE_STRIP;
    object[CONST.DRAW_MODES.TRIANGLES]      = gl.TRIANGLES;
    object[CONST.DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
    object[CONST.DRAW_MODES.TRIANGLE_FAN]   = gl.TRIANGLE_FAN;

}

module.exports = mapWebGLDrawModesToPixi;
