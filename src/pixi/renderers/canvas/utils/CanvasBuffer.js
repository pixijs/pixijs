/**
 * @author Mat Groves
 * 
 * 
 */

/**
 * Creates a Canvas element of the given size
 *
 * @method CanvasBuffer
 * @param width {Number} the width for the newly created canvas
 * @param height {Number} the height for the newly created canvas
 * @static
 * @private
 */
PIXI.CanvasBuffer = function(width, height)
{
    this.width = width;
    this.height = height;

    this.canvas = document.createElement( "canvas" );
    this.context = this.canvas.getContext( "2d" );

    this.canvas.width = width;
    this.canvas.height = height;
};

/**
 * Clears the canvas that was created by the CanvasBuffer class
 *
 * @method clear
 * @private
 */
PIXI.CanvasBuffer.prototype.clear = function()
{
    this.context.clearRect(0,0, this.width, this.height);
};

/**
 * Resizes the canvas that was created by the CanvasBuffer class to the specified width and height
 *
 * @method resize
 * @param width {Number} the new width of the canvas
 * @param height {Number} the new height of the canvas
 * @private
 */

PIXI.CanvasBuffer.prototype.resize = function(width, height)
{
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
};

