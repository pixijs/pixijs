var Brush = require('./Brush');

/**
 * A Simple single-color brush.
 *
 * @class
 * @memberof PIXI
 */
function SolidBrush(color, alpha)
{
    Brush.call(this, color, alpha);

    /**
     * @member {number} Tinted color of this brush is cached here, used by CanvasGraphics
     */
    this.tint = color;
}

SolidBrush.prototype = Object.create(Brush.prototype);
SolidBrush.prototype.constructor = SolidBrush;

Object.defineProperties(SolidBrush.prototype, {
    /**
     * Returns the value that can be assigned to a context.fillStyle of StrokeStyle
     *
     * @member {string}
     */
    canvasBrush: {
        get: function ()
        {
            if (!this._canvasBrush)
            {
                this._canvasBrush = '#' + ('00000' + (this.tint | 0).toString(16)).substr(-6);
            }
            return this._canvasBrush;
        }
    }
});

module.exports = SolidBrush;