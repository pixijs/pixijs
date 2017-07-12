'use strict';

exports.__esModule = true;

var _Geometry = require('../../geometry/Geometry');

var _Geometry2 = _interopRequireDefault(_Geometry);

var _Buffer = require('../../geometry/Buffer');

var _Buffer2 = _interopRequireDefault(_Buffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @private
 * @memberof PIXI
 */
var WebGLGraphicsData = function () {
  /**
   * @param {WebGLRenderingContext} gl - The current WebGL drawing context
   * @param {PIXI.Shader} shader - The shader
   */
  function WebGLGraphicsData(gl, shader) {
    _classCallCheck(this, WebGLGraphicsData);

    /**
     * The current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    // TODO does this need to be split before uploading??
    /**
     * An array of color components (r,g,b)
     * @member {number[]}
     */
    this.color = [0, 0, 0]; // color split!

    /**
     * An array of points to draw
     * @member {PIXI.Point[]}
     */
    this.points = [];

    /**
     * The indices of the vertices
     * @member {number[]}
     */
    this.indices = [];
    /**
     * The main buffer
     * @member {WebGLBuffer}
     */
    this.buffer = new _Buffer2.default();

    /**
     * The index buffer
     * @member {WebGLBuffer}
     */
    this.indexBuffer = new _Buffer2.default();

    /**
     * Whether this graphics is dirty or not
     * @member {boolean}
     */
    this.dirty = true;

    /**
     *
     * @member {PIXI.Shader}
     */
    this.shader = shader;

    this.geometry = new _Geometry2.default().addAttribute('aVertexPosition|aColor', this.buffer).addIndex(this.indexBuffer);
  }

  /**
   * Resets the vertices and the indices
   */


  WebGLGraphicsData.prototype.reset = function reset() {
    this.points.length = 0;
    this.indices.length = 0;
  };

  /**
   * Binds the buffers and uploads the data
   */


  WebGLGraphicsData.prototype.upload = function upload() {
    this.glPoints = new Float32Array(this.points);
    this.buffer.update(this.glPoints);

    this.glIndices = new Uint16Array(this.indices);
    this.indexBuffer.update(this.glIndices);

    //     console.log("UPKOADING,.",this.glPoints,this.glIndices)
    this.dirty = false;
  };

  /**
   * Empties all the data
   */


  WebGLGraphicsData.prototype.destroy = function destroy() {
    this.color = null;
    this.points = null;
    this.indices = null;

    this.vao.destroy();
    this.buffer.destroy();
    this.indexBuffer.destroy();

    this.gl = null;

    this.buffer = null;
    this.indexBuffer = null;

    this.glPoints = null;
    this.glIndices = null;
  };

  return WebGLGraphicsData;
}();

exports.default = WebGLGraphicsData;
//# sourceMappingURL=WebGLGraphicsData.js.map