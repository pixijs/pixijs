/**
 * @author Mat Groves http://matgroves.com/
 */
var PIXI = PIXI || {};

PIXI.TextureCache = {};
PIXI.FrameCache = {};

/**
 * @class A texture stores the information that represents an image or part of an image. It cannot be added to the display list directly. To do this use PIXI.Sprite. If no frame is provided then the whole image is used
 * @augments PIXI.EventTarget
 * @constructor
 * @param {PIXI.textures.BaseTexture} base texture {@link PIXI.textures.BaseTexture}
 * @param {PIXI.Rectangle} frame {@link PIXI.Rectangle}
 * @return A new Texture.
 */
PIXI.Texture = function(baseTexture, frame)
{
	PIXI.EventTarget.call( this );
	
	if(!frame)
	{
		this.noFrame = true;
		frame = new PIXI.Rectangle(0,0,1,1);
	}
	
	/**
	 * The base texture of this texture
	 * @type #BaseTexture
	 */
	this.baseTexture = baseTexture;
	
	
	
	/**
	 * The frame specifies the region of the base texture that this texture uses
	 * @type #Rectangle
	 */
	this.frame = frame;
	
	
	
	this.scope = this;
	
	if(baseTexture.hasLoaded)
	{
		if(!frame)frame = new PIXI.Rectangle(0,0, baseTexture.width, baseTexture.height);
		this.setFrame(frame);
	}
	else
	{
		var scope = this;
		baseTexture.addEventListener( 'loaded', function(){ scope.onBaseTextureLoaded()} );
	}
}

PIXI.Texture.constructor = PIXI.Texture;

PIXI.Texture.prototype.onBaseTextureLoaded = function(event)
{
	var baseTexture = this.baseTexture;
	baseTexture.removeEventListener( 'loaded', this.onLoaded );
	
	if(this.noFrame)this.frame = new PIXI.Rectangle(0,0, baseTexture.width, baseTexture.height);
	this.noFrame = false;
	this.width = this.frame.width;
	this.height = this.frame.height;
	
	this.scope.dispatchEvent( { type: 'update', content: this } );
}

/**
 * Specifies the rectangle region of the baseTexture
 * @param {PIXI.Rectangle} frame {@link PIXI.Rectangle}
 * @return A new Texture.
 */
PIXI.Texture.prototype.setFrame = function(frame)
{
	this.frame = frame;
	this.width = frame.width;
	this.height = frame.height;
	//this.updateFrame = true;
}

/**
 * 
 * Helper function that returns a texture based on an image url
 * If the image is not in the texture cache it will be  created and loaded
 * @param The image url of the texture
 * @return {PIXI.textures.Texture} texture {@link PIXI.textures.Texture}
 */
PIXI.Texture.fromImage = function(imageUrl)
{
	var texture = PIXI.TextureCache[imageUrl];
	
	if(!texture)
	{
		var baseTexture = PIXI.BaseTextureCache[imageUrl];
		if(!baseTexture) baseTexture = new PIXI.BaseTexture(imageUrl);
		texture = new PIXI.Texture(baseTexture);
		PIXI.TextureCache[imageUrl] = texture;
	}
	
	return texture;
}

/**
 * 
 * Helper function that returns a texture based on a frame id
 * If the frame id is not in the texture cache an error will be thrown
 * @param The frame id of the texture
 * @return {PIXI.textures.Texture} texture {@link PIXI.textures.Texture}
 */
PIXI.Texture.fromFrameId = function(frameId)
{
	var texture = PIXI.TextureCache[frameId];
	if(!texture)throw new Error("The frameId '"+ frameId +"' does not exist in the texture cache" + this);
	return texture;
}

/**
 * 
 * Adds a texture to the textureCache. 
 * @param {PIXI.textures.Texture} texture {@link PIXI.textures.Texture}
 * @param the id that the texture will be stored against.
 */
PIXI.Texture.addTextureToCache = function(texture, id)
{
	PIXI.TextureCache[id] = texture;
}

/**
 * 
 * Remove a texture from the textureCache. 
 * @param the id of the texture to be removed
 */
PIXI.Texture.addTextureToCache = function(id)
{
	PIXI.TextureCache[id] = texture;
}

