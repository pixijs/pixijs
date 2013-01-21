/**
 * @author Mat Groves http://matgroves.com/
 */
var PIXI = PIXI || {};

/**
 * @class the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 * @constructor 
 * @param x position of the rectangle
 * @param y position of the rectangle
 * @param width of the rectangle
 * @param height of the rectangle
 * @return A new Rectangle.
 */
PIXI.Rectangle = function(x, y, width, height)
{
	this.x = x ? x : 0;
	this.y = y ? y : 0;
	
	this.width = width ? width : 0;
	this.height = height ? height : 0;
}

/** 
 * @return a copy of the rectangle
 */
PIXI.Point.clone = function()
{
	return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
}

// constructor
PIXI.Rectangle.constructor = PIXI.Rectangle;

