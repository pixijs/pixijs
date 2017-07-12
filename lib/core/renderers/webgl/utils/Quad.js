'use strict';

exports.__esModule = true;

var _createIndicesForQuads = require('../../../utils/createIndicesForQuads');

var _createIndicesForQuads2 = _interopRequireDefault(_createIndicesForQuads);

var _Geometry2 = require('../../../geometry/Geometry');

var _Geometry3 = _interopRequireDefault(_Geometry2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 */
var Quad = function (_Geometry) {
  _inherits(Quad, _Geometry);

  /**
   * @param {WebGLRenderingContext} gl - The gl context for this quad to use.
   * @param {object} state - TODO: Description
   */
  function Quad() {
    _classCallCheck(this, Quad);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    var _this = _possibleConstructorReturn(this, _Geometry.call(this));

    _this.vertices = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);

    /**
     * The Uvs of the quad
     *
     * @member {Float32Array}
     */
    _this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);

    _this.interleaved = new Float32Array(8 * 2);

    for (var i = 0; i < 4; i++) {
      _this.interleaved[i * 4] = _this.vertices[i * 2];
      _this.interleaved[i * 4 + 1] = _this.vertices[i * 2 + 1];
      _this.interleaved[i * 4 + 2] = _this.uvs[i * 2];
      _this.interleaved[i * 4 + 3] = _this.uvs[i * 2 + 1];
    }

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    _this.indices = (0, _createIndicesForQuads2.default)(1);

    /**
     * The vertex buffer
     *
     * @member {glCore.GLBuffer}
     */
    // this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.interleaved, gl.STATIC_DRAW);

    /**
     * The index buffer
     *
     * @member {glCore.GLBuffer}
     */
    // this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    /**
     * The vertex array object
     *
     * @member {glCore.VertexArrayObject}
     */
    // this.vao = new glCore.VertexArrayObject(gl, state);

    _this.addAttribute('aVertexPosition', _this.vertices).addAttribute('aTextureCoord', _this.uvs).addIndex(_this.indices);
    return _this;
  }

  /**
   * Initialises the vaos and uses the shader.
   *
   * @param {PIXI.Shader} shader - the shader to use
   */


  Quad.prototype.initVao = function initVao(shader) {
    this.vao.clear().addIndex(this.indexBuffer).addAttribute(this.vertexBuffer, shader.attributes.aVertexPosition, this.gl.FLOAT, false, 4 * 4, 0).addAttribute(this.vertexBuffer, shader.attributes.aTextureCoord, this.gl.FLOAT, false, 4 * 4, 2 * 4);
  };

  /**
   * Maps two Rectangle to the quad.
   *
   * @param {PIXI.Rectangle} targetTextureFrame - the first rectangle
   * @param {PIXI.Rectangle} destinationFrame - the second rectangle
   * @return {PIXI.Quad} Returns itself.
   */


  Quad.prototype.map = function map(targetTextureFrame, destinationFrame) {
    var x = 0; // destinationFrame.x / targetTextureFrame.width;
    var y = 0; // destinationFrame.y / targetTextureFrame.height;

    this.uvs[0] = x;
    this.uvs[1] = y;

    this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[3] = y;

    this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height;

    this.uvs[6] = x;
    this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height;

    x = destinationFrame.x;
    y = destinationFrame.y;

    this.vertices[0] = x;
    this.vertices[1] = y;

    this.vertices[2] = x + destinationFrame.width;
    this.vertices[3] = y;

    this.vertices[4] = x + destinationFrame.width;
    this.vertices[5] = y + destinationFrame.height;

    this.vertices[6] = x;
    this.vertices[7] = y + destinationFrame.height;

    return this;
  };

  /**
   * Binds the buffer and uploads the data
   *
   * @return {PIXI.Quad} Returns itself.
   */


  Quad.prototype.upload = function upload() {
    this.getAttribute('aVertexPosition').update();
    this.getAttribute('aTextureCoord').update();

    for (var i = 0; i < 4; i++) {
      this.interleaved[i * 4] = this.vertices[i * 2];
      this.interleaved[i * 4 + 1] = this.vertices[i * 2 + 1];
      this.interleaved[i * 4 + 2] = this.uvs[i * 2];
      this.interleaved[i * 4 + 3] = this.uvs[i * 2 + 1];
    }

    this.vertexBuffer.upload(this.interleaved);

    return this;
  };

  /**
   * Removes this quad from WebGL
   */


  Quad.prototype.destroy = function destroy() {
    //   const gl = this.gl;

    //  gl.deleteBuffer(this.vertexBuffer);
    //  gl.deleteBuffer(this.indexBuffer);
  };

  return Quad;
}(_Geometry3.default);

exports.default = Quad;
//# sourceMappingURL=Quad.js.map