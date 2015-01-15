var Shader = require('../../renderers/webgl/shaders/Shader'),
    WebGLShaderManager = require('../../renderers/webgl/managers/WebGLShaderManager');

/**
 * @class
 * @namespace PIXI
 * @param shaderManager {WebGLShaderManager} The webgl shader manager this shader works for.
 */
function SpriteShader(shaderManager)
{
    Shader.call(this,
        shaderManager,
        null,
        // fragment shader
        [
            'precision lowp float;',

            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            tint:   { type: '3f', value: [0, 0, 0] },
            flipY:  { type: '1f', value: 0 },
            alpha:  { type: '1f', value: 0 },
            translationMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        {
            aTextureCoord:      0,
            aColor:             0
        }
    );
}

SpriteShader.prototype = Object.create(Shader.prototype);
SpriteShader.prototype.constructor = SpriteShader;
module.exports = SpriteShader;

WebGLShaderManager.registerPlugin('spriteShader', SpriteShader);
