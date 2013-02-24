/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The sprite sheet loader is used to load in JSON sprite sheet data
 * To generate the data you can use http://www.codeandweb.com/texturepacker and publish the "JSON" format
 * There is a free version so thats nice, although the paid version is great value for money.
 * It is highly recommended to use Sprite sheets (also know as texture atlas') as it means sprite's can be batched and drawn together for highly increased rendering speed.
 * Once the data has been loaded the frames are stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFromeId()
 * This loader will also load the image file that the Spritesheet points to as well as the data.
 * When loaded this class will dispatch a 'loaded' event
 * @class SpriteSheetLoader
 * @extends EventTarget
 * @constructor
 * @param url {String} the url of the sprite sheet JSON file
 */

PIXI.SpriteSheetLoader = function(url)
{
	/*
	 * i use texture packer to load the assets..
	 * http://www.codeandweb.com/texturepacker
	 * make sure to set the format as "JSON"
	 */
	PIXI.EventTarget.call( this );
	this.url = url;
	this.baseUrl = url.replace(/[^\/]*$/, '');
	this.texture;
	this.frames = {};	
}

// constructor
PIXI.SpriteSheetLoader.constructor = PIXI.SpriteSheetLoader;

/**
 * This will begin loading the JSON file
 */
PIXI.SpriteSheetLoader.prototype.load = function()
{
	this.ajaxRequest = new AjaxRequest();
	var scope = this;
	this.ajaxRequest.onreadystatechange=function()
	{
		scope.onLoaded();
	}
		
	this.ajaxRequest.open("GET", this.url, true)
	this.ajaxRequest.send(null)
}

PIXI.SpriteSheetLoader.prototype.onLoaded = function()
{
	if (this.ajaxRequest.readyState==4)
	{
		 if (this.ajaxRequest.status==200 || window.location.href.indexOf("http")==-1)
	 	{
			var jsondata = eval("("+this.ajaxRequest.responseText+")");
			
			var textureUrl = this.baseUrl + jsondata.meta.image;
			
			this.texture = PIXI.Texture.fromImage(textureUrl).baseTexture;
			
		//	if(!this.texture)this.texture = new PIXI.Texture(textureUrl);
			
			var frameData = jsondata.frames;
			for (var i in frameData) 
			{
				var rect = frameData[i].frame;
				PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {x:rect.x, y:rect.y, width:rect.w, height:rect.h});
				
				if(frameData[i].trimmed)
				{
					//var realSize = frameData[i].spriteSourceSize;
					PIXI.TextureCache[i].realSize = frameData[i].spriteSourceSize;
					PIXI.TextureCache[i].trim.x = 0// (realSize.x / rect.w)
					// calculate the offset!
				}
//				this.frames[i] = ;
   			}
			
			if(this.texture.hasLoaded)
			{
				this.dispatchEvent( { type: 'loaded', content: this } );
			}
			else
			{
				var scope = this;
				// wait for the texture to load..
				this.texture.addEventListener('loaded', function(){
					
					scope.dispatchEvent( { type: 'loaded', content: scope } );
					
				});
			}
	 	}
	}
	
}

