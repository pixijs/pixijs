var utils = require('../utils'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3'),
    determineCrossOrigin = require('../utils/determineCrossOrigin'),
    bitTwiddle = require('bit-twiddle');

/**
 * A texture stores the information that represents an image. All textures have a base texture.
 *
 * @class
 * @memberof PIXI
 * @param [source ]{Image|HTMLCanvasElement} the source object of the texture.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=CONST.resolution] {number} the resolution of the texture for devices with different pixel ratios
 */
function BaseTexture(source, scaleMode, resolution)
{
    EventEmitter.call(this);

    this.uid = utils.uid();

    this.touched = 0;

    /**
     * The Resolution of the texture.
     *
     * @member {number}
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * The width of the base texture set when the image has loaded
     *
     * @member {number}
     * @readOnly
     */
    this.width = 100;

    /**
     * The height of the base texture set when the image has loaded
     *
     * @member {number}
     * @readOnly
     */
    this.height = 100;

    // TODO docs
    // used to store the actual dimensions of the source
    /**
     * Used to store the actual width of the source of this texture
     *
     * @member {number}
     * @readOnly
     */
    this.realWidth = 100;
    /**
     * Used to store the actual height of the source of this texture
     *
     * @member {number}
     * @readOnly
     */
    this.realHeight = 100;

    /**
     * The scale mode to apply when scaling this texture
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.LINEAR
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Set to true once the base texture has successfully loaded.
     *
     * This is never true if the underlying source fails to load or has no texture data.
     *
     * @member {boolean}
     * @readOnly
     */
    this.hasLoaded = false;

    /**
     * Set to true if the source is currently loading.
     *
     * If an Image source is loading the 'loaded' or 'error' event will be
     * dispatched when the operation ends. An underyling source that is
     * immediately-available bypasses loading entirely.
     *
     * @member {boolean}
     * @readonly
     */
    this.isLoading = false;

    /**
     * The image source that is used to create the texture.
     *
     * TODO: Make this a setter that calls loadSource();
     *
     * @member {Image|HTMLCanvasElement}
     * @readonly
     */
    this.source = null; // set in loadSource, if at all

    /**
     * Controls if RGB channels should be pre-multiplied by Alpha  (WebGL only)
     * All blend modes, and shaders written for default value. Change it on your own risk.
     *
     * @member {boolean}
     * @default true
     */
    this.premultipliedAlpha = true;

    /**
     * @member {string}
     */
    this.imageUrl = null;

    /**
     * Wether or not the texture is a power of two, try to use power of two textures as much as you can
     * @member {boolean}
     * @private
     */
    this.isPowerOfTwo = false;

    // used for webGL

    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     *
     * @member {boolean}
     */
    this.mipmap = CONST.MIPMAP_TEXTURES;


    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     *
     * @member {boolean}
     */
    this.wrap = CONST.MIPMAP_TEXTURES;

    /**
     * A map of renderer IDs to webgl textures
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._glTextures = [];
    this._enabled = 0;
    this._id = 0;

    // if no source passed don't try to load
    if (source)
    {
        this.loadSource(source);
    }

    /**
     * Fired when a not-immediately-available source finishes loading.
     *
     * @event loaded
     * @memberof PIXI.BaseTexture#
     * @protected
     */

    /**
     * Fired when a not-immediately-available source fails to load.
     *
     * @event error
     * @memberof PIXI.BaseTexture#
     * @protected
     */
}

BaseTexture.prototype = Object.create(EventEmitter.prototype);
BaseTexture.prototype.constructor = BaseTexture;
module.exports = BaseTexture;

/**
 * Updates the texture on all the webgl renderers, this also assumes the src has changed.
 *
 * @fires update
 */
BaseTexture.prototype.update = function ()
{
    this.realWidth = this.source.naturalWidth || this.source.videoWidth || this.source.width;
    this.realHeight = this.source.naturalHeight || this.source.videoHeight || this.source.height;

    this.width = this.realWidth / this.resolution;
    this.height = this.realHeight / this.resolution;

    this.isPowerOfTwo = bitTwiddle.isPow2(this.realWidth) && bitTwiddle.isPow2(this.realHeight);

    this.emit('update', this);
};

/**
 * Load a source.
 *
 * If the source is not-immediately-available, such as an image that needs to be
 * downloaded, then the 'loaded' or 'error' event will be dispatched in the future
 * and `hasLoaded` will remain false after this call.
 *
 * The logic state after calling `loadSource` directly or indirectly (eg. `fromImage`, `new BaseTexture`) is:
 *
 *     if (texture.hasLoaded)
 {
 *        // texture ready for use
 *     } else if (texture.isLoading)
 {
 *        // listen to 'loaded' and/or 'error' events on texture
 *     } else {
 *        // not loading, not going to load UNLESS the source is reloaded
 *        // (it may still make sense to listen to the events)
 *     }
 *
 * @protected
 * @param source {Image|HTMLCanvasElement} the source object of the texture.
 */
BaseTexture.prototype.loadSource = function (source)
{
    var wasLoading = this.isLoading;
    this.hasLoaded = false;
    this.isLoading = false;

    if (wasLoading && this.source)
    {
        this.source.onload = null;
        this.source.onerror = null;
    }

    this.source = source;

    // Apply source if loaded. Otherwise setup appropriate loading monitors.
    if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height)
    {
        this._sourceLoaded();
    }
    else if (!source.getContext)
    {

        // Image fail / not ready
        this.isLoading = true;

        var scope = this;

        source.onload = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope._sourceLoaded();

            scope.emit('loaded', scope);
        };

        source.onerror = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope.emit('error', scope);
        };

        // Per http://www.w3.org/TR/html5/embedded-content-0.html#the-img-element
        //   "The value of `complete` can thus change while a script is executing."
        // So complete needs to be re-checked after the callbacks have been added..
        // NOTE: complete will be true if the image has no src so best to check if the src is set.
        if (source.complete && source.src)
        {
            this.isLoading = false;

            // ..and if we're complete now, no need for callbacks
            source.onload = null;
            source.onerror = null;

            if (source.width && source.height)
            {
                this._sourceLoaded();

                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('loaded', this);
                }
            }
            else
            {
                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('error', this);
                }
            }
        }
    }
};

