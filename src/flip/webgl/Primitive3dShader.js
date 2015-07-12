var Shader = require('../../core/renderers/webgl/shaders/Shader');


/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {ShaderManager} The webgl shader manager this shader works for.
 */
function Primitive3dShader(shaderManager)
{
    Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec4 aColor;',

            'uniform mat4 projectionMatrix3d;',
            'uniform mat4 translationMatrix3d;',

            'uniform float alpha;',
            'uniform float flipY;',
            'uniform vec3 tint;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_Position = projectionMatrix3d * translationMatrix3d * vec4(aVertexPosition, 0.0, 1.0);',
            '   vColor = aColor * vec4(tint * alpha, alpha);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'precision mediump float;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_FragColor = vColor;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            tint:   { type: '3f', value: [0, 0, 0] },
            alpha:  { type: '1f', value: 0 },
            translationMatrix3d: { type: 'mat4', value: new Float32Array(16) },
            projectionMatrix3d: { type: 'mat4', value: new Float32Array(16) }
        },
        // custom attributes
        {
            aVertexPosition:0,
            aColor:0
        }
    );
}

Primitive3dShader.prototype = Object.create(Shader.prototype);
Primitive3dShader.prototype.constructor = Primitive3dShader;
module.exports = Primitive3dShader;
