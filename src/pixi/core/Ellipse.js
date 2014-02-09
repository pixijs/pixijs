/**
 * @author Chad Engler <chad@pantherdev.com>
 */

/**
 * The Ellipse object can be used to specify a hit area for displayObjects
 *
 * @class Ellipse
 * @constructor
 * @param x {Number} The X coordinate of the upper-left corner of the framing rectangle of this ellipse
 * @param y {Number} The Y coordinate of the upper-left corner of the framing rectangle of this ellipse
 * @param width {Number} The overall width of this ellipse
 * @param height {Number} The overall height of this ellipse
 */
PIXI.Ellipse = function(x, y, width, height)
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
};

/**
 * Creates a clone of this Ellipse instance
 *
 * @method clone
 * @return {Ellipse} a copy of the ellipse
 */
PIXI.Ellipse.prototype.clone = function()
{
    return new PIXI.Ellipse(this.x, this.y, this.width, this.height);
};

/**
 * Checks whether the x and y coordinates passed to this function are contained within this ellipse
 *
 * @method contains
 * @param x {Number} The X coordinate of the point to test
 * @param y {Number} The Y coordinate of the point to test
 * @return {Boolean} Whether the x/y coords are within this ellipse
 */
PIXI.Ellipse.prototype.contains = function(x, y)
{
    if(this.width <= 0 || this.height <= 0)
        return false;

    //normalize the coords to an ellipse with center 0,0
    var normx = ((x - this.x) / this.width),
        normy = ((y - this.y) / this.height);

    normx *= normx;
    normy *= normy;

    return (normx + normy <= 1);
};

/**
* Returns the framing rectangle of the ellipse as a PIXI.Rectangle object
*
* @method getBounds
* @return {Rectangle} the framing rectangle
*/
PIXI.Ellipse.prototype.getBounds = function()
{
    return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
};

// constructor
PIXI.Ellipse.prototype.constructor = PIXI.Ellipse;
