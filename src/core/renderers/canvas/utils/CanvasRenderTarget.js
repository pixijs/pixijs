var CONST = require('../../../const');

/**
 * Creates a Canvas element of the given size.
 *
 * @class
 * @memberof PIXI
 * @param width {number} the width for the newly created canvas
 * @param height {number} the height for the newly created canvas
 * @param [resolution=CONST.RESOLUTION] The resolution of the canvas
 */
function CanvasRenderTarget(width, height, resolution)
{
    /**
     * The Canvas object that belongs to this CanvasRenderTarget.
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d');

    this.resolution = resolution || CONST.RESOLUTION;

    this.resize(width, height);
}

CanvasRenderTarget.prototype.constructor = CanvasRenderTarget;
module.exports = CanvasRenderTarget;

Object.defineProperties(CanvasRenderTarget.prototype, {
    /**
     * The width of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasRenderTarget#
     */
    width: {
        get: function ()
        {
            return this.canvas.width;
        },
        set: function (val)
        {
            this.canvas.width = val;
        }
    },
    /**
     * The height of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasRenderTarget#
     */
    height: {
        get: function ()
        {
            return this.canvas.height;
        },
        set: function (val)
        {
            this.canvas.height = val;
        }
    }
});

/**
 * Clears the canvas that was created by the CanvasRenderTarget class.
 *
 * @private
 */
CanvasRenderTarget.prototype.clear = function ()
{
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
};

/**
 * Resizes the canvas to the specified width and height.
 *
 * @param width {number} the new width of the canvas
 * @param height {number} the new height of the canvas
 */
CanvasRenderTarget.prototype.resize = function (width, height)
{

    this.canvas.width = width * this.resolution;
    this.canvas.height = height * this.resolution;
};

/**
 * Destroys this canvas.
 *
 */
CanvasRenderTarget.prototype.destroy = function ()
{
    this.context = null;
    this.canvas = null;
};
