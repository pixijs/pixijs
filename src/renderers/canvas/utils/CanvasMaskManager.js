/**
 * A set of functions used to handle masking.
 *
 * @class
 * @namespace PIXI
 */
function CanvasMaskManager() {
}

CanvasMaskManager.prototype.constructor = CanvasMaskManager;
module.exports = CanvasMaskManager;

/**
 * This method adds it to the current stack of masks.
 *
 * @param maskData {object} the maskData that will be pushed
 * @param renderSession {object} The renderSession whose context will be used for this mask manager.
 */
CanvasMaskManager.prototype.pushMask = function (maskData, renderSession) {
    renderSession.context.save();

    var cacheAlpha = maskData.alpha;
    var transform = maskData.worldTransform;
    var resolution = renderSession.resolution;

    renderSession.context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );

    CanvasGraphics.renderGraphicsMask(maskData, renderSession.context);

    renderSession.context.clip();

    maskData.worldAlpha = cacheAlpha;
};

/**
 * Restores the current drawing context to the state it was before the mask was applied.
 *
 * @param renderSession {object} The renderSession whose context will be used for this mask manager.
 */
CanvasMaskManager.prototype.popMask = function (renderSession) {
    renderSession.context.restore();
};
