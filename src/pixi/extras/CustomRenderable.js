/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * Need to finalize this a bit more but works! Its in but will be working on this feature properly next..:)
 * @class CustomRenderable 
 * @extends DisplayObject
 * @constructor
 */
PIXI.CustomRenderable = function()
{
	PIXI.DisplayObject.call( this );
	
}

// constructor
PIXI.CustomRenderable.constructor = PIXI.CustomRenderable;
PIXI.CustomRenderable.prototype = Object.create( PIXI.DisplayObject.prototype );

PIXI.CustomRenderable.prototype.renderCanvas = function(renderer)
{
	// override!
}


PIXI.CustomRenderable.prototype.initWebGL = function(renderer)
{
	// override!
}


PIXI.CustomRenderable.prototype.renderWebGL = function(renderGroup, projectionMatrix)
{
	// not sure if both needed? but ya have for now!
	// override!
}

