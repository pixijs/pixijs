/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
 *
 * @class Point
 * @constructor
 * @param x {Number} position of the point
 * @param y {Number} position of the point
 */
PIXI.Point = function(x, y)
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
};

/**
 * Creates a clone of this point
 *
 * @method clone
 * @return {Point} a copy of the point
 */
PIXI.Point.prototype.clone = function()
{
    return new PIXI.Point(this.x, this.y);
};

/**
 *
 * Subtracts given (Point/Vector) from the point
 *
 * @method sub
 * @param B {Point} (Point/Vector) to do element wise subtraction
 * @return {Point} A new Point resultant of the subtraction of B
 */
PIXI.Point.prototype.sub = function (B)
{
	return new PIXI.Point(this.x - B.x,this.y - B.y);
};

/**
 *
 * Adds given (Point/Vector) to the point
 *
 * @method add
 * @param B {Point} (Point/Vector) to do element wise addition
 * @return {Point} A new Point resultant of the addition of B
 */
PIXI.Point.prototype.add = function (B)
{
	return new PIXI.Point(this.x + B.x,this.y + B.y);
};

/**
 *
 * Multiplies given (Point/Vector) with the point
 *
 * @method mul
 * @param B {Scalar} Number to do element wise multiplication
 * @return {Point} A new Point resultant of the multiplication of B
 */
PIXI.Point.prototype.mul = function (B)
{
	return new PIXI.Point(this.x * B,this.y * B);
};

/**
 *
 * Divides given (Point/Vector) from the point
 *
 * @method div
 * @param B {Scalar} Number to do element wise division
 * @return {Point} A new Point resultant of the division of B
 */
PIXI.Point.prototype.div = function (B)
{
	return new PIXI.Point(this.x / B,this.y / B);
};

/**
 *
 * Dot Product of the given (Point/Vector) and the point
 *
 * @method dot
 * @param B {Point} (Point/Vector) to project along
 * @return {Scalar} Number resultant of the projection onto B
 */
PIXI.Point.prototype.dot = function (B)
{
	return (this.x*B.x)+(this.y*B.y);
};

/**
 *
 * Magnitude of the point
 *
 * @method magnitude
 * @return {Scalar} Number equivelant to the scalar length of the point
 */
PIXI.Point.prototype.magnitude = function()
{
	return Math.sqrt(this.x^2 + this.y^2);
};

/**
 *
 * Unit (Point/Vector) of the point
 *
 * @method unit
 * @return {Point} A new Point with a length(magnitude) of one
 */
PIXI.Point.prototype.unit = function()
{
	return this.Div(this.Magnitude());
};

// constructor
PIXI.Point.prototype.constructor = PIXI.Point;

