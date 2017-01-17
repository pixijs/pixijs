"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class
 * @memberof PIXI
 */
var Buffer = function () {
  /**
   * @param {number} size - The size of the buffer in bytes.
   */
  function Buffer(size) {
    _classCallCheck(this, Buffer);

    this.vertices = new ArrayBuffer(size);

    /**
     * View on the vertices as a Float32Array for positions
     *
     * @member {Float32Array}
     */
    this.float32View = new Float32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for uvs
     *
     * @member {Float32Array}
     */
    this.uint32View = new Uint32Array(this.vertices);
  }

  /**
   * Destroys the buffer.
   *
   */


  Buffer.prototype.destroy = function destroy() {
    this.vertices = null;
    this.positions = null;
    this.uvs = null;
    this.colors = null;
  };

  return Buffer;
}();

exports.default = Buffer;
//# sourceMappingURL=BatchBuffer.js.map