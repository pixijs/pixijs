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
 * @param source {Image|Canvas} the source object of the texture
 * @param scaleMode {Number=DEFAULT} See {{#crossLink "PIXI/scaleModes:property"}}PIXI.scaleModes{{/crossLink}} for possible values
 */
PIXI.BaseTexture = function(source, scaleMode)
{
    this._UID = PIXI._UID++;

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
     * @type {Number}
     * @default PIXI.scaleModes.LINEAR
     */
    this.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;

    /**
     * [read-only] Set to true once the base texture has sucessfully loaded.
     *
     * This is never true if the underlying source fails to load or has no texture data.
     *
     * @property hasLoaded
     * @type Boolean
     * @readOnly
     */
    this.hasLoaded = false;

    /**
     * [read-only] Set to true if the source is currently loading.
     *
     * If an Image source is loading the 'loaded' or 'error' event will be
     * dispatched when the operation ends. An underyling source that is
     * immediately-available bypasses loading entirely.
     *
     * @property isLoading
     * @type Boolean
     * @readOnly
     */
    this.isLoading = false;

    /**
     * The image source that is used to create the texture.
     *
     * @property source
     * @type Image|Canvas
     */
    this.source = null; // set in loadSource, if at all

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

    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     * 
     * @property mipmap
     * @type {Boolean}
     */
    this.mipmap = false;

    // used for webGL texture updating...
    // TODO - this needs to be addressed

    /**
     * @property _dirty
     * @type Array
     * @private
     */
    this._dirty = [true, true, true, true];

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

    /**
     * Fired when a not-immediately-available source finishes loading.
     *
     * @event loaded
     * @protected
     */

    /**
     * Fired when a not-immediately-available source fails to load.
     *
     * @event error
     * @protected
     */

    if(!source)return;
    this.loadSource(source);

};

PIXI.BaseTexture.prototype.constructor = PIXI.BaseTexture;

PIXI.EventTarget.mixin(PIXI.BaseTexture.prototype);

/**
 * Load a source.
 *
 * If the source is not-immediately-available, such as an image that needs to be
 * downloaded, then the 'loaded' or 'error' event will be dispatched in the future
 * and `hasLoaded` will remain false after this call.
 *
 * The logic state after calling `loadSource` directly or indirectly (eg. `fromImage`, `new BaseTexture`) is:
 *
 *     if (texture.hasLoaded) {
 *        // texture ready for use
 *     } else if (texture.isLoading) {
 *        // listen to 'loaded' and/or 'error' events on texture
 *     } else {
 *        // not loading, not going to load UNLESS the source is reloaded
 *        // (it may still make sense to listen to the events)
 *     }
 *
 * @method loadSource
 * @param source {Image|Canvas} the source object of the texture
 * @protected
 */
PIXI.BaseTexture.prototype.loadSource = function(source)
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

    // Apply source, if loaded. Otherwise setup appropriate loading monitors.

    if((source.complete || source.getContext) && source.width && source.height)
    {
        // Image or canvas success
        this.hasLoaded = true;
        this.width = source.naturalWidth || source.width;
        this.height = source.naturalHeight || source.height;
        this.dirty();
    }
    else if(!source.getContext)
    {
        // Image fail / not ready
        this.isLoading = true;
        var scope = this;

        source.onload = function() {
            source.onload = null;
            source.onerror = null;
            if(!scope.isLoading)return;

            scope.isLoading = false;
            scope.hasLoaded = true;
            scope.width = source.naturalWidth || source.width;
            scope.height = source.naturalHeight || source.height;
            scope.dirty();

            // add it to somewhere...
            scope.dispatchEvent( { type: 'loaded', content: scope } );
        };

        source.onerror = function() {
            source.onload = null;
            source.onerror = null;
            if(!scope.isLoading)return;

            scope.isLoading = false;

            scope.dispatchEvent( { type: 'error', content: scope } );
        };

        // Per http://www.w3.org/TR/html5/embedded-content-0.html#the-img-element
        //   "The value of `complete` can thus change while a script is executing."
        // So complete needs to be re-checked after the callbacks have been added..
        if(source.complete)
        {
            this.isLoading = false;

            // ..and if we're complete now, no need for callbacks
            source.onload = null;
            source.onerror = null;

            if(source.width && source.height)
            {
                this.hasLoaded = true;
                this.width = source.naturalWidth || source.width;
                this.height = source.naturalHeight || source.height;
                this.dirty();

                // If any previous subscribers possible
                if(wasLoading)this.dispatchEvent( { type: 'loaded', content: this } );
            }
            else
            {
                // If any previous subscribers possible
                if(wasLoading)this.dispatchEvent( { type: 'error', content: this } );
            }
        }
    }
};

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
        if (!navigator.isCocoonJS) this.source.src = '';
    }
    else if (this.source && this.source._pixiId)
    {
        delete PIXI.BaseTextureCache[this.source._pixiId];
    }
    this.source = null;

    this.unloadFromGPU();
};

/**
 * Changes the source image of the texture.
 * The original source must be an Image element.
 *
 * @method updateSourceImage
 * @param newSrc {String} the path of the image
 */
PIXI.BaseTexture.prototype.updateSourceImage = function(newSrc)
{
    this.source.src = null;
    this.source.src = newSrc;
    this.loadSource(this.source);
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
 * Removes the base texture from the GPU, useful for managing resources on the GPU.
 * A texture is still 100% usable and will simply be reuploaded if there is a sprite on screen that is using it.
 *
 * @method unloadFromGPU
 */
PIXI.BaseTexture.prototype.unloadFromGPU = function()
{
    this.dirty();

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

    this.dirty();
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @method fromImage
 * @param imageUrl {String} The image url of the texture
 * @param crossorigin {Boolean=(auto)} Should use anonymous CORS? Defaults to true if the URL is not a data-URI.
 * @param scaleMode {Number=DEFAULT} See {{#crossLink "PIXI/scaleModes:property"}}PIXI.scaleModes{{/crossLink}} for possible values
 * @return BaseTexture
 */
PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode)
{
    var baseTexture = PIXI.BaseTextureCache[imageUrl];

    if(crossorigin === undefined && imageUrl.indexOf('data:') !== 0) crossorigin = true;

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
 * @param scaleMode {Number} See {{#crossLink "PIXI/scaleModes:property"}}PIXI.scaleModes{{/crossLink}} for possible values
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
