var WebGLManager = require('./WebGLManager');

/**
 * @class
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this manager works for.
 */
function WebGLBlendModeManager(renderer) {
    WebGLManager.call(this, renderer);

    /**
     * @member {number}
     */
    this.currentBlendMode = 99999;
}

WebGLBlendModeManager.prototype = Object.create(WebGLManager.prototype);
WebGLBlendModeManager.prototype.constructor = WebGLBlendModeManager;
module.exports = WebGLBlendModeManager;

/**
 * Sets-up the given blendMode from WebGL's point of view.
 *
 * @param blendMode {number} the blendMode, should be a Pixi const, such as BlendModes.ADD
 */
WebGLBlendModeManager.prototype.setBlendMode = function (blendMode) {
    if (this.currentBlendMode === blendMode) {
        return false;
    }

    this.currentBlendMode = blendMode;

    var mode = this.renderer.blendModes[this.currentBlendMode];
    this.renderer.gl.blendFunc(mode[0], mode[1]);

    return true;
};
