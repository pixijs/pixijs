/**
 * @author Martin Pecka
 */

/**
 * A hit area defined by opaque pixels of the texture.
 *
 * Do not directly call the constructor. Call #create() instead.
 *
 * @constructor 
 * @param {PIXI.Sprite} sprite The sprite this hitarea handles
 * @param {bool} useWebGL If true, handle the computations using WebGL, otherwise use Canvas.
 */
PIXI.TransparencyHitArea = function(sprite)
{
	/**
	 * @property sprite
	 * @type {PIXI.Sprite}
	 */
	this.sprite = sprite;
}

// constructor
//PIXI.TransparencyHitArea.prototype.constructor = PIXI.TransparencyHitArea;

/**
 * Create a hit area defined by opaque pixels of the texture.
 *
 * @param {PIXI.Sprite} sprite The sprite this hitarea handles
 * @param {bool} useWebGL If true, handle the computations using WebGL, otherwise use Canvas.
 */
PIXI.TransparencyHitArea.create = function (sprite, useWebGL) {
    var hitArea;
    if (useWebGL) {
	hitArea = new PIXI.WebGLTransparencyHitArea(sprite);
    } else {
	hitArea = new PIXI.CanvasTransparencyHitArea(sprite);
    }

    hitArea.init();

    return hitArea;
}

/**
 * Initialize this hit area after all constructors finish.
 *
 * Has to be called after the constructor finishes.
 */
PIXI.TransparencyHitArea.prototype.init = function() {
    
}

/**
 * Checks if the x, and y coords passed to this function are contained within this hit area
 *
 * @param {number} x The X coord of the point to test.
 * @param {number} x The Y coord of the point to test.
 * @return {boolean} If the x/y coords are within this hit area.
 */
PIXI.TransparencyHitArea.prototype.contains = function(x, y) {
    // first of all perform a rectangle bounds check
    // with negative scale, width/height can also be negative
    if(Math.abs(this.sprite.width) == 0 || Math.abs(this.sprite.height) == 0)
        return false;

	var w = this.sprite.texture.frame.width;
	if(x >= 0 && x <= w)
	{
	    var h = this.sprite.texture.frame.height;
		
	    if(y >= 0 && y <= h)
	    {
		// the rectangle bounds check succeeded		
		var xInTexture = Math.round(x + this.sprite.texture.frame.x);
		var yInTexture = Math.round(y + this.sprite.texture.frame.y);

		// x and y are coordinates in the texture, but the texture can
		// be part of a larger texture, of which the current one is a
		// subrectangle (a frame)
		return !this.isTextureTransparentAt(xInTexture, yInTexture);
	    }
	}

	return false;
}

/**
 * @protected
 * @return {Image} The texture of the sprite containing this hit area.
 */
PIXI.TransparencyHitArea.prototype.getTexture = function() {
    return this.sprite.texture.baseTexture.source;
}

/**
 * Returns true if the given texture is transparent at coordinates (x, y).
 *
 * @abstract
 * @protected
 * @param {int} x The questioned x coord in texture frame.
 * @param {int} y The questioned y coord in texture frame.
 * @return {boolean} true if the given texture is transparent at coordinates (x, y).
 */
PIXI.TransparencyHitArea.prototype.isTextureTransparentAt = function(x, y) {
    throw new Error('Has to be implemented in subclasses');
}

// CANVAS IMPLEMENTATION

/**
 * A transparency-based hit area using Canvas as the underlying technology.
 *
 * Do not directly call this constructor, call {@link PIXI.TransparencyHitArea#create) instead.
 *
 * If you really want to call this constructor directly, don't forget to call #init() afterwards.
 *
 * @constructor
 * @param {PIXI.Sprite} sprite The sprite this hitarea handles
 */
