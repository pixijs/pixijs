/**
 * The base class for brush subclasses, which define how a shape should be filled or stroked
 *
 * @class
 * @memberof PIXI
 */
function Brush(color, alpha)
{
    /**
     * @member {number}
     */
    this.color = color;

    /**
     * @member {number}
     * @default 1
     */
    this.alpha = (alpha === undefined) ? 1 : alpha;

    /**
     * @member {Object}
     */
    this._canvasBrush = null;
}

/**
 * Sets the brush as a fill style for the given canvas context
 *
 * @param context {CanvasRenderingContext2D}
 * @param worldAlpha {number}
 */
Brush.prototype.fillCanvas = function (context, worldAlpha) {
    context.globalAlpha = this.alpha * worldAlpha;
    context.fillStyle = this.canvasBrush;
    context.fill();
};


/**
 * Sets the brush as a stroke style for the given canvas context
 *
 * @param context {CanvasRenderingContext2D}
 * @param worldAlpha {number}
 */
Brush.prototype.strokeCanvas = function (context, worldAlpha) {
    context.globalAlpha = this.alpha * worldAlpha;
    context.strokeStyle = this.canvasBrush;
    context.stroke();
};

module.exports = Brush;