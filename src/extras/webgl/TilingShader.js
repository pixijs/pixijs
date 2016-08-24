var Shader = require('../../core/Shader');
var glslify  = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function TilingShader(gl)
{
    Shader.call(this,
        gl,
        glslify('./tilingSprite.vert'),
        glslify('./tilingSprite.frag')
    );
}

TilingShader.prototype = Object.create(Shader.prototype);
TilingShader.prototype.constructor = TilingShader;
module.exports = TilingShader;

