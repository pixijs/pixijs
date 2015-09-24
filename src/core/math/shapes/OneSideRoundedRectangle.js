/**
 * Created by Marcos on 24/09/2015.
 */
var CONST = require('../../const');

/**
 * The One Side Rounded Rectangle object is an area that has nice rounded corners, as indicated by its top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rounded rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rounded rectangle
 * @param width {number} The overall width of this rounded rectangle
 * @param height {number} The overall height of this rounded rectangle
 * @param radius {number} Controls the radius of the rounded corners
 * @param side {string} Which side is rounded
 */
function OneSideRoundedRectangle(x, y, width, height, radius, side)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * @member {number}
     * @default 20
     */
    this.radius = radius || 20;

    /**
     * @member {string}
     * @default 'top'
     */
    this.side = side || CONST.POSITION.TOP;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.OSRREC;
}

OneSideRoundedRectangle.prototype.constructor = OneSideRoundedRectangle;
module.exports = OneSideRoundedRectangle;

/**
 * Creates a clone of this Rounded Rectangle
 *
 * @return {RoundedRectangle} a copy of the rounded rectangle
 */
OneSideRoundedRectangle.prototype.clone = function ()
{
    return new OneSideRoundedRectangle(this.x, this.y, this.width, this.height, this.radius, this.side);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
 */
OneSideRoundedRectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x <= this.x + this.width)
    {
        if (y >= this.y && y <= this.y + this.height)
        {
            return true;
        }
    }

    return false;
};