PIXI.CanvasTransparencyHitArea = function (sprite) {
    PIXI.TransparencyHitArea.call(this, sprite);

    /**
     * Data of the texture. 
     *
     * @property textureData
     * @private
     * @readonly
     * @type {(Uint8Array|CanvasPixelArray)}
     */
    this.textureData = null;

    /**
     * Width of the texture in pixels.
     *
     * @property textureWidth
     * @private
     * @readonly
     * @type {int}
     */
    this.textureWidth = null;
}
PIXI.CanvasTransparencyHitArea.prototype = Object.create(PIXI.TransparencyHitArea.prototype);
PIXI.CanvasTransparencyHitArea.constructor = PIXI.CanvasTransparencyHitArea;

/**
 * Creates a clone.
 *
 * @method clone
 * @return {CanvasTransparencyHitArea} A shallow copy.
 */
PIXI.CanvasTransparencyHitArea.prototype.clone = function()
{
    return new PIXI.CanvasTransparencyHitArea(this.sprite);
};

/**
 * Initialize this hit area after all constructors finish.
 *
 * @override
 * @protected
 */
PIXI.CanvasTransparencyHitArea.prototype.init = function () {
    PIXI.TransparencyHitArea.prototype.init.call(this);

    this.initTextureData();
}

/**
 * Initialize the texture data and save it to
 * PIXI.CanvasTransparencyHitArea.TextureData for it to be available 
 * in future calls.
 *
 * @private
 */
PIXI.CanvasTransparencyHitArea.prototype.initTextureData = function() {
    if (this.textureData)
	return;

    var texture = this.getTexture();
    this.textureWidth = texture.width;

    // texture is an <img> element and it always has the "src" attribute set
    var textureId = texture.src;

    if (PIXI.CanvasTransparencyHitArea.TextureData[textureId] === undefined) {
	var textureData = this.createTextureData(texture);
	PIXI.CanvasTransparencyHitArea.TextureData[textureId] = textureData;
    }

    this.textureData = PIXI.CanvasTransparencyHitArea.TextureData[textureId];
}

/**
 * Convert the given texture to an array of values readable by JS.
 *
 * @param {Image} texture The texture to convert.
 * @return {(Uint8Array|CanvasPixelArray)} Array of pixel values. Each pixel takes 4 values, for R, G, B and alpha.
 */
PIXI.CanvasTransparencyHitArea.prototype.createTextureData = function (texture) {
    var canvas = document.createElement('canvas');
    canvas.width = texture.width;
    canvas.height = texture.height;

    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, texture.width, texture.height);
    ctx.drawImage(texture, 0, 0);
    var pixelData = ctx.getImageData(0, 0, texture.width, texture.height).data;

    return pixelData;
};

/**
 * Returns true if the given texture is transparent at coordinates (x, y).
 *
 * @protected
 * @param {int} x The questioned x coord in texture frame.
 * @param {int} y The questioned y coord in texture frame.
 * @return {boolean} true if the given texture is transparent at coordinates (x, y).
 */
PIXI.CanvasTransparencyHitArea.prototype.isTextureTransparentAt = function(x, y) {
    if (!this.textureData)
	throw new Error('CanvasTransparencyHitArea#init() not called.');

    // the textureData contains 4 elements per pixel, the 4th being alpha channel
    var index = (x + y * this.textureWidth) * 4 + 3;

    // value 255 means fully opaque, < 255 means (at least partially) transparent
    return this.textureData[index] < 255;
}

/**
 * The cache that stores the texture data needed for transparency detection.
 *
 * @type {(Uint8Array[]|CanvasPixelArray[])}
 */
PIXI.CanvasTransparencyHitArea.TextureData = [];

// WEBGL IMPLEMENTATION

/**
 * A transparency-based hit area using WebGL as the underlying technology.
 *
 * Do not directly call this constructor, call {@link PIXI.TransparencyHitArea#create) instead.
 *
 * If you really want to call this constructor directly, don't forget to call #init() afterwards.
 *
 * @constructor
 * @param {PIXI.Sprite} sprite The sprite this hitarea handles
 */
