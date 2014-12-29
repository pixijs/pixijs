var utils = require('../../../utils'),
    glUtils = require('../utils/WebGLShaderUtils');

/**
 * @class
 * @namespace PIXI
 * @param gl {WebGLContext} the current WebGL drawing context
 */
function ComplexPrimitiveShader(gl) {
    /**
     * @member {number}
     * @private
     */
    this._UID = utils.uuid();

    /**
     * @member {WebGLContext}
     */
    this.gl = gl;

    /**
     * The WebGL program.
     * @member {Any}
     */
    this.program = null;

    /**
     * The fragment shader.
     * @member {Array}
     */
    this.fragmentSrc = [

        'precision mediump float;',

        'varying vec4 vColor;',

        'void main(void) {',
        '   gl_FragColor = vColor;',
        '}'
    ];

    /**
     * The vertex shader.
     * @member {Array}
     */
    this.vertexSrc = [
        'attribute vec2 aVertexPosition;',
        //'attribute vec4 aColor;',
        'uniform mat3 translationMatrix;',
        'uniform vec2 projectionVector;',
        'uniform vec2 offsetVector;',

        'uniform vec3 tint;',
        'uniform float alpha;',
        'uniform vec3 color;',
        'uniform float flipY;',
        'varying vec4 vColor;',

        'void main(void) {',
        '   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);',
        '   v -= offsetVector.xyx;',
        '   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);',
        '   vColor = vec4(color * alpha * tint, alpha);',//" * vec4(tint * alpha, alpha);',
        '}'
    ];

    this.init();
}

ComplexPrimitiveShader.prototype.constructor = ComplexPrimitiveShader;
module.exports = ComplexPrimitiveShader;

/**
 * Initialises the shader.
 *
 */
ComplexPrimitiveShader.prototype.init = function () {
    var gl = this.gl;

    var program = glUtils.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
    gl.useProgram(program);

    // get and store the uniforms for the shader
    this.projectionVector = gl.getUniformLocation(program, 'projectionVector');
    this.offsetVector = gl.getUniformLocation(program, 'offsetVector');
    this.tintColor = gl.getUniformLocation(program, 'tint');
    this.color = gl.getUniformLocation(program, 'color');
    this.flipY = gl.getUniformLocation(program, 'flipY');

    // get and store the attributes
    this.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
   // this.colorAttribute = gl.getAttribLocation(program, 'aColor');

    this.attributes = [this.aVertexPosition, this.colorAttribute];

    this.translationMatrix = gl.getUniformLocation(program, 'translationMatrix');
    this.alpha = gl.getUniformLocation(program, 'alpha');

    this.program = program;
};

/**
 * Destroys the shader.
 *
 */
ComplexPrimitiveShader.prototype.destroy = function () {
    this.gl.deleteProgram( this.program );
    this.uniforms = null;
    this.gl = null;

    this.attribute = null;
};
