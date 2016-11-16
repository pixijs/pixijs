'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class
 * @memberof PIXI
 */
var WebGLManager = function () {
  /**
   * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
   */
  function WebGLManager(renderer) {
    _classCallCheck(this, WebGLManager);

    /**
     * The renderer this manager works for.
     *
     * @member {PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    this.renderer.on('context', this.onContextChange, this);
  }

  /**
   * Generic method called when there is a WebGL context change.
   *
   */


  WebGLManager.prototype.onContextChange = function onContextChange() {}
  // do some codes init!


  /**
   * Generic destroy methods to be overridden by the subclass
   *
   */
  ;

  WebGLManager.prototype.destroy = function destroy() {
    this.renderer.off('context', this.onContextChange, this);

    this.renderer = null;
  };

  return WebGLManager;
}();

exports.default = WebGLManager;
//# sourceMappingURL=WebGLManager.js.map