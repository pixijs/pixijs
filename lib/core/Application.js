'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _autoDetectRenderer = require('./autoDetectRenderer');

var _Container = require('./display/Container');

var _Container2 = _interopRequireDefault(_Container);

var _ticker = require('./ticker');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convenience class to create a new PIXI application.
 * This class automatically creates the renderer, ticker
 * and root container.
 *
 * @example
 * // Create the application
 * const app = new PIXI.Application();
 *
 * // Add the view to the DOM
 * document.body.appendChild(app.view);
 *
 * // ex, add display objects
 * app.stage.addChild(PIXI.Sprite.fromImage('something.png'));
 *
 * @class
 * @memberof PIXI
 */
var Application = function () {
  /**
   * @param {number} [width=800] - the width of the renderers view
   * @param {number} [height=600] - the height of the renderers view
   * @param {object} [options] - The optional renderer parameters
   * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
   * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
   * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
   * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
   *      need to call toDataUrl on the webgl context
   * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
   * @param {boolean} [noWebGL=false] - prevents selection of WebGL renderer, even if such is present
   * @param {boolean} [options.legacy=false] - If true Pixi will aim to ensure compatibility
   * with older / less advanced devices. If you experience unexplained flickering try setting this to true.
   * @param {boolean} [useSharedTicker=false] - `true` to use PIXI.ticker.shared, `false` to create new ticker.
   */
  function Application(width, height, options, noWebGL) {
    var useSharedTicker = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    _classCallCheck(this, Application);

    /**
     * WebGL renderer if available, otherwise CanvasRenderer
     * @member {PIXI.WebGLRenderer|PIXI.CanvasRenderer}
     */
    this.renderer = (0, _autoDetectRenderer.autoDetectRenderer)(width, height, options, noWebGL);

    /**
     * The root display container that's rendered.
     * @member {PIXI.Container}
     */
    this.stage = new _Container2.default();

    /**
     * Internal reference to the ticker
     * @member {PIXI.ticker.Ticker}
     * @private
     */
    this._ticker = null;

    /**
     * Ticker for doing render updates.
     * @member {PIXI.ticker.Ticker}
     * @default PIXI.ticker.shared
     */
    this.ticker = useSharedTicker ? _ticker.shared : new _ticker.Ticker();

    // Start the rendering
    this.start();
  }

  /**
   * Render the current stage.
   */
  Application.prototype.render = function render() {
    this.renderer.render(this.stage);
  };

  /**
   * Convenience method for stopping the render.
   */


  Application.prototype.stop = function stop() {
    this._ticker.stop();
  };

  /**
   * Convenience method for starting the render.
   */


  Application.prototype.start = function start() {
    this._ticker.start();
  };

  /**
   * Reference to the renderer's canvas element.
   * @member {HTMLCanvasElement}
   * @readonly
   */


  /**
   * Destroy and don't use after this.
   * @param {Boolean} [removeView=false] Automatically remove canvas from DOM.
   */
  Application.prototype.destroy = function destroy(removeView) {
    this.stop();
    this.ticker = null;

    this.stage.destroy();
    this.stage = null;

    this.renderer.destroy(removeView);
    this.renderer = null;
  };

  _createClass(Application, [{
    key: 'ticker',
    set: function set(ticker) // eslint-disable-line require-jsdoc
    {
      if (this._ticker) {
        this._ticker.remove(this.render, this);
      }
      this._ticker = ticker;
      if (ticker) {
        ticker.add(this.render, this);
      }
    },
    get: function get() // eslint-disable-line require-jsdoc
    {
      return this._ticker;
    }
  }, {
    key: 'view',
    get: function get() {
      return this.renderer.view;
    }

    /**
     * Reference to the renderer's screen rectangle. Its safe to use as filterArea or hitArea for whole screen
     * @member {PIXI.Rectangle}
     * @readonly
     */

  }, {
    key: 'screen',
    get: function get() {
      return this.renderer.screen;
    }
  }]);

  return Application;
}();

exports.default = Application;
//# sourceMappingURL=Application.js.map