var Shader = require('../../core/renderers/webgl/shaders/Shader');

/**
 * @class
 * @namespace PIXI
 * @param shaderManager {ShaderManager} The webgl shader manager this shader works for.
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [customUniforms] {object} Custom uniforms to use to augment the built-in ones.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 */
function Sprite3dShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes)
{
    var uniforms = {

        uSampler:           { type: 'sampler2D', value: 0 },
        projectionMatrix3d:   { type: 'mat4', value: new Float32Array(1, 0, 0, 0,
                                                                      0, 1, 0, 0,
                                                                      0, 0, 1, 0,
                                                                      0, 0, 0, 1)}
    };

    if (customUniforms)
    {
        for (var u in customUniforms)
        {
            uniforms[u] = customUniforms[u];
        }
    }


    var attributes = {
        aVertexPosition:    0,
        aTextureCoord:      0,
        aColor:             0
    };

    if (customAttributes)
    {
        for (var a in customAttributes)
        {
            attributes[a] = customAttributes[a];
        }
    }

    /**
     * The vertex shader.
     * @member {Array}
     */
    vertexSrc = vertexSrc || [
        'precision lowp float;',
        'attribute vec3 aVertexPosition;',
        'attribute vec2 aTextureCoord;',
        'attribute vec4 aColor;',

        'uniform mat4 projectionMatrix3d;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'void main(void){',
        '   gl_Position = projectionMatrix3d * vec4(aVertexPosition, 1.0);',
        '   vTextureCoord = aTextureCoord;',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ].join('\n');

    /**
     * The fragment shader.
     * @member {Array}
     */
    fragmentSrc = fragmentSrc || [
        'precision lowp float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform sampler2D uSampler;',

        'void main(void){',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;',

//        '   if(gl_FragColor.a < 0.5)',
  //      '   discard;',
        '}'
    ].join('\n');

    Shader.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
}

// constructor
Sprite3dShader.prototype = Object.create(Shader.prototype);
Sprite3dShader.prototype.constructor = Sprite3dShader;
module.exports = Sprite3dShader;
