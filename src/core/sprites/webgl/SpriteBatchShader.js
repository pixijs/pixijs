var TextureShader = require('../../renderers/webgl/shaders/TextureShader');

/**
 * @class
 * @extends Shader
 * @namespace PIXI
 * @param shaderManager {ShaderManager} The webgl shader manager this shader works for.
 */
function SpriteBatchShader(shaderManager)
{
    TextureShader.call(this,
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

           // 'uniform mat3 uMatrix;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'void main(void){',
            '   vec2 v;',
            '   vec2 sv = aVertexPosition * aScale;',
            '   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);',
            '   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);',
            '   v = v + aPositionCoord ;',

            '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

            '   vTextureCoord = aTextureCoord;',
            '   vColor = 1.0;',
            '}'
        ].join('\n'),
        // hello
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
          //  uMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // custom attributes
        {
            aPositionCoord: 0,
            aScale:         0,
            aRotation:      0
        }
    );

    // TEMP HACK

}

SpriteBatchShader.prototype = Object.create(TextureShader.prototype);
SpriteBatchShader.prototype.constructor = SpriteBatchShader;
module.exports = SpriteBatchShader;
