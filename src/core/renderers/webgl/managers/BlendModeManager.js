var WebGLManager = require('./WebGLManager');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGlManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function BlendModeManager(renderer)
{
    WebGLManager.call(this, renderer);

    /**
     * @member {number}
     */
    this.currentBlendMode = 99999;
    this.currentSourcePremultiplied = true;
}

BlendModeManager.prototype = Object.create(WebGLManager.prototype);
BlendModeManager.prototype.constructor = BlendModeManager;
module.exports = BlendModeManager;

/**
 * Sets-up the given blendMode from WebGL's point of view.
 *
 * @param blendMode {number} the blendMode, should be a Pixi const, such as `PIXI.BLEND_MODES.ADD`. See
 *  {@link PIXI.BLEND_MODES} for possible values.
 */
BlendModeManager.prototype.setBlendMode = function (blendMode, isSourcePremultiplied)
{
    if (typeof isSourcePremultiplied === "undefined") {
        isSourcePremultiplied = true;
    }
    if (this.currentBlendMode === blendMode &&
        this.currentSourcePremultiplied == isSourcePremultiplied)
    {
        return false;
    }

    this.currentBlendMode = blendMode;
    this.currentSourcePremultiplied = isSourcePremultiplied;

    var mode = this.renderer.blendModes[this.currentBlendMode];
    var gl = this.renderer.gl;
    if (isSourcePremultiplied && mode[0] == gl.SRC_ALPHA)
        gl.blendFunc(gl.ONE, mode[1]);
    else
        gl.blendFunc(mode[0], mode[1]);
    return true;
};
