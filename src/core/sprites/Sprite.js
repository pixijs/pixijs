var Texture = require('../textures/Texture'),
    Geometry2d = require('../c2d/Geometry2d'),
    Container = require('../display/Container'),
    SpriteFrame = require('./SpriteFrame'),
    utils = require('../utils'),
    CONST = require('../const');

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 * @param texture {PIXI.Texture} The texture for this sprite
 */
function Sprite(texture, sharedFrame)
{
    Container.call(this);

    /**
     * Frame that sprite is using, read-only
     *
     * @member {PIXI.ObservablePoint}
     * @private
     */
    this._frame = sharedFrame || new SpriteFrame();

    /**
     * Frame that was passed in constructor - less objects, less memory use
     *
     * @member {PIXI.SpriteFrame}
     * @private
     */
    this._sharedFrame = sharedFrame;

    this._frameVersion = -1;

    this._width = 0;

    this._height = 0;

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @private
     */
    this._texture = null;

    /**
     * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * The shader that will be used to render the sprite. Set to null to remove a current shader.
     *
     * @member {PIXI.AbstractFilter|PIXI.Shader}
     */
    this.shader = null;

    /**
     * An internal cached value of the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.cachedTint = 0xFFFFFF;

    this.geometry = new Geometry2d();
    this.geometry.size = 4;
    // call texture setter
    this.texture = texture || Texture.EMPTY;
    this.textureDirty = true;

    this.isRaycastPossible = true;
}

// constructor
Sprite.prototype = Object.create(Container.prototype);
Sprite.prototype.constructor = Sprite;
module.exports = Sprite;

Object.defineProperties(Sprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the size to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    width: {
        get: function ()
        {
            return Math.abs(this.scale.x) * this._frame.spriteWidth;
        },
        set: function (value)
        {
            var sign = utils.sign(this.scale.x) || 1;
            this.scale.x = sign * value / this._frame.spriteWidth;
            this._width = value;
        }
    },

    /**
     * The height of the sprite, setting this will actually modify the size to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    height: {
        get: function ()
        {
            return  Math.abs(this.scale.y) * this._frame.spriteHeight;
        },
        set: function (value)
        {
            var sign = utils.sign(this.scale.y) || 1;
            this.scale.y = sign * value / this._frame.spriteHeight;
            this._height = value;
        }
    },

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.Sprite#
     */
    texture: {
        get: function ()
        {
            return  this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;
            this.cachedTint = 0xFFFFFF;

            this.textureDirty = true;

            if (value)
            {
                if (!this._sharedFrame) {
                    this._frame.textureFrame = value.orig;
                }
                // wait for the texture to load
                if (value.baseTexture.hasLoaded)
                {
                    this._onTextureUpdate();
                }
                else
                {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    },

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting the anchor to 0.5,0.5 means the texture's origin is centered
     * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
     *
     * @member {PIXI.Point | number}
     */
    anchor : {
        get : function() {
            return this._frame.anchor;
        },
        set: function(value) {
            if (typeof value === 'number'){
                this._frame.anchor.set(value);
            }
            else {
                this._frame.anchor.copy(value);
            }
        }
    },

    /**
     * Size overrides texture dimensions.
     *
     * @member {PIXI.Point | number}
     */
    size : {
        get : function() {
            return this._frame.size;
        },
        set: function(value) {
            if (typeof value === 'number'){
                this._frame.size.set(value);
            }
            else {
                this._frame.size.copy(value);
            }
        }
    }
});

Sprite.prototype.calculateVertices = function (dontForce)
{
    var _frame = this._frame;
    _frame.update();
    if (!dontForce || this._frameVersion !== _frame.version) {
        this._frameVersion = _frame.version;
        var inner = _frame.inner || _frame;
        this.geometry.setRectCoords(0, inner.x, inner.y, inner.x + inner.width, inner.y + inner.height);
    }
};

Sprite.prototype._onTextureUpdate = function () {
    if (!this._sharedFrame) {
        this.calculateVertices();
    }
    if (this._width) {
        this.scale.x = utils.sign(this.scale.x) * this._width / this._frame.width;
    }
    if (this._height) {
        this.scale.y = utils.sign(this.scale.y) * this._height / this._frame.height;
    }
};
/**
*
* Renders the object using the WebGL renderer
*
* @param renderer {PIXI.WebGLRenderer}
* @private
*/
Sprite.prototype._renderWebGL = function (renderer)
{
    this.updateGeometry();
    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};

Sprite.prototype.updateTransform = function() {
    this.calculateVertices();
    this.containerUpdateTransform();
};

/**
* Renders the object using the Canvas renderer
*
* @param renderer {PIXI.CanvasRenderer} The renderer
* @private
*/
Sprite.prototype._renderCanvas = function (renderer)
{
    renderer.plugins.sprite.render(this);
};

/**
 * Tests if a point is inside this sprite in LOCAL coordinates
 *
 * @param point {PIXI.Point || PIXI.Raycast2d || PIXI.} the point to test
 * @return {boolean} the result of the test
 */
Sprite.prototype.containsLocalPoint = function( point )
{
    var v = this.geometry.vertices;
    if ( point.x > v[0] && point.x < v[4] )
    {
        if ( point.y > v[1] && point.y < v[5] )
        {
            return true;
        }
    }

    return false;
};

/**
 * Destroys this sprite and optionally its texture and children
 *
 * @param [options] {object|boolean} Options parameter. A boolean will act as if all options have been set to that value
 * @param [options.children=false] {boolean} if set to true, all the children will have their destroy
 *      method called as well. 'options' will be passed on to those calls.
 * @param [options.texture=false] {boolean} Should it destroy the current texture of the sprite as well
 * @param [options.baseTexture=false] {boolean} Should it destroy the base texture of the sprite as well
 */
Sprite.prototype.destroy = function (options)
{
    Container.prototype.destroy.call(this, options);

    this._anchor.destroy();
    this._size.destroy();
    this._anchor = null;
    this._size = null;

    var destroyTexture = typeof options === 'boolean' ? options : options && options.texture;
    if (destroyTexture)
    {
        var destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;
        this._texture.destroy(!!destroyBaseTexture);
    }

    this._texture = null;
    this.shader = null;
};

// some helper functions..

/**
 * Helper function that creates a new sprite based on the source you provide.
 * The soucre can be - frame id, image url, video url, canvae element, video element, base texture
 *
 * @static
 * @param source {}
 * @return {PIXI.Texture} A Texture
 */
Sprite.from = function (source)
{
    return new Sprite(Texture.from(source));
};

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return new Sprite(texture);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
Sprite.fromImage = function (imageId, crossorigin, scaleMode)
{
    return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
};
