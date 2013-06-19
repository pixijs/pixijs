/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.BaseTextureCache = {};
PIXI.texturesToUpdate = [];
PIXI.texturesToDestroy = [];

/**
 * A texture stores the information that represents an image. All textures have a base texture
 * @class BaseTexture
 * @extends EventTarget
 * @constructor
 * @param source {String} the source object (image or canvas)
 */
PIXI.BaseTexture = function(source)
{
	PIXI.EventTarget.call( this );
	
	/*
	 * The url of the texture
	 * @property imageUrl
	 * @type String
	 */
	//this.imageUrl = source.src;
	
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
	
	/**
	 * The source that is loaded to create the texture
	 * @property source
	 * @type Image
	 */
	this.source = source//new Image();
	
	if(!source)return;
	
	if(this.source instanceof Image)
	{
		if(this.source.complete)
		{
			this.hasLoaded = true;
			this.width = this.source.width;
			this.height = this.source.height;
			
			PIXI.texturesToUpdate.push(this);
		}
		else
		{
			
			var scope = this;
			this.source.onload = function(){
				
				scope.hasLoaded = true;
				scope.width = scope.source.width;
				scope.height = scope.source.height;
			
				// add it to somewhere...
				PIXI.texturesToUpdate.push(scope);
				scope.dispatchEvent( { type: 'loaded', content: scope } );
			}
			//	this.image.src = imageUrl;
		}
	}
	else
	{
		this.hasLoaded = true;
		this.width = this.source.width;
		this.height = this.source.height;
			
		PIXI.texturesToUpdate.push(this);
	}
	
	this._powerOf2 = false;
	
}

PIXI.BaseTexture.constructor = PIXI.BaseTexture;

PIXI.BaseTexture.prototype.destroy = function()
{
	if(this.source instanceof Image)
	{
		this.source.src = null;
	}
	this.source = null;
	PIXI.texturesToDestroy.push(this);
}

/**
 * 
 * Helper function that returns a base texture based on an image url
 * If the image is not in the base texture cache it will be  created and loaded
 * @static
 * @method fromImage
 * @param imageUrl {String} The image url of the texture
 * @return BaseTexture
 */
PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin)
{
	var baseTexture = PIXI.BaseTextureCache[imageUrl];
	if(!baseTexture)
	{
		// new Image() breaks tex loading in some versions of Chrome.
		// See https://code.google.com/p/chromium/issues/detail?id=238071
		var image = new Image();//document.createElement('img'); 
		if (crossorigin)
		{
			image.crossOrigin = '';
		}
		image.src = imageUrl;
		baseTexture = new PIXI.BaseTexture(image);
		PIXI.BaseTextureCache[imageUrl] = baseTexture;
	}

	return baseTexture;
}
