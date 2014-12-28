var utils = require('../utils'),
    CONST = require('../const');

/**
 * A texture stores the information that represents an image. All textures have a base texture.
 *
 * @class
 * @mixes EventTarget
 * @namespace PIXI
 * @param source {string} the source object (image or canvas)
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 */
function BaseTexture(source, scaleMode) {
    /**
     * The Resolution of the texture.
     *
     * @member {number}
     */
    this.resolution = 1;

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

    /**
     * The scale mode to apply when scaling this texture
     *
     * @member {{number}}
     * @default scaleModes.LINEAR
     */
    this.scaleMode = scaleMode || CONST.scaleModes.DEFAULT;

    /**
     * Set to true once the base texture has loaded
     *
     * @member {boolean}
     * @readOnly
     */
    this.hasLoaded = false;

    /**
     * The image source that is used to create the texture.
     *
     * @member {Image}
     */
    this.source = source;

    this._UID = utils.uuid();

    /**
     * Controls if RGB channels should be pre-multiplied by Alpha  (WebGL only)
     *
     * @member {boolean}
     * @default true
     */
    this.premultipliedAlpha = true;

    // used for webGL

    /**
     * @member {Array}
     * @private
     */
    this._glTextures = [];

    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     *
     * @member {{boolean}}
     */
    this.mipmap = false;

    // used for webGL texture updating...
    // TODO - this needs to be addressed

    /**
     * @member {Array}
     * @private
     */
    this._dirty = [true, true, true, true];

    if (!source) {
        return;
    }

    if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height) {
        this.hasLoaded = true;
        this.width = this.source.naturalWidth || this.source.width;
        this.height = this.source.naturalHeight || this.source.height;
        this.dirty();
    }
    else {
        var scope = this;

        this.source.onload = function () {

            scope.hasLoaded = true;
            scope.width = scope.source.naturalWidth || scope.source.width;
            scope.height = scope.source.naturalHeight || scope.source.height;

            scope.dirty();

            // add it to somewhere...
            scope.dispatchEvent( { type: 'loaded', content: scope } );
        };

        this.source.onerror = function () {
            scope.dispatchEvent( { type: 'error', content: scope } );
        };
    }

    /**
     * @member {string}
     */
    this.imageUrl = null;

    /**
     * @member {boolean}
     * @private
     */
    this._powerOf2 = false;
}

BaseTexture.prototype.constructor = BaseTexture;
module.exports = BaseTexture;

utils.EventTarget.mixin(BaseTexture.prototype);

/**
 * Destroys this base texture
 *
 */
BaseTexture.prototype.destroy = function () {
    if (this.imageUrl) {
        delete utils.BaseTextureCache[this.imageUrl];
        delete utils.TextureCache[this.imageUrl];
        this.imageUrl = null;
        if (!navigator.isCocoonJS) {
            this.source.src = '';
        }
    }
    else if (this.source && this.source._pixiId) {
        delete utils.BaseTextureCache[this.source._pixiId];
    }
    this.source = null;

    this.unloadFromGPU();
};

/**
 * Changes the source image of the texture
 *
 * @param newSrc {string} the path of the image
 */
BaseTexture.prototype.updateSourceImage = function (newSrc) {
    this.hasLoaded = false;
    this.source.src = null;
    this.source.src = newSrc;
};

/**
 * Sets all glTextures to be dirty.
 *
 */
BaseTexture.prototype.dirty = function () {
    for (var i = 0; i < this._glTextures.length; i++) {
        this._dirty[i] = true;
    }
};

/**
 * Removes the base texture from the GPU, useful for managing resources on the GPU.
 * Atexture is still 100% usable and will simply be reuploaded if there is a sprite on screen that is using it.
 *
 */
BaseTexture.prototype.unloadFromGPU = function () {
    this.dirty();

    // delete the webGL textures if any.
    for (var i = this._glTextures.length - 1; i >= 0; i--) {
        var glTexture = this._glTextures[i];
        var gl = glContexts[i];

        if (gl && glTexture) {
            gl.deleteTexture(glTexture);
        }

    }

    this._glTextures.length = 0;

    this.dirty();
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param crossorigin {boolean}
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return BaseTexture
 */
BaseTexture.fromImage = function (imageUrl, crossorigin, scaleMode) {
    var baseTexture = utils.BaseTextureCache[imageUrl];

    if (crossorigin === undefined && imageUrl.indexOf('data:') === -1) {
        crossorigin = true;
    }

    if (!baseTexture) {
        // new Image() breaks tex loading in some versions of Chrome.
        // See https://code.google.com/p/chromium/issues/detail?id=238071
        var image = new Image();//document.createElement('img');
        if (crossorigin) {
            image.crossOrigin = '';
        }

        image.src = imageUrl;
        baseTexture = new BaseTexture(image, scaleMode);
        baseTexture.imageUrl = imageUrl;
        utils.BaseTextureCache[imageUrl] = baseTexture;

        // if there is an @2x at the end of the url we are going to assume its a highres image
        if ( imageUrl.indexOf(CONST.RETINA_PREFIX + '.') !== -1) {
            baseTexture.resolution = 2;
        }
    }

    return baseTexture;
};

/**
 * Helper function that creates a base texture from the given canvas element.
 *
 * @static
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return BaseTexture
 */
BaseTexture.fromCanvas = function (canvas, scaleMode) {
    if (!canvas._pixiId) {
        canvas._pixiId = 'canvas_' + utils.TextureCacheIdGenerator++;
    }

    var baseTexture = utils.BaseTextureCache[canvas._pixiId];

    if (!baseTexture) {
        baseTexture = new BaseTexture(canvas, scaleMode);
        utils.BaseTextureCache[canvas._pixiId] = baseTexture;
    }

    return baseTexture;
};
