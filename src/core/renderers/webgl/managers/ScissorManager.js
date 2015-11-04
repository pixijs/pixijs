var WebGLManager = require('./WebGLManager');

/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function ScissorManager(renderer)
{
    WebGLManager.call(this, renderer);
    this.scissorMaskStack = null;
}

ScissorManager.prototype = Object.create(WebGLManager.prototype);
ScissorManager.prototype.constructor = ScissorManager;
module.exports = ScissorManager;

/**
 * Changes the mask stack that is used by this manager.
 *
 * @param scissorMaskStack {PIXI.scissorMaskStack} The mask stack
 */
ScissorManager.prototype.setMaskStack = function ( scissorMaskStack )
{
    this.scissorMaskStack = scissorMaskStack;

    var gl = this.renderer.gl;

    if (scissorMaskStack.scissorStack.length === 0)
    {
        gl.disable(gl.SCISSOR_TEST);
    }
    else
    {
        gl.enable(gl.SCISSOR_TEST);
    }
};

/**
 * Applies the Scissor and adds it to the current filter stack.
 *
 * @param scissor {PIXI.Rectable}
 */
ScissorManager.prototype.pushScissor = function (scissor)
{
    var gl = this.renderer.gl,
        scissorStack = this.scissorMaskStack.scissorStack,
        r = this.renderer;

    if (scissorStack.length === 0)
    {
        gl.enable(gl.SCISSOR_TEST);
    }

    scissorStack.push(scissor);

    gl.scissor(scissor.x * r.resolution, scissor.y * r.resolution, scissor.width * r.resolution, scissor.height * r.resolution);
};


/**
 * Pops the scissor off the stack
 *
 * @param scissor {PIXI.Rectable}
 */
ScissorManager.prototype.popScissor = function (scissor)
{
    var gl = this.renderer.gl,
        scissorStack = this.scissorMaskStack.scissorStack,
        r = this.renderer;

    scissorStack.pop();

    if (scissorStack.length === 0)
    {
        gl.disable(gl.SCISSOR_TEST);
    }
    else
    {
        gl.scissor(scissor.x * r.resolution, scissor.y * r.resolution, scissor.width * r.resolution, scissor.height * r.resolution);
    }
};

/**
 * Destroys the mask stack.
 *
 */
ScissorManager.prototype.destroy = function ()
{
    WebGLManager.prototype.destroy.call(this);

    this.scissorMaskStack.scissorStack = null;
};

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param maskData {PIXI.Rectangle} The mask data structure to use
 */
ScissorManager.prototype.pushMask = function (maskData)
{
    this.pushScissor(maskData);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 * @param maskData {PIXI.Rectangle}
 */
ScissorManager.prototype.popMask = function (maskData)
{
    this.popScissor(maskData);
};

