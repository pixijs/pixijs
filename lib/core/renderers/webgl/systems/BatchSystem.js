'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _ObjectRenderer = require('../utils/ObjectRenderer');

var _ObjectRenderer2 = _interopRequireDefault(_ObjectRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

var BatchSystem = function (_WebGLSystem) {
  _inherits(BatchSystem, _WebGLSystem);

  /**
   * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
   */
  function BatchSystem(renderer) {
    _classCallCheck(this, BatchSystem);

    /**
     * An empty renderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

    _this.emptyRenderer = new _ObjectRenderer2.default(renderer);

    /**
     * The currently active ObjectRenderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    _this.currentRenderer = _this.emptyRenderer;
    return _this;
  }

  /**
   * Changes the current renderer to the one given in parameter
   *
   * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
   */


  BatchSystem.prototype.setObjectRenderer = function setObjectRenderer(objectRenderer) {
    if (this.currentRenderer === objectRenderer) {
      return;
    }

    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;

    this.renderer.state.setState(objectRenderer.state);

    this.currentRenderer.start();
  };

  /**
   * This should be called if you wish to do some custom rendering
   * It will basically render anything that may be batched up such as sprites
   *
   */


  BatchSystem.prototype.flush = function flush() {
    this.setObjectRenderer(this.emptyRenderer);
  };

  BatchSystem.prototype.reset = function reset() {
    this.setObjectRenderer(this.emptyRenderer);
  };

  return BatchSystem;
}(_WebGLSystem3.default);

exports.default = BatchSystem;
//# sourceMappingURL=BatchSystem.js.map