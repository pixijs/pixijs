'use strict';

exports.__esModule = true;

var _WebGLManager2 = require('./WebGLManager');

var _WebGLManager3 = _interopRequireDefault(_WebGLManager2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 */
var BlendModeManager = function (_WebGLManager) {
  _inherits(BlendModeManager, _WebGLManager);

  /**
   * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
   */
  function BlendModeManager(renderer) {
    _classCallCheck(this, BlendModeManager);

    /**
     * @member {number}
     */
    var _this = _possibleConstructorReturn(this, _WebGLManager.call(this, renderer));

    _this.currentBlendMode = 99999;
    return _this;
  }

  /**
   * Sets-up the given blendMode from WebGL's point of view.
   *
   * @param {number} blendMode - the blendMode, should be a PixiJS const, such as
   *  `PIXI.BLEND_MODES.ADD`. See {@link PIXI.BLEND_MODES} for possible values.
   * @return {boolean} Returns if the blend mode was changed.
   */


  BlendModeManager.prototype.setBlendMode = function setBlendMode(blendMode) {
    if (this.currentBlendMode === blendMode) {
      return false;
    }

    this.currentBlendMode = blendMode;

    var mode = this.renderer.blendModes[this.currentBlendMode];

    this.renderer.gl.blendFunc(mode[0], mode[1]);

    return true;
  };

  return BlendModeManager;
}(_WebGLManager3.default);

exports.default = BlendModeManager;
//# sourceMappingURL=BlendModeManager.js.map