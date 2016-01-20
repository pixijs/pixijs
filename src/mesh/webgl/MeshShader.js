var core = require('../../core');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param shaderManager {PIXI.ShaderManager} The WebGL shader manager this shader works for.
 */
function MeshShader(shaderManager)
{
    core.Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'precision lowp float;',
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'varying vec2 vTextureCoord;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n'),
        [
            'precision lowp float;',

            'varying vec2 vTextureCoord;',
            'uniform float alpha;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord) * alpha ;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            alpha:  { type: '1f', value: 0 },
            translationMatrix: { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // custom attributes
        {
            aVertexPosition:0,
            aTextureCoord:0
        }
    );
}

MeshShader.prototype = Object.create(core.Shader.prototype);
MeshShader.prototype.constructor = MeshShader;
module.exports = MeshShader;

core.ShaderManager.registerPlugin('meshShader', MeshShader);
