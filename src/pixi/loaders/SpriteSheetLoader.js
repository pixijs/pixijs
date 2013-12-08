/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The sprite sheet loader is used to load in JSON sprite sheet data
 * To generate the data you can use http://www.codeandweb.com/texturepacker and publish the 'JSON' format
 * There is a free version so thats nice, although the paid version is great value for money.
 * It is highly recommended to use Sprite sheets (also know as texture atlas') as it means sprite's can be batched and drawn together for highly increased rendering speed.
 * Once the data has been loaded the frames are stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFromeId()
 * This loader will also load the image file that the Spritesheet points to as well as the data.
 * When loaded this class will dispatch a 'loaded' event
 *
 * @class SpriteSheetLoader
 * @uses EventTarget
 * @constructor
 * @param url {String} The url of the sprite sheet JSON file
 * @param crossorigin {Boolean} Whether requests should be treated as crossorigin
 */
PIXI.SpriteSheetLoader = function (url, crossorigin) {
    /*
     * i use texture packer to load the assets..
     * http://www.codeandweb.com/texturepacker
     * make sure to set the format as 'JSON'
     */
    PIXI.EventTarget.call(this);

    /**
     * The url of the bitmap font data
     *
     * @property url
     * @type String
     */
    this.url = url;

    /**
     * Whether the requests should be treated as cross origin
     *
     * @property crossorigin
     * @type Boolean
     */
    this.crossorigin = crossorigin;

    /**
     * [read-only] The base url of the bitmap font data
     *
     * @property baseUrl
     * @type String
     * @readOnly
     */
    this.baseUrl = url.replace(/[^\/]*$/, '');

    /**
     * The texture being loaded
     *
     * @property texture
     * @type Texture
     */
    this.texture = null;

    /**
     * The frames of the sprite sheet
     *
     * @property frames
     * @type Object
     */
    this.frames = {};
};

// constructor
PIXI.SpriteSheetLoader.prototype.constructor = PIXI.SpriteSheetLoader;

/**
 * This will begin loading the JSON file
 *
 * @method load
 */
PIXI.SpriteSheetLoader.prototype.load = function () {
    var scope = this;
    var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
    jsonLoader.addEventListener('loaded', function (event) {
        scope.json = event.content.json;
        scope.onJSONLoaded();
    });
    jsonLoader.load();
};

/**
 * Invoke when JSON file is loaded
 *
 * @method onJSONLoaded
 * @private
 */
PIXI.SpriteSheetLoader.prototype.onJSONLoaded = function () {
    var scope = this;
    var textureUrl = this.baseUrl + this.json.meta.image;
    var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
    var frameData = this.json.frames;

    this.texture = image.texture.baseTexture;
    image.addEventListener('loaded', function () {
        scope.onLoaded();
    });

    for (var i in frameData) {
        var rect = frameData[i].frame;
        if (rect) {
            PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {
                x: rect.x,
                y: rect.y,
                width: rect.w,
                height: rect.h
            });
            if (frameData[i].trimmed) {
                //var realSize = frameData[i].spriteSourceSize;
                PIXI.TextureCache[i].realSize = frameData[i].spriteSourceSize;
                PIXI.TextureCache[i].trim.x = 0; // (realSize.x / rect.w)
                // calculate the offset!
            }
        }
    }

    image.load();
};

/**
 * Invoke when all files are loaded (json and texture)
 *
 * @method onLoaded
 * @private
 */
PIXI.SpriteSheetLoader.prototype.onLoaded = function () {
    this.dispatchEvent({
        type: 'loaded',
        content: this
    });
};
