/**
 * @author Mat Groves http://matgroves.com/
 */

/**
 * The Rounded Rectangle object is an area defined by its position and has nice rounded corners, as indicated by its top-left corner point (x, y) and by its width and its height.
 *
 * @class RoundedRectangle
 * @constructor
 * @param x {Number} The X coordinate of the upper-left corner of the rounded rectangle
 * @param y {Number} The Y coordinate of the upper-left corner of the rounded rectangle
 * @param width {Number} The overall width of this rounded rectangle
 * @param height {Number} The overall height of this rounded rectangle
 * @param radius {Number} Controls the radius of the rounded corners 
 */
PIXI.RoundedRectangle = function(x, y, width, height, radius)
{
    /**
     * @property x
     * @type Number
     * @default 0
     */
    this.x = x || 0;

    /**
     * @property y
     * @type Number
     * @default 0
     */
    this.y = y || 0;

    /**
     * @property width
     * @type Number
     * @default 0
     */
    this.width = width || 0;

    /**
     * @property height
     * @type Number
     * @default 0
     */
    this.height = height || 0;

    /**
     * @property radius
     * @type Number
     * @default 20
     */
    this.radius = radius || 20;

    /**
     * The type of the object, should be one of the Graphics type consts, PIXI.Graphics.RRECT in this case
     * @property type
     * @type Number
     * @default 0
     */
};

/**
 * Creates a clone of this Rounded Rectangle
 *
 * @method clone
 * @return {RoundedRectangle} a copy of the rounded rectangle
 */
PIXI.RoundedRectangle.prototype.clone = function()
{
    return new PIXI.RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
 *
 * @method contains
 * @param x {Number} The X coordinate of the point to test
 * @param y {Number} The Y coordinate of the point to test
 * @return {Boolean} Whether the x/y coordinates are within this Rounded Rectangle
 */
PIXI.RoundedRectangle.prototype.contains = function(x, y)
{
    if(this.width <= 0 || this.height <= 0)
        return false;

    var x1 = this.x;
    if(x >= x1 && x <= x1 + this.width)
    {
        var y1 = this.y;

        if(y >= y1 && y <= y1 + this.height)
        {
            return true;
        }
    }

    return false;
};

// constructor
PIXI.RoundedRectangle.prototype.constructor = PIXI.RoundedRectangle;

