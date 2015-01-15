var Shader = require('../../renderers/webgl/shaders/Shader');

/**
 * @class
 * @extends Shader
 * @namespace PIXI
 * @param shaderManager {WebGLShaderManager} The webgl shader manager this shader works for.
 */
function SpriteBatchShader(shaderManager)
{
    Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'attribute float aColor;',

            'attribute vec2 aPositionCoord;',
            'attribute vec2 aScale;',
            'attribute float aRotation;',

            'uniform mat3 projectionMatrix;',
            // 'uniform vec2 projectionVector;',
            // 'uniform vec2 offsetVector;',
            'uniform mat3 uMatrix;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            // 'const vec2 center = vec2(-1.0, 1.0);',

            'void main(void){',
            '   vec2 v;',
            '   vec2 sv = aVertexPosition * aScale;',
            '   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);',
            '   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);',
            '   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;',


            // '   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);',
            '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',


            '   vTextureCoord = aTextureCoord;',
          //  '   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;',
            '   vColor = aColor;',
            '}'
        ].join('\n'),
        // fragment shader, use default
        [
            'precision lowp float;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            uMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // custom attributes
        {
            aPositionCoord: 0,
            aScale:         0,
            aRotation:      0
        }
    );
}

SpriteBatchShader.prototype = Object.create(Shader.prototype);
SpriteBatchShader.prototype.constructor = SpriteBatchShader;
module.exports = SpriteBatchShader;
