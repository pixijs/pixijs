/**
 * @author Mat Groves http://matgroves.com/
 */
var PIXI = PIXI || {};


/**
 * @class A Class that loads a bunch of images / sprite sheet files. Once the assets have been loaded they are added to the PIXI Texture cache and can be accessed easily through PIXI.Texture.fromFrameId(), PIXI.Texture.fromImage() and PIXI.Sprite.fromImage(), PIXI.Sprite.fromFromeId()
 * @augments PIXI.EventTarget
 * When all items have been loaded this class will dispatch a 'loaded' event
 * As each individual item is loaded this class will dispatch a 'progress' event
 * @constructor
 * 
 * @param an array of image/sprite sheet urls that you would like loaded supported. Supported image formats include "jpeg", "jpg", "png", "gif". Supported sprite sheet data formats only include "JSON" at this time
 * @return A new AssetLoader
 */
PIXI.AssetLoader = function(assetURLs)
{
	PIXI.EventTarget.call( this );
	
	
	/**
	 * The array of asset URLs that are going to be loaded
	 * @type Array
	 */
	this.assetURLs = assetURLs;
	
	this.assets = [];
}

// constructor
PIXI.AssetLoader.constructor = PIXI.AssetLoader;

/**
 * This will begin loading the assets sequentially
 */
PIXI.AssetLoader.prototype.load = function()
{
	this.loadCount = this.assetURLs.length;
	var imageTypes = ["jpeg", "jpg", "png", "gif"];
	
	var spriteSheetTypes = ["json"];
	
	for (var i=0; i < this.assetURLs.length; i++) 
	{
		var filename = this.assetURLs[i];
		var fileType = filename.split('.').pop().toLowerCase();
		// what are we loading?
		var type;
		
		for (var j=0; j < imageTypes.length; j++) 
		{
			if(fileType == imageTypes[j])
			{
				type = "img";
				break;
			}
		}
		
		if(!type)
		{
			for (var j=0; j < spriteSheetTypes.length; j++) 
			{
				if(fileType == spriteSheetTypes[j])
				{
					type = "atlas";
					break;
				}
			}
		}
		
		if(type == "img")
		{
			var texture = PIXI.Texture.fromImage(filename);
			if(!texture.hasLoaded)
			{
				
				var scope = this;
				texture.baseTexture.addEventListener( 'loaded', function ( event ) 
				{
					scope.onAssetLoaded();
				});
	
				this.assets.push(texture);
			}
			else
			{
				
				// already loaded!
				this.loadCount--;
			}
			
		}
		else if(type == "atlas")
		{
			var spriteSheetLoader = new PIXI.SpriteSheetLoader(filename);
			this.assets.push(spriteSheetLoader);
			
			var scope = this;
			spriteSheetLoader.addEventListener( 'loaded', function ( event ) 
			{
				scope.onAssetLoaded();
			});
			
			spriteSheetLoader.load();
		}
		else
		{
			// dont know what the file is! :/
			//this.loadCount--;
			throw new Error(filename + " is an unsupported file type " + this);
		}
		
		//this.assets[i].load();
	};
}

PIXI.AssetLoader.prototype.onAssetLoaded = function()
{
	this.loadCount--;
	this.dispatchEvent( { type: 'progress', content: this } );
	
	if(this.loadCount == 0)
	{
		this.dispatchEvent( { type: 'loaded', content: this } );
	}
}

