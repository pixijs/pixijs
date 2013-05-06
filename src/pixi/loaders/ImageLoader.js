/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The image loader class is responsible for loading images file formats ("jpeg", "jpg", "png" and "gif")
 * Once the image has been loaded it is stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFromeId()
 * When loaded this class will dispatch a 'loaded' event
 * @class ImageLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url The url of the image
 * @param {Boolean} crossorigin
 */
PIXI.ImageLoader = function(url, crossorigin)
{
    PIXI.EventTarget.call(this);
    this.texture = PIXI.Texture.fromImage(url, crossorigin);
};

// constructor
PIXI.ImageLoader.constructor = PIXI.ImageLoader;

/**
 * Loads image or takes it from cache
 */
PIXI.ImageLoader.prototype.load = function()
{
    if(!this.texture.baseTexture.hasLoaded)
    {
        var scope = this;
        this.texture.baseTexture.addEventListener("loaded", function()
        {
            scope.onLoaded();
        });
    }
    else
    {
        this.onLoaded();
    }
};

/**
 * Invoked when image file is loaded or it is already cached and ready to use
 * @private
 */
PIXI.ImageLoader.prototype.onLoaded = function()
{
    this.dispatchEvent({type: "loaded", content: this});
};
