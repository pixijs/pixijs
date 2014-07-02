/**
 * @author Chad Engler <chad@pantherdev.com>
 */

/**
 * The Circle object can be used to specify a hit area for displayObjects
 *
 * @class Circle
 * @constructor
 * @param x {Number} The X coordinate of the center of this circle
 * @param y {Number} The Y coordinate of the center of this circle
 * @param radius {Number} The radius of the circle
 */
PIXI.Circle = function(x, y, radius)
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
     * @property radius
     * @type Number
     * @default 0
     */
    this.radius = radius || 0;
};

/**
 * Creates a clone of this Circle instance
 *
 * @method clone
 * @return {Circle} a copy of the polygon
 */
PIXI.Circle.prototype.clone = function()
{
    return new PIXI.Circle(this.x, this.y, this.radius);
};

/**
 * Checks whether the x, and y coordinates passed to this function are contained within this circle
 *
 * @method contains
 * @param x {Number} The X coordinate of the point to test
 * @param y {Number} The Y coordinate of the point to test
 * @return {Boolean} Whether the x/y coordinates are within this polygon
 */
PIXI.Circle.prototype.contains = function(x, y)
{
    if(this.radius <= 0)
        return false;

    var dx = (this.x - x),
        dy = (this.y - y),
        r2 = this.radius * this.radius;

    dx *= dx;
    dy *= dy;

    return (dx + dy <= r2);
};

/**
* Returns the framing rectangle of the circle as a PIXI.Rectangle object
*
* @method getBounds
* @return {Rectangle} the framing rectangle
*/
PIXI.Circle.prototype.getBounds = function()
{
    return new PIXI.Rectangle(this.x - this.radius, this.y - this.radius, this.width, this.height);
};

// constructor
PIXI.Circle.prototype.constructor = PIXI.Circle;

