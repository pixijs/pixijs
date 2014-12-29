var WebGLGraphics = require('./WebGLGraphics');

/**
 * @class
 * @namespace PIXI
 * @private
 */
function WebGLMaskManager() {}

WebGLMaskManager.prototype.constructor = WebGLMaskManager;
module.exports = WebGLMaskManager;

/**
 * Sets the drawing context to the one given in parameter.
 *
 * @param gl {WebGLContext} the current WebGL drawing context
 */
WebGLMaskManager.prototype.setContext = function (gl) {
    this.gl = gl;
};

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param maskData {Array}
 * @param renderSession {object}
 */
WebGLMaskManager.prototype.pushMask = function (maskData, renderSession) {
    var gl = renderSession.gl;

    if (maskData.dirty) {
        WebGLGraphics.updateGraphics(maskData, gl);
    }

    if (!maskData._webGL[gl.id].data.length) {
        return;
    }

    renderSession.stencilManager.pushStencil(maskData, maskData._webGL[gl.id].data[0], renderSession);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 * @param maskData {Array}
 * @param renderSession {object} an object containing all the useful parameters
 */
WebGLMaskManager.prototype.popMask = function (maskData, renderSession) {
    var gl = this.gl;
    renderSession.stencilManager.popStencil(maskData, maskData._webGL[gl.id].data[0], renderSession);
};

/**
 * Destroys the mask stack.
 *
 */
WebGLMaskManager.prototype.destroy = function () {
    this.gl = null;
};