/**
 * Used internally to update the width, height, and some other tracking vars once
 * a source has successfully loaded.
 *
 * @private
 */
BaseTexture.prototype._sourceLoaded = function ()
{
    this.hasLoaded = true;
    this.update();
};

/**
 * Destroys this base texture
 *
 */
BaseTexture.prototype.destroy = function ()
{
    if (this.imageUrl)
    {
        delete utils.BaseTextureCache[this.imageUrl];
        delete utils.TextureCache[this.imageUrl];

        this.imageUrl = null;

        if (!navigator.isCocoonJS)
        {
            this.source.src = '';
        }
    }
    else if (this.source && this.source._pixiId)
    {
        delete utils.BaseTextureCache[this.source._pixiId];
    }

    this.source = null;

    this.dispose();
};

/**
 * Frees the texture from WebGL memory without destroying this texture object.
 * This means you can still use the texture later which will upload it to GPU
 * memory again.
 *
 */
BaseTexture.prototype.dispose = function ()
{
    this.emit('dispose', this);

    // this should no longer be needed, the renderers should cleanup all the gl textures.
    // this._glTextures = {};
};

/**
 * Changes the source image of the texture.
 * The original source must be an Image element.
 *
 * @param newSrc {string} the path of the image
 */
BaseTexture.prototype.updateSourceImage = function (newSrc)
{
    this.source.src = newSrc;

    this.loadSource(this.source);
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} Should use anonymous CORS? Defaults to true if the URL is not a data-URI.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var baseTexture = utils.BaseTextureCache[imageUrl];

    if (!baseTexture)
    {
        // new Image() breaks tex loading in some versions of Chrome.
        // See https://code.google.com/p/chromium/issues/detail?id=238071
        var image = new Image();//document.createElement('img');


        if (crossorigin === undefined && imageUrl.indexOf('data:') !== 0)
        {
            image.crossOrigin = determineCrossOrigin(imageUrl);
        }

        baseTexture = new BaseTexture(image, scaleMode);
        baseTexture.imageUrl = imageUrl;

        image.src = imageUrl;

        utils.BaseTextureCache[imageUrl] = baseTexture;

        // if there is an @2x at the end of the url we are going to assume its a highres image
        baseTexture.resolution = utils.getResolutionOfUrl(imageUrl);
    }

    return baseTexture;
};

/**
 * Helper function that creates a base texture from the given canvas element.
 *
 * @static
 * @param canvas {HTMLCanvasElement} The canvas element source of the texture
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromCanvas = function (canvas, scaleMode)
{
    if (!canvas._pixiId)
    {
        canvas._pixiId = 'canvas_' + utils.uid();
    }

    var baseTexture = utils.BaseTextureCache[canvas._pixiId];

    if (!baseTexture)
    {
        baseTexture = new BaseTexture(canvas, scaleMode);
        utils.BaseTextureCache[canvas._pixiId] = baseTexture;
    }

    return baseTexture;
};
