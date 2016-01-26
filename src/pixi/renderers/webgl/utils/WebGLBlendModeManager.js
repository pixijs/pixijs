/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
* @class WebGLBlendModeManager
* @constructor
* @param gl {WebGLContext} the current WebGL drawing context
*/
PIXI.WebGLBlendModeManager = function()
{
    /**
     * @property currentBlendMode
     * @type Number
     */
    this.currentBlendMode = 99999;
};

PIXI.WebGLBlendModeManager.prototype.constructor = PIXI.WebGLBlendModeManager;

/**
 * Sets the WebGL Context.
 *
 * @method setContext
 * @param gl {WebGLContext} the current WebGL drawing context
 */
PIXI.WebGLBlendModeManager.prototype.setContext = function(gl)
{
    this.gl = gl;
};

/**
* Sets-up the given blendMode from WebGL's point of view.
*
* @method setBlendMode
* @param blendMode {Number} the blendMode, should be a Pixi const, such as PIXI.BlendModes.ADD
*/
PIXI.WebGLBlendModeManager.prototype.setBlendMode = function (blendMode, isSourcePremultiplied)
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

    var mode = PIXI.blendModesWebGL[this.currentBlendMode];
    var gl = this.gl;
    if (isSourcePremultiplied && mode[0] == gl.SRC_ALPHA)
        gl.blendFunc(gl.ONE, mode[1]);
    else
        gl.blendFunc(mode[0], mode[1]);
    return true;
};

/**
* Destroys this object.
*
* @method destroy
*/
PIXI.WebGLBlendModeManager.prototype.destroy = function()
{
    this.gl = null;
};
