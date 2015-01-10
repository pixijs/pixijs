var core = require('../core');

/**
 * The image loader class is responsible for loading images file formats ('jpeg', 'jpg', 'png' and 'gif')
 * Once the image has been loaded it is stored in the PIXI texture cache and can be accessed though Texture.fromFrame() and Sprite.fromFrame()
 * When loaded this class will dispatch a 'loaded' event
 *
 * @class
 * @mixes eventTarget
 * @namespace PIXI
 * @param url {String} The url of the image
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 */
function ImageLoader(url, crossorigin) {
    /**
     * The texture being loaded
     *
     * @member {Texture}
     */
    this.texture = core.Texture.fromImage(url, crossorigin);

    /**
     * if the image is loaded with loadFramedSpriteSheet
     * frames will contain the sprite sheet frames
     *
     * @member {Array}
     * @readOnly
     */
    this.frames = [];
}

// constructor
ImageLoader.prototype.constructor = ImageLoader;
module.exports = ImageLoader;

core.utils.eventTarget.mixin(ImageLoader.prototype);

/**
 * Loads image or takes it from cache
 *
 */
ImageLoader.prototype.load = function () {
    if (!this.texture.baseTexture.hasLoaded) {
        this.texture.baseTexture.on('loaded', this.onLoaded.bind(this));
        this.texture.baseTexture.on('error', this.onError.bind(this));
    }
    else {
        this.onLoaded();
    }
};

/**
 * Invoked when image file is loaded or it is already cached and ready to use
 *
 * @private
 */
ImageLoader.prototype.onLoaded = function () {
    this.emit('loaded', { content: this });
};

/**
 * Invoked when image file failed loading
 *
 * @method onError
 * @private
 */
ImageLoader.prototype.onError = function () {
    this.emit('error', { content: this });
};

/**
 * Loads image and split it to uniform sized frames
 *
 * @param frameWidth {number} width of each frame
 * @param frameHeight {number} height of each frame
 * @param textureName {String} if given, the frames will be cached in <textureName>-<ord> format
 */
ImageLoader.prototype.loadFramedSpriteSheet = function (frameWidth, frameHeight, textureName) {
    this.frames = [];

    var cols = Math.floor(this.texture.width / frameWidth);
    var rows = Math.floor(this.texture.height / frameHeight);

    var i=0;
    for (var y = 0; y < rows; ++y) {
        for (var x = 0; x < cols; ++x, ++i) {
            var texture = new core.Texture(
                this.texture.baseTexture,
                new core.math.Rectangle(
                    x * frameWidth,
                    y * frameHeight,
                    frameWidth,
                    frameHeight
                )
            );

            this.frames.push(texture);

            if (textureName) {
                core.utils.TextureCache[textureName + '-' + i] = texture;
            }
        }
    }

	this.load();
};
