"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 */
var Point = function () {
  /**
   * @param {number} [x=0] - position of the point on the x axis
   * @param {number} [y=0] - position of the point on the y axis
   */
  function Point() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Point);

    /**
     * @member {number}
     * @default 0
     */
    this.x = x;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y;
  }

  /**
   * Creates a clone of this point
   *
   * @return {PIXI.Point} a copy of the point
   */


  Point.prototype.clone = function clone() {
    return new Point(this.x, this.y);
  };

  /**
   * Copies x and y from the given point
   *
   * @param {PIXI.Point} p - The point to copy.
   */


  Point.prototype.copy = function copy(p) {
    this.set(p.x, p.y);
  };

  /**
   * Returns true if the given point is equal to this point
   *
   * @param {PIXI.Point} p - The point to check
   * @returns {boolean} Whether the given point equal to this point
   */


  Point.prototype.equals = function equals(p) {
    return p.x === this.x && p.y === this.y;
  };

  /**
   * Sets the point to a new x and y position.
   * If y is omitted, both x and y will be set to x.
   *
   * @param {number} [x=0] - position of the point on the x axis
   * @param {number} [y=0] - position of the point on the y axis
   */


  Point.prototype.set = function set(x, y) {
    this.x = x || 0;
    this.y = y || (y !== 0 ? this.x : 0);
  };

  return Point;
}();

exports.default = Point;
//# sourceMappingURL=Point.js.map