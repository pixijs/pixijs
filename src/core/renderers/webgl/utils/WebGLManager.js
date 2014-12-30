/**
 * @class
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this manager works for.
 */
function WebGLManager(renderer) {
    /**
     * The renderer this manager works for.
     *
     * @member {WebGLRenderer}
     */
    this.renderer = renderer;
}

WebGLManager.prototype.constructor = WebGLManager;
module.exports = WebGLManager;

WebGLManager.prototype.destroy = function () {
    this.renderer = null;
};
