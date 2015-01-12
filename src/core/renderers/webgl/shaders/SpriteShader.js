var utils = require('../../../utils');

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
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'attribute vec4 aColor;',

            'uniform vec2 projectionVector;',
            'uniform vec2 offsetVector;',

            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',

            'const vec2 center = vec2(-1.0, 1.0);',

            'void main(void){',
            '   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
            '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
            '}'

        ].join('\n'),
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
