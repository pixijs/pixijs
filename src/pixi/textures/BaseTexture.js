/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.BaseTextureCache = {};

PIXI.BaseTextureCacheIdGenerator = 0;

/**
 * A texture stores the information that represents an image. All textures have a base texture.
 *
 * @class BaseTexture
 * @uses EventTarget
 * @constructor
 * @param source {String} the source object (image or canvas)
 * @param scaleMode {Number} Should be one of the PIXI.scaleMode consts
 */
PIXI.BaseTexture = function(source, scaleMode)
{
    /**
     * The Resolution of the texture. 
     *
     * @property resolution
     * @type Number
     */
    this.resolution = 1;
    
    /**
     * [read-only] The width of the base texture set when the image has loaded
     *
     * @property width
     * @type Number
     * @readOnly
     */
    this.width = 100;

    /**
     * [read-only] The height of the base texture set when the image has loaded
     *
     * @property height
     * @type Number
     * @readOnly
     */
    this.height = 100;

    /**
     * The scale mode to apply when scaling this texture
     * 
     * @property scaleMode
     * @type PIXI.scaleModes
     * @default PIXI.scaleModes.LINEAR
     */
    this.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;

    /**
     * [read-only] Set to true once the base texture has loaded
     *
     * @property hasLoaded
     * @type Boolean
     * @readOnly
     */
    this.hasLoaded = false;

    /**
     * The image source that is used to create the texture.
     *
     * @property source
     * @type Image
     */
    this.source = source;

    this._UID = PIXI._UID++;

    /**
     * Controls if RGB channels should be pre-multiplied by Alpha  (WebGL only)
     *
     * @property premultipliedAlpha
     * @type Boolean
     * @default true
     */
    this.premultipliedAlpha = true;

    // used for webGL

    /**
     * @property _glTextures
     * @type Array
     * @private
     */
    this._glTextures = [];

    // used for webGL texture updating...
    // TODO - this needs to be addressed

    /**
     * @property _dirty
     * @type Array
     * @private
     */
    this._dirty = [true, true, true, true];

    if(!source)return;

    if((this.source.complete || this.source.getContext) && this.source.width && this.source.height)
    {
        this.hasLoaded = true;
        this.width = this.source.naturalWidth || this.source.width;
        this.height = this.source.naturalHeight || this.source.height;
        this.dirty();
    }
    else
    {
        var scope = this;

        this.source.onload = function() {

            scope.hasLoaded = true;
            scope.width = scope.source.naturalWidth || scope.source.width;
            scope.height = scope.source.naturalHeight || scope.source.height;

            scope.dirty();

            // add it to somewhere...
            scope.dispatchEvent( { type: 'loaded', content: scope } );
        };

        this.source.onerror = function() {
            scope.dispatchEvent( { type: 'error', content: scope } );
        };
    }

    /**
     * @property imageUrl
     * @type String
     */
    this.imageUrl = null;

    /**
     * @property _powerOf2
     * @type Boolean
     * @private
     */
    this._powerOf2 = false;

};

PIXI.BaseTexture.prototype.constructor = PIXI.BaseTexture;

PIXI.EventTarget.mixin(PIXI.BaseTexture.prototype);

/**
 * Destroys this base texture
 *
 * @method destroy
 */
PIXI.BaseTexture.prototype.destroy = function()
{
    if(this.imageUrl)
    {
        delete PIXI.BaseTextureCache[this.imageUrl];
        delete PIXI.TextureCache[this.imageUrl];
        this.imageUrl = null;
        this.source.src = '';
    }
    else if (this.source && this.source._pixiId)
    {
        delete PIXI.BaseTextureCache[this.source._pixiId];
    }
    this.source = null;

    // delete the webGL textures if any.
    for (var i = this._glTextures.length - 1; i >= 0; i--)
    {
        var glTexture = this._glTextures[i];
        var gl = PIXI.glContexts[i];

        if(gl && glTexture)
        {
            gl.deleteTexture(glTexture);
        }
    }

    this._glTextures.length = 0;
};

/**
 * Changes the source image of the texture
 *
 * @method updateSourceImage
 * @param newSrc {String} the path of the image
 */
PIXI.BaseTexture.prototype.updateSourceImage = function(newSrc)
{
    this.hasLoaded = false;
    this.source.src = null;
    this.source.src = newSrc;
};

/**
 * Sets all glTextures to be dirty.
 *
 * @method dirty
 */
PIXI.BaseTexture.prototype.dirty = function()
{
    for (var i = 0; i < this._glTextures.length; i++)
    {
        this._dirty[i] = true;
    }
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @method fromImage
 * @param imageUrl {String} The image url of the texture
 * @param crossorigin {Boolean}
 * @param scaleMode {Number} Should be one of the PIXI.scaleMode consts
 * @return BaseTexture
 */
PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode)
{
    var baseTexture = PIXI.BaseTextureCache[imageUrl];

    if(crossorigin === undefined && imageUrl.indexOf('data:') === -1) crossorigin = true;

    if(!baseTexture)
    {
        // new Image() breaks tex loading in some versions of Chrome.
        // See https://code.google.com/p/chromium/issues/detail?id=238071
        var image = new Image();//document.createElement('img');
        if (crossorigin)
        {
            image.crossOrigin = '';
        }

        image.src = imageUrl;
        baseTexture = new PIXI.BaseTexture(image, scaleMode);
        baseTexture.imageUrl = imageUrl;
        PIXI.BaseTextureCache[imageUrl] = baseTexture;

        // if there is an @2x at the end of the url we are going to assume its a highres image
        if( imageUrl.indexOf(PIXI.RETINA_PREFIX + '.') !== -1)
        {
            baseTexture.resolution = 2;
        }
    }

    return baseTexture;
};

/**
 * Helper function that creates a base texture from the given canvas element.
 *
 * @static
 * @method fromCanvas
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {Number} Should be one of the PIXI.scaleMode consts
 * @return BaseTexture
 */
PIXI.BaseTexture.fromCanvas = function(canvas, scaleMode)
{
    if(!canvas._pixiId)
    {
        canvas._pixiId = 'canvas_' + PIXI.TextureCacheIdGenerator++;
    }

    var baseTexture = PIXI.BaseTextureCache[canvas._pixiId];

    if(!baseTexture)
    {
        baseTexture = new PIXI.BaseTexture(canvas, scaleMode);
        PIXI.BaseTextureCache[canvas._pixiId] = baseTexture;
    }

    return baseTexture;
};
