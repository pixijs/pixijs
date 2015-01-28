/**
 * @class
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this manager works for.
 */
function StencilMaskStack()
{
    this.stencilStack = [];
    this.reverse = true;
    this.count = 0;
}

StencilMaskStack.prototype.constructor = StencilMaskStack;
module.exports = StencilMaskStack;
