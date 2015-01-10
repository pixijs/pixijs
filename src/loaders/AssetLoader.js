var core = require('../core'),
    ImageLoader = require('./ImageLoader'),
    JsonLoader = require('./JsonLoader'),
    AtlasLoader = require('./AtlasLoader'),
    SpineLoader = require('./SpineLoader'),
    BitmapFontLoader = require('./BitmapFontLoader');

/**
 * A Class that loads a bunch of images / sprite sheet / bitmap font files. Once the
 * assets have been loaded they are added to the PIXI Texture cache and can be accessed
 * easily through Texture.fromImage() and Sprite.fromImage()
 * When all items have been loaded this class will dispatch a 'onLoaded' event
 * As each individual item is loaded this class will dispatch a 'onProgress' event
 *
 * @class
 * @namespace PIXI
 * @mixes eventTarget
 * @param assetURLs {string[]} An array of image/sprite sheet urls that you would like loaded
 *      supported. Supported image formats include 'jpeg', 'jpg', 'png', 'gif'. Supported
 *      sprite sheet data formats only include 'JSON' at this time. Supported bitmap font
 *      data formats include 'xml' and 'fnt'.
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 */
function AssetLoader(assetURLs, crossorigin) {
    /**
     * The array of asset URLs that are going to be loaded
     *
     * @member {string[]}
     */
    this.assetURLs = assetURLs;

    /**
     * Whether the requests should be treated as cross origin
     *
     * @member {boolean}
     */
    this.crossorigin = crossorigin;

    /**
     * Maps file extension to loader types
     *
     * @member {object}
     */
    this.loadersByType = {
        'jpg':  ImageLoader,
        'jpeg': ImageLoader,
        'png':  ImageLoader,
        'gif':  ImageLoader,
        'webp': ImageLoader,
        'json': JsonLoader,
        'atlas': AtlasLoader,
        'anim': SpineLoader,
        'xml':  BitmapFontLoader,
        'fnt':  BitmapFontLoader
    };
}

// constructor
AssetLoader.prototype.constructor = AssetLoader;
module.exports = AssetLoader;

core.utils.eventTarget.mixin(AssetLoader.prototype);

/**
 * Fired when an item has loaded
 * @event onProgress
 */

/**
 * Fired when all the assets have loaded
 * @event onComplete
 */

/**
 * Given a filename, returns its extension.
 *
 * @param str {string} the name of the asset
 */
AssetLoader.prototype._getDataType = function (str) {
    var test = 'data:';
    var start = str.slice(0, test.length).toLowerCase();

    if (start === test) {
        var data = str.slice(test.length);
        var sepIdx = data.indexOf(',');

        // check for malformed data URI scheme
        if (sepIdx === -1) {
            return null;
        }

        //e.g. 'image/gif;base64' => 'image/gif'
        var info = data.slice(0, sepIdx).split(';')[0];

        //We might need to handle some special cases here...
        //standardize text/plain to 'txt' file extension
        if (!info || info.toLowerCase() === 'text/plain') {
            return 'txt';
        }

        //User specified mime type, try splitting it by '/'
        return info.split('/').pop().toLowerCase();
    }

    return null;
};

/**
 * Starts loading the assets sequentially
 *
 */
AssetLoader.prototype.load = function () {
    var scope = this;

    function onLoad(evt) {
        scope.onAssetLoaded(evt.data.content);
    }

    this.loadCount = this.assetURLs.length;

    for (var i=0; i < this.assetURLs.length; i++) {
        var fileName = this.assetURLs[i];
        //first see if we have a data URI scheme..
        var fileType = this._getDataType(fileName);

        //if not, assume it's a file URI
        if (!fileType) {
            fileType = fileName.split('?').shift().split('.').pop().toLowerCase();
        }

        var Constructor = this.loadersByType[fileType];
        if (!Constructor) {
            throw new Error(fileType + ' is an unsupported file type');
        }

        var loader = new Constructor(fileName, this.crossorigin);

        loader.on('loaded', onLoad);
        loader.load();
    }
};

/**
 * Invoked after each file is loaded
 *
 * @private
 */
AssetLoader.prototype.onAssetLoaded = function (loader) {
    this.loadCount--;
    this.emit('onProgress', { content: this, loader: loader });

    if (this.onProgress) {
        this.onProgress(loader);
    }

    if (!this.loadCount) {
        this.emit('onComplete', { content: this });

        if (this.onComplete) {
            this.onComplete();
        }
    }
};
