'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a Canvas element of the given size.
 *
 * @class
 * @memberof PIXI
 */
var CanvasRenderTarget = function () {
  /**
   * @param {number} width - the width for the newly created canvas
   * @param {number} height - the height for the newly created canvas
   * @param {number} [resolution=1] - The resolution / device pixel ratio of the canvas
   */
  function CanvasRenderTarget(width, height, resolution) {
    _classCallCheck(this, CanvasRenderTarget);

    /**
     * The Canvas object that belongs to this CanvasRenderTarget.
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d');

    this.resolution = resolution || _settings2.default.RESOLUTION;

    this.resize(width, height);
  }

  /**
   * Clears the canvas that was created by the CanvasRenderTarget class.
   *
   * @private
   */


  CanvasRenderTarget.prototype.clear = function clear() {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  /**
   * Resizes the canvas to the specified width and height.
   *
   * @param {number} width - the new width of the canvas
   * @param {number} height - the new height of the canvas
   */


  CanvasRenderTarget.prototype.resize = function resize(width, height) {
    this.canvas.width = width * this.resolution;
    this.canvas.height = height * this.resolution;
  };

  /**
   * Destroys this canvas.
   *
   */


  CanvasRenderTarget.prototype.destroy = function destroy() {
    this.context = null;
    this.canvas = null;
  };

  /**
   * The width of the canvas buffer in pixels.
   *
   * @member {number}
   */


  _createClass(CanvasRenderTarget, [{
    key: 'width',
    get: function get() {
      return this.canvas.width;
    },
    set: function set(val) // eslint-disable-line require-jsdoc
    {
      this.canvas.width = val;
    }

    /**
     * The height of the canvas buffer in pixels.
     *
     * @member {number}
     */

  }, {
    key: 'height',
    get: function get() {
      return this.canvas.height;
    },
    set: function set(val) // eslint-disable-line require-jsdoc
    {
      this.canvas.height = val;
    }
  }]);

  return CanvasRenderTarget;
}();

exports.default = CanvasRenderTarget;
//# sourceMappingURL=CanvasRenderTarget.js.map