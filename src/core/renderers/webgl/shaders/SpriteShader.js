var Shader = require('./Shader');

/**
 * @class
 * @namespace PIXI
 * @param gl {WebGLContext} the current WebGL drawing context
 */
function SpriteShader(gl)
{
    Shader.call(this,
        gl,
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
