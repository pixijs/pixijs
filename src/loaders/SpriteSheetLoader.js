var core = require('../core'),
    JsonLoader = require('./JsonLoader');

/**
 * The sprite sheet loader is used to load in JSON sprite sheet data
 * To generate the data you can use http://www.codeandweb.com/texturepacker and publish in the 'JSON' format
 * There is a free version so thats nice, although the paid version is great value for money.
 * It is highly recommended to use Sprite sheets (also know as a 'texture atlas') as it means sprites can be batched and drawn together for highly increased rendering speed.
 * Once the data has been loaded the frames are stored in the PIXI texture cache and can be accessed though Texture.fromFrameId() and Sprite.fromFrameId()
 * This loader will load the image file that the Spritesheet points to as well as the data.
 * When loaded this class will dispatch a 'loaded' event
 *
 * @class
 * @mixes eventTarget
 * @namespace PIXI
 * @param url {String} The url of the sprite sheet JSON file
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 */
function SpriteSheetLoader(url, crossorigin) {

    /**
     * The url of the atlas data
     *
     * @member {String}
     */
    this.url = url;

    /**
     * Whether the requests should be treated as cross origin
     *
     * @member {boolean}
     */
    this.crossorigin = crossorigin;

    /**
     * The base url of the bitmap font data
     *
     * @member {String}
     * @readOnly
     */
    this.baseUrl = url.replace(/[^\/]*$/, '');

    /**
     * The texture being loaded
     *
     * @member {Texture}
     */
    this.texture = null;

    /**
     * The frames of the sprite sheet
     *
     * @member {object}
     */
    this.frames = {};
}

// constructor
SpriteSheetLoader.prototype.constructor = SpriteSheetLoader;
module.exports = SpriteSheetLoader;

core.utils.eventTarget.mixin(SpriteSheetLoader.prototype);

/**
 * This will begin loading the JSON file
 *
 */
SpriteSheetLoader.prototype.load = function () {
    var scope = this;
    var jsonLoader = new JsonLoader(this.url, this.crossorigin);

    jsonLoader.on('loaded', function (event) {
        scope.json = event.data.content.json;
        scope.onLoaded();
    });

    jsonLoader.load();
};

/**
 * Invoke when all files are loaded (json and texture)
 *
 * @private
 */
SpriteSheetLoader.prototype.onLoaded = function () {
    this.emit('loaded', {
        content: this
    });
};
