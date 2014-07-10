/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
* @class WebGLMaskManager
* @constructor
* @param gl {WebGLContext} the current WebGL drawing context
* @private
*/
PIXI.WebGLBlendModeManager = function(gl)
{
    this.gl = gl;
    this.currentBlendMode = 99999;
};

/**
* Sets-up the given blendMode from WebGL's point of view
* @method setBlendMode 
*
* @param blendMode {Number} the blendMode, should be a Pixi const, such as PIXI.BlendModes.ADD
*/
PIXI.WebGLBlendModeManager.prototype.setBlendMode = function(blendMode)
{
    if(this.currentBlendMode === blendMode)return false;
 //   console.log("SWAP!")
    this.currentBlendMode = blendMode;
    
    var blendModeWebGL = PIXI.blendModesWebGL[this.currentBlendMode];
    this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
    
    return true;
};

PIXI.WebGLBlendModeManager.prototype.destroy = function()
{
    this.gl = null;
};