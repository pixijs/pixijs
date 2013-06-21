/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * The Graphics class contains a set of methods that you can use to create a primitive shapes and lines. 
 * @class Graphics 
 * @extends DisplayObjectContainer
 * @constructor
 */
PIXI.Graphics = function()
{
	PIXI.DisplayObjectContainer.call( this );
	
	this.renderable = true;
	
	this.fillAlpha = 1;
	
	this.lineWidth = 2;
	this.lineColor = "#FF0000";
	
	this.graphicsData = [];
	
}

// constructor
PIXI.Graphics.constructor = PIXI.Graphics;
PIXI.Graphics.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

/**
 * @method lineStyle
 * @param lineWidth {Number}
 * @param color {Number}
 * @param alpha {Number}
 */
PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha)
{
	this.lineWidth = lineWidth || 0;
	this.lineColor = color || 0;
	this.lineAlpha = (alpha == undefined) ? 1 : alpha;
	
	this.currentPath = this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};
	
	this.graphicsData.push(this.currentPath);
}

/**
 * @method moveTo
 * @param x {Number}
 * @param y {Number}
 */
PIXI.Graphics.prototype.moveTo = function(x, y)
{
	this.currentPath = this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, points:[], type:PIXI.Graphics.POLY};
	
	// {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, points:[], type:PIXI.Graphics.POLY};
	
	this.currentPath.points.push(x, y);
	
	this.graphicsData.push(this.currentPath);
}

/**
 * @method lineTo
 * @param x {Number}
 * @param y {Number}
 */
PIXI.Graphics.prototype.lineTo = function(x, y)
{
	this.currentPath.points.push(x, y);
	this.dirty = true;
}

/**
 * @method beginFill
 * @param color {Number}
 * @param alpha {Number}
 */
PIXI.Graphics.prototype.beginFill = function(color, alpha)
{
	this.filling = true;
	this.fillColor = color || 0;
	this.fillAlpha = alpha || 1;
}

/**
 * @method endFill
 */
PIXI.Graphics.prototype.endFill = function()
{
	this.filling = false;
	this.fillColor = null;
	this.fillAlpha = 1;
}

/**
 * @method drawRect
 * @param x {Number}
 * @param y {Number}
 * @param width {Number}
 * @param height {Number}
 */
PIXI.Graphics.prototype.drawRect = function( x, y, width, height )
{
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, 
						points:[x, y, width, height], type:PIXI.Graphics.RECT};
						
	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

/**
 * @method drawCircle
 * @param x {Number}
 * @param y {Number}
 * @param radius {Number}
 */
PIXI.Graphics.prototype.drawCircle = function( x, y, radius)
{
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, 
						points:[x, y, radius, radius], type:PIXI.Graphics.CIRC};
						
	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

/**
 * @method drawElipse
 * @param x {Number}
 * @param y {Number}
 * @param width {Number}
 * @param height {Number}
 */
PIXI.Graphics.prototype.drawElipse = function( x, y, width, height)
{
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, 
						points:[x, y, width, height], type:PIXI.Graphics.ELIP};
						
	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

/**
 * @method clear
 */
PIXI.Graphics.prototype.clear = function()
{
	this.dirty = true;
	this.clearDirty = true;
	this.graphicsData = [];
}

// SOME TYPES:
PIXI.Graphics.POLY = 0;
PIXI.Graphics.RECT = 1;
PIXI.Graphics.CIRC = 2;
PIXI.Graphics.ELIP = 3;
