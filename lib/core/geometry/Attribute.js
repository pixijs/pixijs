"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable max-len */

/**
 * holds the information for a single attribute structure required to render geometry.
 * this does not conatina the actul data, but instead has a buffer id that maps to a {PIXI.mesh.Buffer}
 * This can include anything from positions, uvs, normals, colors etc..
 *
 * @class
 * @memberof PIXI.mesh.Attribute
 */
var Attribute = function () {
  /**
   * @param {string} buffer  the id of the buffer that this attribute will look for
   * @param {Number} [size=0] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2.
   * @param {Boolean} [normalised=false] should the data be normalised.
   * @param {Number} [type=PIXI.TYPES.FLOAT] what type of numbe is the attribute. Check {PIXI.TYPES} to see the ones available
   * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
   * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
   */
  function Attribute(buffer, size) {
    var normalised = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5126;
    var stride = arguments[4];
    var start = arguments[5];
    var instance = arguments[6];

    _classCallCheck(this, Attribute);

    this.buffer = buffer;
    this.size = size;
    this.normalized = normalised;
    this.type = type;
    this.stride = stride;
    this.start = start;
    this.instance = instance;
  }

  /**
   * Destroys the Attribute.
   */


  Attribute.prototype.destroy = function destroy() {
    this.buffer = null;
  };

  /**
   * Helper function that creates an Attribute based on the information provided
   *
   * @static
   * @param {string} buffer  the id of the buffer that this attribute will look for
   * @param {Number} [size=2] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2
   * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
   * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
   * @param {Boolean} [normalised=false] should the data be normalised.
   *
   * @returns {PIXI.mesh.Attribute} A new {PIXI.mesh.Attribute} based on the information provided
   */


  Attribute.from = function from(buffer, size, stride, start, normalised) {
    return new Attribute(buffer, size, stride, start, normalised);
  };

  return Attribute;
}();

module.exports = Attribute;
//# sourceMappingURL=Attribute.js.map