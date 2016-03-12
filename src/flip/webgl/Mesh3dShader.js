var core = require('../../core');
var glMat = require('gl-matrix');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param shaderManager {PIXI.ShaderManager} The WebGL shader manager this shader works for.
 */
function Mesh3dShader(shaderManager)
{
    core.Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'precision lowp float;',
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'uniform mat4 translationMatrix;',
            'uniform mat4 projectionMatrix;',

            'varying vec2 vTextureCoord;',

            'void main(void){',
            '   gl_Position = projectionMatrix * translationMatrix * vec4(aVertexPosition, 0.0, 1.0);',
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
            translationMatrix: { type: 'mat4', value: glMat.mat4.create() },
            projectionMatrix: { type: 'mat4', value: glMat.mat4.create() }
        },
        // custom attributes
        {
            aVertexPosition:0,
            aTextureCoord:0
        }
    );
}

Mesh3dShader.prototype = Object.create(core.Shader.prototype);
Mesh3dShader.prototype.constructor = Mesh3dShader;
module.exports = Mesh3dShader;

core.ShaderManager.registerPlugin('mesh3dShader', Mesh3dShader);
