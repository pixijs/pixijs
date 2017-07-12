"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class
 * @memberof PIXI
 */
var WebGLSystem = function () {
  /**
   * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
   */
  function WebGLSystem(renderer) {
    _classCallCheck(this, WebGLSystem);

    /**
     * The renderer this manager works for.
     *
     * @member {PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    this.renderer.runners.contextChange.add(this);
  }

  /**
   * Generic method called when there is a WebGL context change.
   *
   */


  WebGLSystem.prototype.contextChange = function contextChange() {}
  // do some codes init!


  /**
   * Generic destroy methods to be overridden by the subclass
   *
   */
  ;

  WebGLSystem.prototype.destroy = function destroy() {
    this.renderer.runners.contextChange.remove(this);
    this.renderer = null;
  };

  return WebGLSystem;
}();

exports.default = WebGLSystem;
//# sourceMappingURL=WebGLSystem.js.map