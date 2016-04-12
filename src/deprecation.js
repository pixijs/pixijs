/*global console */
var core = require('./core'),
    mesh = require('./mesh'),
    particles = require('./particles'),
    extras = require('./extras'),
    filters = require('./filters');

// provide method to give a stack track for warnings
// useful for tracking-down where deprecated methods/properties/classes
// are being used within the code
function warn(msg) {
    var stack = new Error().stack;

    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined') {
        console.warn('Deprecation Warning: ', msg);
    }
    else {
        // chop off the stack trace which includes pixi.js internal calls
        stack = stack.split('\n').splice(3).join('\n');

        if (console.groupCollapsed) {
            console.groupCollapsed('%cDeprecation Warning: %c%s', 'color:#614108;background:#fffbe6', 'font-weight:normal;color:#614108;background:#fffbe6', msg);
            console.warn(stack);
            console.groupEnd();
        }
        else {
            console.warn('Deprecation Warning: ', msg);
            console.warn(stack);
        }
    }
}

/**
 * @class
 * @private
 * @name SpriteBatch
 * @memberof PIXI
 * @see PIXI.ParticleContainer
 * @throws {ReferenceError} SpriteBatch does not exist any more, please use the new ParticleContainer instead.
 * @deprecated since version 3.0.0
 */
core.SpriteBatch = function()
{
    throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};

/**
 * @class
 * @private
 * @name AssetLoader
 * @memberof PIXI
 * @see PIXI.loaders.Loader
 * @throws {ReferenceError} The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.
 * @deprecated since version 3.0.0
 */
core.AssetLoader = function()
{
    throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.');
};

