"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UID = 0;
/* eslint-disable max-len */

/**
 * A wrapper for data so that it can be used and uploaded by webGL
 *
 * @class
 * @memberof PIXI
 */

var Buffer = function () {
  /**
   * @param {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data the data to store in the buffer.
   */
  function Buffer(data) {
    var _static = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, Buffer);

    /**
     * The data in the buffer, as a typed array
     *
     * @type {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data  the array / typedArray
     */
    this.data = data || new Float32Array(1);

    /**
     * A map of renderer IDs to webgl buffer
     *
     * @private
     * @member {object<number, GLBuffer>}
     */
    this._glBuffers = {};

    this._updateID = 0;

    this.index = index;

    this.static = _static;

    this.id = UID++;
  }

  // TODO could explore flagging only a partial upload?
  /**
   * flags this buffer as requiring an upload to the GPU
   */


  Buffer.prototype.update = function update(data) {
    this.data = data || this.data;
    this._updateID++;
  };

  /**
   * Destroys the buffer
   */


  Buffer.prototype.destroy = function destroy() {
    for (var i = 0; i < this._glBuffers.length; i++) {
      this._glBuffers[i].destroy();
    }

    this.data = null;
  };

  /**
   * Helper function that creates a buffer based on an array or TypedArray
   *
   * @static
   * @param {TypedArray| Array} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
   * @return {PIXI.mesh.Buffer} A new Buffer based on the data provided.
   */


  Buffer.from = function from(data) {
    if (data instanceof Array) {
      data = new Float32Array(data);
    }

    return new Buffer(data);
  };

  return Buffer;
}();

exports.default = Buffer;
//# sourceMappingURL=Buffer.js.map