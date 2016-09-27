import Shader from '../../core/Shader';
const glslify = require('glslify'); // eslint-disable-line no-undef

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 */
export default class TilingShader extends Shader
{
    /**
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     */
    constructor(gl)
    {
        super(
            gl,
            glslify('./tilingSprite.vert'),
            glslify('./tilingSprite.frag')
        );
    }
}
