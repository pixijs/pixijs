'use strict';

exports.__esModule = true;

var _WebGLManager2 = require('../managers/WebGLManager');

var _WebGLManager3 = _interopRequireDefault(_WebGLManager2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Base for a common object renderer that can be used as a system renderer plugin.
 *
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
var ObjectRenderer = function (_WebGLManager) {
  _inherits(ObjectRenderer, _WebGLManager);

  function ObjectRenderer() {
    _classCallCheck(this, ObjectRenderer);

    return _possibleConstructorReturn(this, _WebGLManager.apply(this, arguments));
  }

  /**
   * Starts the renderer and sets the shader
   *
   */
  ObjectRenderer.prototype.start = function start() {}
  // set the shader..


  /**
   * Stops the renderer
   *
   */
  ;

  ObjectRenderer.prototype.stop = function stop() {
    this.flush();
  };

  /**
   * Stub method for rendering content and emptying the current batch.
   *
   */


  ObjectRenderer.prototype.flush = function flush() {}
  // flush!


  /**
   * Renders an object
   *
   * @param {PIXI.DisplayObject} object - The object to render.
   */
  ;

  ObjectRenderer.prototype.render = function render(object) // eslint-disable-line no-unused-vars
  {
    // render the object
  };

  return ObjectRenderer;
}(_WebGLManager3.default);

exports.default = ObjectRenderer;
//# sourceMappingURL=ObjectRenderer.js.map