Object.defineProperties(core, {

    /**
     * @class
     * @private
     * @name Stage
     * @memberof PIXI
     * @see PIXI.Container
     * @deprecated since version 3.0.0
     */
    Stage: {
        get: function()
        {
            warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name DisplayObjectContainer
     * @memberof PIXI
     * @see PIXI.Container
     * @deprecated since version 3.0.0
     */
    DisplayObjectContainer: {
        get: function()
        {
            warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name Strip
     * @memberof PIXI
     * @see PIXI.mesh.Mesh
     * @deprecated since version 3.0.0
     */
    Strip: {
        get: function()
        {
            warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
            return mesh.Mesh;
        }
    },

    /**
     * @class
     * @private
     * @name Rope
     * @memberof PIXI
     * @see PIXI.mesh.Rope
     * @deprecated since version 3.0.0
     */
    Rope: {
        get: function()
        {
            warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
            return mesh.Rope;
        }
    },

    /**
     * @class
     * @private
     * @name ParticleContainer
     * @memberof PIXI
     * @see PIXI.particles.ParticleContainer
     * @deprecated since version 4.0.0
     */
    ParticleContainer: {
        get: function() {
            warn('The ParticleContainer class has been moved to particles.ParticleContainer, please use particles.ParticleContainer from now on.');
            return particles.ParticleContainer;
        }
    },

    /**
     * @class
     * @private
     * @name MovieClip
     * @memberof PIXI
     * @see PIXI.extras.MovieClip
     * @deprecated since version 3.0.0
     */
    MovieClip: {
        get: function()
        {
            warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
            return extras.MovieClip;
        }
    },

    /**
     * @class
     * @private
     * @name TilingSprite
     * @memberof PIXI
     * @see PIXI.extras.TilingSprite
     * @deprecated since version 3.0.0
     */
    TilingSprite: {
        get: function()
        {
            warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
            return extras.TilingSprite;
        }
    },

    /**
     * @class
     * @private
     * @name BitmapText
     * @memberof PIXI
     * @see PIXI.extras.BitmapText
     * @deprecated since version 3.0.0
     */
    BitmapText: {
        get: function()
        {
            warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
            return extras.BitmapText;
        }
    },

    /**
     * @class
     * @private
     * @name blendModes
     * @memberof PIXI
     * @see PIXI.BLEND_MODES
     * @deprecated since version 3.0.0
     */
    blendModes: {
        get: function()
        {
            warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
            return core.BLEND_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name scaleModes
     * @memberof PIXI
     * @see PIXI.SCALE_MODES
     * @deprecated since version 3.0.0
     */
    scaleModes: {
        get: function()
        {
            warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
            return core.SCALE_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name BaseTextureCache
     * @memberof PIXI
     * @see PIXI.utils.BaseTextureCache
     * @deprecated since version 3.0.0
     */
    BaseTextureCache: {
        get: function ()
        {
            warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
            return core.utils.BaseTextureCache;
        }
    },

    /**
     * @class
     * @private
     * @name TextureCache
     * @memberof PIXI
     * @see PIXI.utils.TextureCache
     * @deprecated since version 3.0.0
     */
    TextureCache: {
        get: function ()
        {
            warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
            return core.utils.TextureCache;
        }
    },

    /**
     * @namespace
     * @private
     * @name math
     * @memberof PIXI
     * @see PIXI
     * @deprecated since version 3.0.6
     */
    math: {
        get: function ()
        {
            warn('The math namespace is deprecated, please access members already accessible on PIXI.');
            return core;
        }
    },

     /**
     * @class
     * @private
     * @name PIXI.AbstractFilter
     * @see PIXI.Filter
     * @deprecated since version 3.0.6
     */
    AbstractFilter: {
        get: function()
        {
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');
            return core.Filter;
        }
    },
});

core.DisplayObject.prototype.generateTexture = function(renderer, scaleMode, resolution)
{
    warn('generateTexture has moved to the renderer, please use renderer.generateTexture(displayObject)');
    return renderer.generateTexture(renderer, scaleMode, resolution);
};


core.Graphics.prototype.generateTexture = function(scaleMode, resolution)
{
    warn('graphics generate texture has moved to the renderer. Or to render a graphics to a texture using canvas please use generateCanvasTexture');
    return this.generateCanvasTexture(scaleMode, resolution);
};

core.RenderTexture.prototype.render = function(displayObject, matrix, clear, updateTransform)
{
    this.legacyRenderer.render(displayObject, this, clear, matrix, !updateTransform);
    warn('RenderTexture.render is now deprecated, please use renderer.render(displayObject, renderTexture)');
};

core.RenderTexture.prototype.getImage = function(target)
{
    warn('RenderTexture.getImage is now deprecated, please use renderer.extract.image(target)');
    return this.legacyRenderer.extract.image(target);
};

core.RenderTexture.prototype.getBase64 = function(target)
{
    warn('RenderTexture.getBase64 is now deprecated, please use renderer.extract.base64(target)');
    this.legacyRenderer.extract.base64(target);
};

core.RenderTexture.prototype.getCanvas = function(target)
{
    warn('RenderTexture.getCanvas is now deprecated, please use renderer.extract.canvas(target)');
    this.legacyRenderer.extract.canvas(target);
};

core.RenderTexture.prototype.getPixels = function(target)
{
    warn('RenderTexture.getPixels is now deprecated, please use renderer.extract.pixels(target)');
    this.legacyRenderer.pixels(target);
};



/**
 * @method
 * @private
 * @name PIXI.Sprite#setTexture
 * @see PIXI.Sprite#texture
 * @deprecated since version 3.0.0
 */
core.Sprite.prototype.setTexture = function(texture)
{
    this.texture = texture;
    warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};



/**
 * @method
 * @name PIXI.extras.BitmapText#setText
 * @see PIXI.extras.BitmapText#text
 * @deprecated since version 3.0.0
 */
extras.BitmapText.prototype.setText = function(text)
{
    this.text = text;
    warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setText
 * @see PIXI.Text#text
 * @deprecated since version 3.0.0
 */
core.Text.prototype.setText = function(text)
{
    this.text = text;
    warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setStyle
 * @see PIXI.Text#style
 * @deprecated since version 3.0.0
 */
core.Text.prototype.setStyle = function(style)
{
    this.style = style;
    warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
};

/**
 * @method
 * @name PIXI.Texture#setFrame
 * @see PIXI.Texture#setFrame
 * @deprecated since version 3.0.0
 */
core.Texture.prototype.setFrame = function(frame)
{
    this.frame = frame;
    warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
};

Object.defineProperties(filters, {

    /**
     * @class
     * @private
     * @name PIXI.filters.AbstractFilter
     * @see PIXI.AbstractFilter
     * @deprecated since version 3.0.6
     */
    AbstractFilter: {
        get: function()
        {
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');
            return core.AbstractFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.FXAAFilter
     * @see PIXI.FXAAFilter
     * @deprecated since version 3.0.6
     */
    FXAAFilter: {
        get: function()
        {
            warn('filters.FXAAFilter is an undocumented alias, please use FXAAFilter from now on.');
            return core.FXAAFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.SpriteMaskFilter
     * @see PIXI.SpriteMaskFilter
     * @deprecated since version 3.0.6
     */
    SpriteMaskFilter: {
        get: function()
        {
            warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');
            return core.SpriteMaskFilter;
        }
    }
});

/**
 * @method
 * @name PIXI.utils.uuid
 * @see PIXI.utils.uid
 * @deprecated since version 3.0.6
 */
core.utils.uuid = function ()
{
    warn('utils.uuid() is deprecated, please use utils.uid() from now on.');
    return core.utils.uid();
};

core.utils.canUseNewCanvasBlendModes = function() {
    warn('utils.canUseNewCanvasBlendModes() is deprecated, please use CanvasTinter.canUseMultiply from now on');
    return core.CanvasTinter.canUseMultiply;
};

