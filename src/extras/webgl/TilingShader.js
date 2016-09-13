import Shader from '../../core/Shader';
const glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
class TilingShader extends Shader
{
    constructor(gl)
    {
        super(
            gl,
            glslify('./tilingSprite.vert'),
            glslify('./tilingSprite.frag')
        );
    }
}

export default TilingShader;
