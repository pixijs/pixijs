/**
 * @author Mat Groves http://matgroves.com/
 */
var PIXI = PIXI || {};

/**
 * @class The Point object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
 * @constructor 
 * @param x position of the point
 * @param y position of the point
 * @return A new Rectangle.
 */
PIXI.Point = function(x, y)
{
	this.x = x ? x : 0;
	this.y = y ? y : 0;
}

/** 
 * @return a copy of the point
 */
PIXI.Point.clone = function()
{
	return new PIXI.Point(this.x, this.y);
}

// constructor
PIXI.Point.constructor = PIXI.Point;

