'use strict';

exports.__esModule = true;

var _Shader2 = require('../../../shader/Shader');

var _Shader3 = _interopRequireDefault(_Shader2);

var _Program = require('../../../shader/Program');

var _Program2 = _interopRequireDefault(_Program);

var _const = require('../../../const');

var _settings = require('../../../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
var Filter = function (_Shader) {
  _inherits(Filter, _Shader);

  /**
   * @param {string} [vertexSrc] - The source of the vertex shader.
   * @param {string} [fragmentSrc] - The source of the fragment shader.
   * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
   */
  function Filter(vertexSrc, fragmentSrc, uniforms) {
    _classCallCheck(this, Filter);

    var program = _Program2.default.from(vertexSrc, fragmentSrc);

    var _this = _possibleConstructorReturn(this, _Shader.call(this, program, uniforms));

    _this.blendMode = _const.BLEND_MODES.NORMAL;

    /**
     * The padding of the filter. Some filters require extra space to breath such as a blur.
     * Increasing this will add extra width and height to the bounds of the object that the
     * filter is applied to.
     *
     * @member {number}
     */
    _this.padding = 4;

    /**
     * The resolution of the filter. Setting this to be lower will lower the quality but
     * increase the performance of the filter.
     *
     * @member {number}
     */
    _this.resolution = _settings2.default.RESOLUTION;

    /**
     * If enabled is true the filter is applied, if false it will not.
     *
     * @member {boolean}
     */
    _this.enabled = true;

    /**
     * If enabled, pixi will fit the filter area into boundaries for better performance.
     * Switch it off if it does not work for specific shader.
     *
     * @member {boolean}
     */
    _this.autoFit = true;
    return _this;
  }

  /**
   * Applies the filter
   *
   * @param {PIXI.FilterManager} filterManager - The renderer to retrieve the filter from
   * @param {PIXI.RenderTarget} input - The input render target.
   * @param {PIXI.RenderTarget} output - The target to output to.
   * @param {boolean} clear - Should the output be cleared before rendering to it
   * @param {object} [currentState] - It's current state of filter.
   *        There are some useful properties in the currentState :
   *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
   */


  Filter.prototype.apply = function apply(filterManager, input, output, clear, currentState) // eslint-disable-line no-unused-vars
  {
    // do as you please!

    filterManager.applyFilter(this, input, output, clear, currentState);

    // or just do a regular render..
  };

  return Filter;
}(_Shader3.default);

exports.default = Filter;
//# sourceMappingURL=Filter.js.map