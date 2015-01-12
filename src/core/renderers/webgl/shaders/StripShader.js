var Shader = require('./Shader');

/**
 * @class
 * @namespace PIXI
 * @param gl {WebGLContext} the current WebGL drawing context
 */
function StripShader(gl)
{
    Shader.call(this,
        gl,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            // 'attribute vec4 aColor;',

            'uniform mat3 translationMatrix;',
            'uniform vec2 projectionVector;',
            'uniform vec2 offsetVector;',

            'varying vec2 vTextureCoord;',

            'void main(void)
            {',
            '   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);',
            '   v -= offsetVector.xyx;',
            '   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'precision mediump float;',

            'uniform float alpha;',
            'uniform sampler2D uSampler;',

            'varying vec2 vTextureCoord;',

            'void main(void)
            {',
            '   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            alpha:  { type: '1f', value: 0 },
            translationMatrix: { type: 'mat3', value: new Float32Array(9) }
        }
    );
}

StripShader.prototype = Object.create(Shader.prototype);
StripShader.prototype.constructor = StripShader;
module.exports = StripShader;
