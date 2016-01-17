var Shader = require('pixi-gl-core').GLShader;

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {PIXI.ShaderManager} The webgl shader manager this shader works for.
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [customUniforms] {object} Custom uniforms to use to augment the built-in ones.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 */
function TextureShader(gl)
{
    /**
     * The vertex shader.
     *
     * @member {string}
     */
    vertexSrc = TextureShader.defaultVertexSrc;

    /**
     * The fragment shader.
     *
     * @member {string}
     */
    fragmentSrc = TextureShader.defaultFragmentSrc;

    Shader.call(this, gl, vertexSrc, fragmentSrc);//, uniforms, attributes);

}

// constructor
TextureShader.prototype = Object.create(Shader.prototype);
TextureShader.prototype.constructor = TextureShader;
module.exports = TextureShader;

/**
 * The default vertex shader source
 *
 * @static
 * @constant
 */
TextureShader.defaultVertexSrc = [
    'precision lowp float;',
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',
    'attribute vec4 aColor;',

    'uniform mat3 projectionMatrix;',

    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',

    'void main(void){',
    '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
    '   vTextureCoord = aTextureCoord;',
    '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
    '}'
].join('\n');

/**
 * The default fragment shader source
 *
 * @static
 * @constant
 */
TextureShader.defaultFragmentSrc = [
    'precision lowp float;',

    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',

    'uniform sampler2D uSampler;',

    'void main(void){',
    '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;',
    '}'
].join('\n');