PIXI.WebGLTransparencyHitArea = function (sprite) {
    PIXI.TransparencyHitArea.call(this, sprite);

    /**
     * Data of the texture. 
     *
     * @property textureData
     * @private
     * @readonly
     * @type {Uint8Array}
     */
    this.textureData = null;

    /**
     * Width of the texture in pixels.
     *
     * @property textureWidth
     * @private
     * @readonly
     * @type {int}
     */
    this.textureWidth = null;
}
PIXI.WebGLTransparencyHitArea.prototype = Object.create(PIXI.TransparencyHitArea.prototype);
PIXI.WebGLTransparencyHitArea.constructor = PIXI.WebGLTransparencyHitArea;

/**
 * Creates a clone.
 *
 * @method clone
 * @return {WebGLTransparencyHitArea} A shallow copy.
 */
PIXI.WebGLTransparencyHitArea.prototype.clone = function()
{
    return new PIXI.WebGLTransparencyHitArea(this.sprite);
};

/**
 * Initialize this hit area after all constructors finish.
 *
 * @override
 * @protected
 */
PIXI.WebGLTransparencyHitArea.prototype.init = function () {
    PIXI.TransparencyHitArea.prototype.init.call(this);

    this.initTextureData();
}

/**
 * Initialize the texture data and save it to
 * PIXI.WebGLTransparencyHitArea.TextureData for it to be available 
 * in future calls.
 *
 * @private
 */
PIXI.WebGLTransparencyHitArea.prototype.initTextureData = function() {
    if (this.textureData)
	return;

    var texture = this.getTexture();
    this.textureWidth = texture.width;

    // texture is an <img> element and it always has the "src" attribute set
    var textureId = texture.src;

    if (PIXI.WebGLTransparencyHitArea.TextureData[textureId] === undefined) {
	var textureData = this.createTextureData(texture);
	PIXI.WebGLTransparencyHitArea.TextureData[textureId] = textureData;
    }

    this.textureData = PIXI.WebGLTransparencyHitArea.TextureData[textureId];
}

/**
 * Convert the given texture to an array of values readable by JS.
 *
 * @param {Image} texture The texture to convert.
 * @return {Uint8Array} Array of pixel values. Each pixel takes 4 values, for R, G, B and alpha.
 */
PIXI.WebGLTransparencyHitArea.prototype.createTextureData = function (texture) {
    var gl = PIXI.gl;
    // create a new framebuffer to draw the texture on
    var frameBufer = gl.createFramebuffer();

    // make the created framebuffer the current
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    // attach the texture to the framebuffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
	    gl.TEXTURE_2D, texture, 0);

    // read out the framebuffer
    var textureData = new Uint8Array(texture.width * texture.height * 4);
    gl.readPixels(0, 0, texture.width, texture.height, gl.RGBA, gl.UNSIGNED_BYTE, textureData);

    // unbind the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return textureData;
};

/**
 * Returns true if the given texture is transparent at coordinates (x, y).
 *
 * @protected
 * @param {int} x The questioned x coord in texture frame.
 * @param {int} y The questioned y coord in texture frame.
 * @return {boolean} true if the given texture is transparent at coordinates (x, y).
 */
PIXI.WebGLTransparencyHitArea.prototype.isTextureTransparentAt = function(x, y) {
    if (!this.textureData)
	throw new Error('WebGLTransparencyHitArea#init() not called.');

    // the textureData contains 4 elements per pixel, the 4th being alpha channel
    var index = (x + y * this.textureWidth) * 4 + 3;

    // value 255 means fully opaque, < 255 means (at least partially) transparent
    return this.textureData[index] < 255;
}

/**
 * The cache that stores the texture data needed for transparency detection.
 *
 * @type {Uint8Array[]}
 */
PIXI.WebGLTransparencyHitArea.TextureData = [];
