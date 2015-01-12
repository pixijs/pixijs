var WebGLManager = require('./WebGLManager'),
    WebGLGraphics = require('../utils/WebGLGraphics');

/**
 * @class
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this manager works for.
 */
function WebGLMaskManager(renderer)
{
    WebGLManager.call(this, renderer);
}

WebGLMaskManager.prototype = Object.create(WebGLManager.prototype);
WebGLMaskManager.prototype.constructor = WebGLMaskManager;
module.exports = WebGLMaskManager;

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param maskData {any[]}
 */
WebGLMaskManager.prototype.pushMask = function (maskData)
{
    if (maskData.dirty)
    {
        WebGLGraphics.updateGraphics(maskData, this.renderer.gl);
    }

    if (!maskData._webGL[this.renderer.gl.id].data.length)
    {
        return;
    }

    this.renderer.stencilManager.pushStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0], this.renderer);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 * @param maskData {any[]}
 */
WebGLMaskManager.prototype.popMask = function (maskData)
{
    this.renderer.stencilManager.popStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0], this.renderer);
};
