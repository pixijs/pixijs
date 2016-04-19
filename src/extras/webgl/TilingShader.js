var Shader = require('pixi-gl-core').GLShader;
var glslify  = require('glslify');
var Const = require('../../core/const');

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
        glslify('./tilingSprite.vert').replace(/%PRECISION%/gi, Const.PRECISION.DEFAULT),
        glslify('./tilingSprite.frag').replace(/%PRECISION%/gi, Const.PRECISION.DEFAULT)
    );
}

TilingShader.prototype = Object.create(Shader.prototype);
TilingShader.prototype.constructor = TilingShader;
module.exports = TilingShader;

