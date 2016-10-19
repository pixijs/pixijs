import * as core from '../../core';
const glslify = require('glslify'); // eslint-disable-line no-undef

/**
 *
 * Basic FXAA implementation based on the code on geeks3d.com with the
 * modification that the texture2DLod stuff was removed since it's
 * unsupported by WebGL.
 *
 * @see https://github.com/mitsuhiko/webgl-meincraft
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 *
 */
export default class FXAAFilter extends core.Filter
{
    /**
     *
     */
    constructor()
    {
        // TODO - needs work
        super(
            // vertex shader
            glslify('./fxaa.vert'),
            // fragment shader
            glslify('./fxaa.frag')
        );
    }
}
