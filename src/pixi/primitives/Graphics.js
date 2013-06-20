/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.Graphics = function()
{
	PIXI.DisplayObjectContainer.call( this );
	
	this.renderable = true;
	
	// style - color
	// style - thickness
	// alpha - 
	this.fillAlpha = 1;
	
	this.lineWidth = 2;
	this.lineColor = "#FF0000";
	
	this.graphicsData = [];
	
}

// SOME TYPES:
PIXI.Graphics.POLY = 0;
PIXI.Graphics.RECT = 1;
PIXI.Graphics.CIRC = 2;

// constructor
PIXI.Graphics.constructor = PIXI.Graphics;
PIXI.Graphics.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha)
{
	
	this.lineWidth = lineWidth || 0;
	this.lineColor = color || 0;
	this.lineAlpha = (alpha == undefined) ? 1 : alpha;
	
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, points:[], type:PIXI.Graphics.POLY};
	this.graphicsData.push(this.currentPath);
	
	// TODO store the last position of the line in the current
}


PIXI.Graphics.prototype.moveTo = function(x, y)
{
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, points:[], type:PIXI.Graphics.POLY};
	
	this.currentPath.points.push(x, y);
	
	this.graphicsData.push(this.currentPath);
}

PIXI.Graphics.prototype.lineTo = function(x, y)
{
	this.currentPath.points.push(x, y);
	this.dirty = true;
}

PIXI.Graphics.prototype.beginFill = function(color, alpha)
{
	this.filling = true;
	this.fillColor = color || 0;
	this.fillAlpha = alpha || 1;
}

PIXI.Graphics.prototype.endFill = function()
{
	this.filling = false;
	this.fillColor = null;
	this.fillAlpha = 1;
}

PIXI.Graphics.prototype.updateTransform = function()
{
	if(!this.visible)return;
	PIXI.DisplayObject.prototype.updateTransform.call( this );
}

PIXI.Graphics.prototype.drawRect = function( x, y, width, height )
{
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, 
						points:[x, y, width, height], type:PIXI.Graphics.RECT};
						
	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

PIXI.Graphics.prototype.drawCircle = function( x, y, radius)
{
	this.currentPath = {lineWidth:this.lineWidth, lineColor:this.lineColor, lineAlpha:this.lineAlpha, 
						fillColor:this.fillColor, fillAlpha:this.fillAlpha, fill:this.filling, 
						points:[x, y, radius], type:PIXI.Graphics.CIRC};
						
	this.graphicsData.push(this.currentPath);
	this.dirty = true;
}

PIXI.Graphics.prototype.clear = function()
{
	this.dirty = true;
	this.clearDirty = true;
	this.graphicsData = [];
}
