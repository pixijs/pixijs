var Shader = require('../../core/Shader');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param gl {Shader} TODO: Find a good explanation for this.
 */
function MeshShader(gl)
{
    Shader.call(this,
        gl,
        // vertex shader
        [
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
            'varying vec2 vTextureCoord;',
            'uniform float alpha;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord) * alpha ;',
           // '   gl_FragColor = vec4(1.0);',
            '}'
        ].join('\n')
    );
}

MeshShader.prototype = Object.create(Shader.prototype);
MeshShader.prototype.constructor = MeshShader;
module.exports = MeshShader;

