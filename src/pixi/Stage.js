/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
A Stage represents the root of the display tree. Everything connected to the stage is rendered
@class Stage
@extends DisplayObjectContainer
@constructor
@param backgroundColor {Number} the background color of the stage
*/
PIXI.Stage = function(backgroundColor)
{
	
	PIXI.DisplayObjectContainer.call( this );
	this.worldTransform = mat3.identity();
	this.__childrenAdded = [];
	this.__childrenRemoved = [];
	this.childIndex = 0;
	this.stage=  this;
	
	this.setBackgroundColor(backgroundColor);
}

// constructor
PIXI.Stage.constructor = PIXI.Stage;

PIXI.Stage.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

/**
@method updateTransform
@internal
*/
PIXI.Stage.prototype.updateTransform = function()
{
	this.worldAlpha = 1;		

	for(var i=0,j=this.children.length; i<j; i++)
	{
		this.children[i].updateTransform();	
	}
}

/**
 * @method setBackgroundColor
 * @param backgroundColor {Number}
 */
PIXI.Stage.prototype.setBackgroundColor = function(backgroundColor)
{
	this.backgroundColor = backgroundColor ? backgroundColor : 0x000000;
	this.backgroundColorSplit = HEXtoRGB(this.backgroundColor);
	this.backgroundColorString =  "#" + this.backgroundColor.toString(16);
}

PIXI.Stage.prototype.__addChild = function(child)
{
	//this.__childrenAdded.push(child);

	child.stage = this;
	
	if(child.children)
	{
		for (var i=0; i < child.children.length; i++) 
		{
		  	this.__addChild(child.children[i]);
		};
	}
	
}


PIXI.Stage.prototype.__removeChild = function(child)
{
	this.__childrenRemoved.push(child);

	child.stage = undefined;
	
	if(child.children)
	{
		for(var i=0,j=child.children.length; i<j; i++)
		{
		  	this.__removeChild(child.children[i])
		}
	}
}
