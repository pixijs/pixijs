/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.Line = function()
{
	PIXI.DisplayObject.call( this );
	
	// style - color
	// style - thickness
	// alpha - 
}

// constructor
PIXI.Line.constructor = PIXI.Line;
PIXI.Line.prototype = Object.create( PIXI.DisplayObject.prototype );




/**
 * @private
 */
PIXI.DisplayObjectContainer.prototype.updateTransform = function()
{
	if(!this.visible)return;
	
	PIXI.DisplayObject.prototype.updateTransform.call( this );
	
}
