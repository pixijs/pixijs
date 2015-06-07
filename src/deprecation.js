/*global console */
var core = require('./core'),
    mesh = require('./mesh'),
    extras = require('./extras'),
    filters = require('./filters');

/**
 * @class
 * @private
 * @name PIXI.SpriteBatch
 * @see {@link PIXI.ParticleContainer}
 * @throws {ReferenceError} SpriteBatch does not exist any more, please use the new ParticleContainer instead.
 */
core.SpriteBatch = function()
{
    throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};

/**
 * @class
 * @private
 * @name PIXI.AssetLoader
 * @see {@link PIXI.loaders.Loader}
 * @throws {ReferenceError} The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.
 */
core.AssetLoader = function()
{
    throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.');
};

Object.defineProperties(core, {

    /**
     * @class
     * @private
     * @name PIXI.Stage
     * @see {@link PIXI.Container}
     * @deprecated since version 3.0
     */
    Stage: {
        get: function()
        {
            console.warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.DisplayObjectContainer
     * @see {@link PIXI.Container}
     * @deprecated since version 3.0
     */
    DisplayObjectContainer: {
        get: function()
        {
            console.warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.Strip
     * @see {@link PIXI.mesh.Mesh}
     * @deprecated since version 3.0
     */
    Strip: {
        get: function()
        {
            console.warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
            return mesh.Mesh;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.Rope
     * @see {@link PIXI.mesh.Rope}
     * @deprecated since version 3.0
     */
    Rope: {
        get: function()
        {
            console.warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
            return mesh.Rope;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.MovieClip
     * @see {@link PIXI.MovieClip}
     * @deprecated since version 3.0
     */
    MovieClip: {
        get: function()
        {
            console.warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
            return extras.MovieClip;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.TilingSprite
     * @see {@link PIXI.TilingSprite}
     * @deprecated since version 3.0
     */
    TilingSprite: {
        get: function()
        {
            console.warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
            return extras.TilingSprite;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.BitmapText
     * @see {@link PIXI.extras.BitmapText}
     * @deprecated since version 3.0
     */
    BitmapText: {
        get: function()
        {
            console.warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
            return extras.BitmapText;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.blendModes
     * @see {@link PIXI.BLEND_MODES}
     * @deprecated since version 3.0
     */
    blendModes: {
        get: function()
        {
            console.warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
            return core.BLEND_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.scaleModes
     * @see {@link PIXI.SCALE_MODES}
     * @deprecated since version 3.0
     */
    scaleModes: {
        get: function()
        {
            console.warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
            return core.SCALE_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.BaseTextureCache
     * @see {@link PIXI.utils.BaseTextureCache}
     * @deprecated since version 3.0
     */
    BaseTextureCache: {
        get: function ()
        {
            console.warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
            return core.utils.BaseTextureCache;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.TextureCache
     * @see {@link PIXI.utils.TextureCache}
     * @deprecated since version 3.0
     */
    TextureCache: {
        get: function ()
        {
            console.warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
            return core.utils.TextureCache;
        }
    },

    /**
     * @namespace
     * @private
     * @name PIXI.math
     * @see {@link PIXI}
     * @deprecated since version 3.0.6
     */
    math: {
        get: function ()
        {
            console.warn('The math namespace is deprecated, please access members already accessible on PIXI.');
            return core;
        }
    }
});

/**
 * @method
 * @private
 * @name PIXI.Sprite#setTexture
 * @see {@link PIXI.Sprite#texture}
 * @deprecated since version 3.0
 */
core.Sprite.prototype.setTexture = function(texture)
{
    this.texture = texture;
    console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};

/**
 * @method
 * @name PIXI.extras.BitmapText#setText
 * @see {@link PIXI.BitmapText#text}
 * @deprecated since version 3.0
 */
extras.BitmapText.prototype.setText = function(text)
{
    this.text = text;
    console.warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setText
 * @see {@link PIXI.Text#text}
 * @deprecated since version 3.0
 */
core.Text.prototype.setText = function(text)
{
    this.text = text;
    console.warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setStyle
 * @see {@link PIXI.Text#style}
 * @deprecated since version 3.0
 */
core.Text.prototype.setStyle = function(style)
{
    this.style = style;
    console.warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
};

/**
 * @method
 * @name PIXI.Texture#setFrame
 * @see {@link PIXI.Texture#setFrame}
 * @deprecated since version 3.0
 */
core.Texture.prototype.setFrame = function(frame)
{
    this.frame = frame;
    console.warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
};

Object.defineProperties(filters, {

    /**
     * @class
     * @private
     * @name PIXI.filters.AbstractFilter
     * @see {@link PIXI.AbstractFilter}
     * @deprecated since version 3.0.6
     */
    AbstractFilter: {
        get: function()
        {
            console.warn('filters.AbstractFilter is an undocumented alias, please use AbstractFilter from now on.');
            return core.AbstractFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.FXAAFilter
     * @see {@link PIXI.FXAAFilter}
     * @deprecated since version 3.0.6
     */
    FXAAFilter: {
        get: function()
        {
            console.warn('filters.FXAAFilter is an undocumented alias, please use FXAAFilter from now on.');
            return core.FXAAFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.SpriteMaskFilter
     * @see {@link PIXI.SpriteMaskFilter}
     * @deprecated since version 3.0.6
     */
    SpriteMaskFilter: {
        get: function()
        {
            console.warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');
            return core.SpriteMaskFilter;
        }
    }
});

/**
 * @method
 * @name PIXI.utils.uuid
 * @see {@link PIXI.utils.uid}
 * @deprecated since version 3.0.6
 */
core.utils.uuid = function ()
{
    console.warn('utils.uuid() is deprecated, please use utils.uid() from now on.');
    return core.utils.uid();
};
