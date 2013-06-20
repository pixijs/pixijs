/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
A Stage represents the root of the display tree. Everything connected to the stage is rendered
@class Stage
@extends DisplayObjectContainer
@constructor
@param backgroundColor {Number} the background color of the stage
@param interactive {Boolean} enable / disable interaction (default is false)
*/
PIXI.Stage = function(backgroundColor, interactive)
{
	
	PIXI.DisplayObjectContainer.call( this );
	this.worldTransform = PIXI.mat3.create()
	this.__childrenAdded = [];
	this.__childrenRemoved = [];
	this.childIndex = 0;
	this.stage= this;
	
	this.stage.hitArea = new PIXI.Rectangle(0,0,100000, 100000);
	
	// interaction!
	this.interactive = !!interactive;
	this.interactionManager = new PIXI.InteractionManager(this);
	
	this.setBackgroundColor(backgroundColor);
	this.worldVisible = true;
	
	this.stage.dirty = true;
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
	
	if(this.dirty)
	{
		this.dirty = false;
		// update interactive!
		this.interactionManager.dirty = true;
	}

	if(this.interactive)this.interactionManager.update();
}

/**
 * @method setBackgroundColor
 * @param backgroundColor {Number}
 */
PIXI.Stage.prototype.setBackgroundColor = function(backgroundColor)
{
	this.backgroundColor = backgroundColor || 0x000000;
	this.backgroundColorSplit = HEXtoRGB(this.backgroundColor);
	var hex = this.backgroundColor.toString(16);
	hex = "000000".substr(0, 6 - hex.length) + hex;
	this.backgroundColorString = "#" + hex;
}

/**
 * This will return the point containing global coords of the mouse.
 * @method getMousePosition
 * @return {Point} The point containing the coords of the global InteractionData position.
 */
PIXI.Stage.prototype.getMousePosition = function()
{
	return this.interactionManager.mouse.global;
}

PIXI.Stage.prototype.__addChild = function(child)
{
	if(child.interactive)this.dirty = true;
	
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
	if(child.interactive)this.dirty = true;
	
	child.stage = undefined;
	
	if(child.children)
	{
		for(var i=0,j=child.children.length; i<j; i++)
		{
		  	this.__removeChild(child.children[i]);
		}
	}
}
