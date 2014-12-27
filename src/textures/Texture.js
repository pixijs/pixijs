var Rectangle = require('./Rectangle');

TextureCache = {};
FrameCache = {};

TextureCacheIdGenerator = 0;

/**
 * A texture stores the information that represents an image or part of an image. It cannot be added
 * to the display list directly. Instead use it as the texture for a Sprite. If no frame is provided then the whole image is used.
 *
 * @class
 * @mixes EventTarget
 * @namespace PIXI
 * @param baseTexture {BaseTexture} The base texture source to create the texture from
 * @param [frame] {Rectangle} The rectangle frame of the texture to show
 * @param [crop] {Rectangle} The area of original texture
 * @param [trim] {Rectangle} Trimmed texture rectangle
 */
function Texture(baseTexture, frame, crop, trim) {
    /**
     * Does this Texture have any frame data assigned to it?
     *
     * @member {boolean}
     */
    this.noFrame = false;

    if (!frame) {
        this.noFrame = true;
        frame = new Rectangle(0,0,1,1);
    }

    if (baseTexture instanceof Texture) {
        baseTexture = baseTexture.baseTexture;
    }

    /**
     * The base texture that this texture uses.
     *
     * @member {BaseTexture}
     */
    this.baseTexture = baseTexture;

    /**
     * The frame specifies the region of the base texture that this texture uses
     *
     * @member {Rectangle}
     */
    this.frame = frame;

    /**
     * The texture trim data.
     *
     * @member {Rectangle}
     */
    this.trim = trim;

    /**
     * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
     *
     * @member {boolean}
     */
    this.valid = false;

    /**
     * This will let a renderer know that a texture has been updated (used mainly for webGL uv updates)
     *
     * @member {boolean}
     */
    this.requiresUpdate = false;

    /**
     * The WebGL UV data cache.
     *
     * @member {object}
     * @private
     */
    this._uvs = null;

    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    this.width = 0;

    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    this.height = 0;

    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     *
     * @member {Rectangle}
     */
    this.crop = crop || new Rectangle(0, 0, 1, 1);

    if (baseTexture.hasLoaded) {
        if (this.noFrame) frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);
        this.setFrame(frame);
    }
    else {
        baseTexture.addEventListener('loaded', this.onBaseTextureLoaded.bind(this));
    }
}

Texture.prototype.constructor = Texture;
module.exports = Texture;

EventTarget.mixin(Texture.prototype);

/**
 * Called when the base texture is loaded
 *
 * @private
 */
Texture.prototype.onBaseTextureLoaded = function () {
    var baseTexture = this.baseTexture;
    baseTexture.removeEventListener('loaded', this.onLoaded);

    if (this.noFrame) this.frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);

    this.setFrame(this.frame);

    this.dispatchEvent( { type: 'update', content: this } );
};

/**
 * Destroys this texture
 *
 * @param destroyBase {boolean} Whether to destroy the base texture as well
 */
Texture.prototype.destroy = function (destroyBase) {
    if (destroyBase) this.baseTexture.destroy();

    this.valid = false;
};

/**
 * Specifies the region of the baseTexture that this texture will use.
 *
 * @param frame {Rectangle} The frame of the texture to set it to
 */
Texture.prototype.setFrame = function (frame) {
    this.noFrame = false;

    this.frame = frame;
    this.width = frame.width;
    this.height = frame.height;

    this.crop.x = frame.x;
    this.crop.y = frame.y;
    this.crop.width = frame.width;
    this.crop.height = frame.height;

    if (!this.trim && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)) {
        throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
    }

    this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded;

    if (this.trim) {
        this.width = this.trim.width;
        this.height = this.trim.height;
        this.frame.width = this.trim.width;
        this.frame.height = this.trim.height;
    }

    if (this.valid) this._updateUvs();

};

/**
 * Updates the internal WebGL UV cache.
 *
 * @private
 */
Texture.prototype._updateUvs = function () {
    if (!this._uvs) {
        this._uvs = new TextureUvs();
    }

    var frame = this.crop;
    var tw = this.baseTexture.width;
    var th = this.baseTexture.height;

    this._uvs.x0 = frame.x / tw;
    this._uvs.y0 = frame.y / th;

    this._uvs.x1 = (frame.x + frame.width) / tw;
    this._uvs.y1 = frame.y / th;

    this._uvs.x2 = (frame.x + frame.width) / tw;
    this._uvs.y2 = (frame.y + frame.height) / th;

    this._uvs.x3 = frame.x / tw;
    this._uvs.y3 = (frame.y + frame.height) / th;
};

/**
 * Helper function that creates a Texture object from the given image url.
 * If the image is not in the texture cache it will be  created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return Texture
 */
Texture.fromImage = function (imageUrl, crossorigin, scaleMode) {
    var texture = TextureCache[imageUrl];

    if (!texture) {
        texture = new Texture(BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
        TextureCache[imageUrl] = texture;
    }

    return texture;
};

/**
 * Helper function that returns a Texture objected based on the given frame id.
 * If the frame id is not in the texture cache an error will be thrown.
 *
 * @static
 * @param frameId {string} The frame id of the texture
 * @return Texture
 */
Texture.fromFrame = function (frameId) {
    var texture = TextureCache[frameId];
    if (!texture) throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ');
    return texture;
};

/**
 * Helper function that creates a new a Texture based on the given canvas element.
 *
 * @static
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {number} See {{#crossLink "PIXI/scaleModes:property"}}scaleModes{{/crossLink}} for possible values
 * @return Texture
 */
Texture.fromCanvas = function (canvas, scaleMode) {
    var baseTexture = BaseTexture.fromCanvas(canvas, scaleMode);

    return new Texture( baseTexture );

};

/**
 * Adds a texture to the global TextureCache. This cache is shared across the whole PIXI object.
 *
 * @static
 * @param texture {Texture} The Texture to add to the cache.
 * @param id {string} The id that the texture will be stored against.
 */
Texture.addTextureToCache = function (texture, id) {
    TextureCache[id] = texture;
};

/**
 * Remove a texture from the global TextureCache.
 *
 * @static
 * @param id {string} The id of the texture to be removed
 * @return {Texture} The texture that was removed
 */
Texture.removeTextureFromCache = function (id) {
    var texture = TextureCache[id];

    delete TextureCache[id];
    delete BaseTextureCache[id];

    return texture;
};

function TextureUvs() {
    this.x0 = 0;
    this.y0 = 0;

    this.x1 = 0;
    this.y1 = 0;

    this.x2 = 0;
    this.y2 = 0;

    this.x3 = 0;
    this.y3 = 0;
};

Texture.emptyTexture = new Texture(new BaseTexture());

