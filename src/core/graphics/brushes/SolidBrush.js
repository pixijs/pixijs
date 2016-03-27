var Brush = require('./Brush'),
    utils = require('../../utils');

/**
 * A Simple single-color brush.
 *
 * @class
 * @extends Brush
 * @param color {Number} The color of the brush
 * @param alpha {Number} The alpha of the brush
 * @memberof PIXI
 */
function SolidBrush(color, alpha)
{
    Brush.call(this, color, alpha);

    /**
     * @member {String} the value that can be assigned to a context.fillStyle of StrokeStyle
     * @private
     */
    this._canvasBrush = null;
}

SolidBrush.prototype = Object.create(Brush.prototype);
SolidBrush.prototype.constructor = SolidBrush;


/*
 * Generates _canvasBrush based on the tint color
 *
 * @param tint {Number} the tint color
 */
SolidBrush.prototype.setTint = function (tint)
{
    var tintRGB = utils.hex2rgb(tint),
        r = ((this.color >> 16 & 0xFF) * tintRGB[0] + 0.5) | 0,
        g = ((this.color >> 8 & 0xFF)  * tintRGB[1] + 0.5) | 0,
        b = ((this.color & 0xFF)       * tintRGB[2] + 0.5) | 0;

    this._canvasBrush = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + this.alpha.toFixed(3) + ')';
};

/**
 * Sets the brush as a fill style for the given canvas context
 *
 * @param context {CanvasRenderingContext2D}
 * @param worldAlpha {number}
 */
SolidBrush.prototype.fillCanvas = function (context)
{
    context.fillStyle = this._canvasBrush;
    context.fill();
};


/**
 * Sets the brush as a stroke style for the given canvas context
 *
 * @param context {CanvasRenderingContext2D}
 * @param worldAlpha {number}
 */
SolidBrush.prototype.strokeCanvas = function (context)
{
    context.strokeStyle = this._canvasBrush;
    context.stroke();
};

module.exports = SolidBrush;