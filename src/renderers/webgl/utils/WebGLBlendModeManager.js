/**
 * @class
 * @namespace PIXI
 * @param gl {WebGLContext} the current WebGL drawing context
 */
function WebGLBlendModeManager() {
    /**
     * @member {number}
     */
    this.currentBlendMode = 99999;
};

WebGLBlendModeManager.prototype.constructor = WebGLBlendModeManager;
module.exports = WebGLBlendModeManager;

/**
 * Sets the WebGL Context.
 *
 * @param gl {WebGLContext} the current WebGL drawing context
 */
WebGLBlendModeManager.prototype.setContext = function (gl) {
    this.gl = gl;
};

/**
 * Sets-up the given blendMode from WebGL's point of view.
 *
 * @param blendMode {number} the blendMode, should be a Pixi const, such as BlendModes.ADD
 */
WebGLBlendModeManager.prototype.setBlendMode = function (blendMode) {
    if (this.currentBlendMode === blendMode)return false;

    this.currentBlendMode = blendMode;

    var blendModeWebGL = blendModesWebGL[this.currentBlendMode];
    this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);

    return true;
};

/**
 * Destroys this object.
 *
 */
WebGLBlendModeManager.prototype.destroy = function () {
    this.gl = null;
};
