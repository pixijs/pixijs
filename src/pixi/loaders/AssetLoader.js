/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Class that loads a bunch of images / sprite sheet / bitmap font files. Once the assets have been loaded they are added to the PIXI Texture cache and can be accessed easily through PIXI.Texture.fromImage() and PIXI.Sprite.fromImage()
 * When all items have been loaded this class will dispatch a "onLoaded" event
 * As each individual item is loaded this class will dispatch a "onProgress" event
 * @class AssetLoader
 * @constructor
 * @extends EventTarget
 * @param {Array} assetURLs an array of image/sprite sheet urls that you would like loaded supported. Supported image formats include "jpeg", "jpg", "png", "gif". Supported sprite sheet data formats only include "JSON" at this time. Supported bitmap font data formats include "xml" and "fnt".
 */
PIXI.AssetLoader = function(assetURLs)
{
	PIXI.EventTarget.call(this);
	
	/**
	 * The array of asset URLs that are going to be loaded
	 * @property assetURLs
	 * @type Array
	 */
	this.assetURLs = assetURLs;

	this.crossorigin = false;
};

/**
Fired when an item has loaded
@event onProgress
**/

/**
Fired when all the assets have loaded
@event onComplete 
**/

// constructor
PIXI.AssetLoader.constructor = PIXI.AssetLoader;

/**
 * This will begin loading the assets sequentially
 */
PIXI.AssetLoader.prototype.load = function()
{
    var scope = this;

	this.loadCount = this.assetURLs.length;

    for (var i=0; i < this.assetURLs.length; i++)
	{
		var fileName = this.assetURLs[i];
		var fileType = fileName.split(".").pop().toLowerCase();

        var loaderClass = this.getLoaderByFileType(fileType);

        var loader = new loaderClass(fileName, this.crossorigin);

        loader.addEventListener("loaded", function()
        {
            scope.onAssetLoaded();
        });
        loader.load();
	}
};

/**
 * Factory method for getting loader class based on extension
 * @private
 * @param {String} fileType An extension of the file based on which the loader class will be returned
 * @return {Class} The loader class
 */
PIXI.AssetLoader.prototype.getLoaderByFileType = function(fileType)
{
    switch (fileType)
    {
        case "jpeg":
        case "jpg":
        case "png":
        case "gif":
            return PIXI.ImageLoader;

        case "json":
            return PIXI.SpriteSheetLoader;

        case "xml":
        case "fnt":
            return PIXI.XMLLoader;
    }
    throw new Error(fileType + " is an unsupported file type " + this);
};

/**
 * Invoked after each file is loaded
 * @private
 */
PIXI.AssetLoader.prototype.onAssetLoaded = function()
{
    this.loadCount--;
	this.dispatchEvent({type: "onProgress", content: this});
	if(this.onProgress) this.onProgress();
	
	if(this.loadCount == 0)
	{
		this.dispatchEvent({type: "onComplete", content: this});
		if(this.onComplete) this.onComplete();
	}
};

