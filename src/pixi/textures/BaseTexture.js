/**
 * @author Mat Groves http://matgroves.com/
 */

PIXI.BaseTextureCache = {};
PIXI.texturesToUpdate = [];

/**
 * A texture stores the information that represents an image. All textures have a base texture
 * @class BaseTexture
 * @extends EventTarget
 * @constructor
 * @param imageUrl {String} image url
 */
PIXI.BaseTexture = function(imageUrl)
{
	PIXI.EventTarget.call( this );
	
	/**
	 * The url of the texture
	 * @property imageUrl
	 * @type String
	 */
	this.imageUrl = imageUrl;
	
	/**
	 * The html image that is loaded to create the texture
	 * @property image
	 * @type Image
	 */
	this.image = new Image();
	
	var scope = this
	this.image.onload = function(){
		
		scope.hasLoaded = true;
		scope.width = scope.image.width;
		scope.height = scope.image.height;
	
		// add it to somewhere...
		PIXI.texturesToUpdate.push(scope);
		scope.dispatchEvent( { type: 'loaded', content: scope } );
	}
		
	$.proxy(this.onImageLoaded, this);
	this.image.src = imageUrl;
	
	/**
	 * [read only] The width of the base texture set when the image has loaded
	 * @property width
	 * @type Number
	 */
	this.width = 100;
	/**
	 * [read only] The height of the base texture set when the image has loaded
	 * @property height
	 * @type Number
	 */
	this.height = 100;
	
	
	PIXI.BaseTextureCache[imageUrl] = this;
}

PIXI.BaseTexture.constructor = PIXI.BaseTexture;
/*
PIXI.BaseTexture.prototype.onImageLoaded = function(image)
{

}*/
