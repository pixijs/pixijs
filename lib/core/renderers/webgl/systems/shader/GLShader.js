'use strict';

exports.__esModule = true;

var _compileProgram = require('./shader/compileProgram');

var _compileProgram2 = _interopRequireDefault(_compileProgram);

var _extractAttributes = require('./shader/extractAttributes');

var _extractAttributes2 = _interopRequireDefault(_extractAttributes);

var _extractUniforms = require('./shader/extractUniforms');

var _extractUniforms2 = _interopRequireDefault(_extractUniforms);

var _setPrecision = require('./shader/setPrecision');

var _setPrecision2 = _interopRequireDefault(_setPrecision);

var _generateUniformAccessObject = require('./shader/generateUniformAccessObject');

var _generateUniformAccessObject2 = _interopRequireDefault(_generateUniformAccessObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ID = 0;

/**
 * Helper class to create a webGL Shader
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext}
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 * @param precision {string} The float precision of the shader. Options are 'lowp', 'mediump' or 'highp'.
 * @param attributeLocations {object} A key value pair showing which location eact
 * attribute should sit eg {position:0, uvs:1}
 */

var Shader = function () {
  function Shader(gl, vertexSrc, fragmentSrc, precision, attributeLocations) {
    _classCallCheck(this, Shader);

    /**
     * The current WebGL rendering context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    if (precision) {
      vertexSrc = (0, _setPrecision2.default)(vertexSrc, precision);
      fragmentSrc = (0, _setPrecision2.default)(fragmentSrc, precision);
    }

    /**
     * The shader program
     *
     * @member {WebGLProgram}
     */
    // First compile the program..
    this.program = (0, _compileProgram2.default)(gl, vertexSrc, fragmentSrc, attributeLocations);

    /**
     * The attributes of the shader as an object containing the following properties
     * {
     *  type,
     *  size,
     *  location,
     *  pointer
     * }
     * @member {Object}
     */
    // next extract the attributes
    this.attributes = (0, _extractAttributes2.default)(gl, this.program);

    this.uniformData = (0, _extractUniforms2.default)(gl, this.program);

    /**
     * The uniforms of the shader as an object containing the following properties
     * {
     *  gl,
     *  data
     * }
     * @member {Object}
     */
    this.uniforms = (0, _generateUniformAccessObject2.default)(gl, this.uniformData);

    this.uniformGroups = {};

    this.id = ID++;
  }

  /**
   * Uses this shader
   */


  Shader.prototype.bind = function bind() {
    this.gl.useProgram(this.program);
  };

  /**
   * Destroys this shader
   * TODO
   */


  Shader.prototype.destroy = function destroy() {
    this.attributes = null;
    this.uniformData = null;
    this.uniforms = null;

    var gl = this.gl;

    gl.deleteProgram(this.program);
  };

  return Shader;
}();

exports.default = Shader;
//# sourceMappingURL=GLShader.js.map