/**
 * @author Mat Groves
 * 
 * 
 */
/**
 * A set of functions used to handle masking
 *
 * @class CanvasMaskManager
 */
PIXI.CanvasMaskManager = function()
{
    
};

/**
 * This method adds it to the current stack of masks
 *
 * @method pushMask
 * @param maskData the maskData that will be pushed
 * @param context {Context2D} the 2d drawing method of the canvas
 */
PIXI.CanvasMaskManager.prototype.pushMask = function(maskData, context)
{
    context.save();
    
    var cacheAlpha = maskData.alpha;
    var transform = maskData.worldTransform;

    context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);

    PIXI.CanvasGraphics.renderGraphicsMask(maskData, context);

    context.clip();

    maskData.worldAlpha = cacheAlpha;
};

/**
 * Restores the current drawing context to the state it was before the mask was applied
 *
 * @method popMask
 * @param context {Context2D} the 2d drawing method of the canvas
 */
PIXI.CanvasMaskManager.prototype.popMask = function(context)
{
    context.restore();
};