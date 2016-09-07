/*global console */
var core = require('./core'),
    mesh = require('./mesh'),
    particles = require('./particles'),
    extras = require('./extras'),
    filters = require('./filters');

// @if DEBUG
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
// @endif

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
            // @if DEBUG
            warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
            // @endif
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
            // @if DEBUG
            warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
            // @endif
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
            // @if DEBUG
            warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
            // @endif
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
            // @if DEBUG
            warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
            // @endif
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
            // @if DEBUG
            warn('The ParticleContainer class has been moved to particles.ParticleContainer, please use particles.ParticleContainer from now on.');
            // @endif
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
            // @if DEBUG
            warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
            // @endif
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
            // @if DEBUG
            warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
            // @endif
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
            // @if DEBUG
            warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
            // @endif
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
            // @if DEBUG
            warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
            // @endif
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
            // @if DEBUG
            warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
            // @endif
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
            // @if DEBUG
            warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
            // @endif
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
            // @if DEBUG
            warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
            // @endif
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
            // @if DEBUG
            warn('The math namespace is deprecated, please access members already accessible on PIXI.');
            // @endif
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
            // @if DEBUG
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');
            // @endif
            return core.Filter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.TransformManual
     * @see PIXI.TransformBase
     * @deprecated since version 4.0.0
     */
    TransformManual: {
        get: function()
        {
            // @if DEBUG
            warn('TransformManual has been renamed to TransformBase, please update your pixi-spine');
            // @endif
            return core.TransformBase;
        }
    }
});

core.DisplayObject.prototype.generateTexture = function(renderer, scaleMode, resolution)
{
    // @if DEBUG
    warn('generateTexture has moved to the renderer, please use renderer.generateTexture(displayObject)');
    // @endif
    return renderer.generateTexture(this, scaleMode, resolution);
};


core.Graphics.prototype.generateTexture = function(scaleMode, resolution)
{
    // @if DEBUG
    warn('graphics generate texture has moved to the renderer. Or to render a graphics to a texture using canvas please use generateCanvasTexture');
    // @endif
    return this.generateCanvasTexture(scaleMode, resolution);
};

core.RenderTexture.prototype.render = function(displayObject, matrix, clear, updateTransform)
{
    this.legacyRenderer.render(displayObject, this, clear, matrix, !updateTransform);
    // @if DEBUG
    warn('RenderTexture.render is now deprecated, please use renderer.render(displayObject, renderTexture)');
    // @endif
};

core.RenderTexture.prototype.getImage = function(target)
{
    // @if DEBUG
    warn('RenderTexture.getImage is now deprecated, please use renderer.extract.image(target)');
    // @endif
    return this.legacyRenderer.extract.image(target);
};

core.RenderTexture.prototype.getBase64 = function(target)
{
    // @if DEBUG
    warn('RenderTexture.getBase64 is now deprecated, please use renderer.extract.base64(target)');
    // @endif
    return this.legacyRenderer.extract.base64(target);
};

core.RenderTexture.prototype.getCanvas = function(target)
{
    // @if DEBUG
    warn('RenderTexture.getCanvas is now deprecated, please use renderer.extract.canvas(target)');
    // @endif
    return this.legacyRenderer.extract.canvas(target);
};

core.RenderTexture.prototype.getPixels = function(target)
{
    // @if DEBUG
    warn('RenderTexture.getPixels is now deprecated, please use renderer.extract.pixels(target)');
    // @endif
    return this.legacyRenderer.pixels(target);
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
    // @if DEBUG
    warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
    // @endif
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
    // @if DEBUG
    warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
    // @endif
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
    // @if DEBUG
    warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
    // @endif
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
    // @if DEBUG
    warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
    // @endif
};

Object.defineProperties(core.TextStyle.prototype, {
    /**
     * Set all properties of a font as a single string
     *
     * @name PIXI.TextStyle#font
     * @deprecated since version 4.0.0
     */
    font: {
        get: function ()
        {
            // @if DEBUG
            warn('text style property \'font\' is now deprecated, please use the \'fontFamily\',\'fontSize\',fontStyle\',\'fontVariant\' and \'fontWeight\' properties from now on');
            // @endif
            var fontSizeString = (typeof this._fontSize === 'number') ? this._fontSize + 'px' : this._fontSize;
            return this._fontStyle + ' ' + this._fontVariant + ' ' + this._fontWeight + ' ' + fontSizeString + ' ' + this._fontFamily;
        },
        set: function (font)
        {
            // @if DEBUG
            warn('text style property \'font\' is now deprecated, please use the \'fontFamily\',\'fontSize\',fontStyle\',\'fontVariant\' and \'fontWeight\' properties from now on');
            // @endif

            // can work out fontStyle from search of whole string
            if ( font.indexOf('italic') > 1 )
            {
                this._fontStyle = 'italic';
            }
            else if ( font.indexOf('oblique') > -1 )
            {
                this._fontStyle = 'oblique';
            }
            else
            {
                this._fontStyle = 'normal';
            }

            // can work out fontVariant from search of whole string
            if ( font.indexOf('small-caps') > -1 )
            {
                this._fontVariant = 'small-caps';
            }
            else
            {
                this._fontVariant = 'normal';
            }

            // fontWeight and fontFamily are tricker to find, but it's easier to find the fontSize due to it's units
            var splits = font.split(' ');
            var i;
            var fontSizeIndex = -1;

            this._fontSize = 26;
            for ( i = 0; i < splits.length; ++i )
            {
                if ( splits[i].match( /(px|pt|em|%)/ ) )
                {
                    fontSizeIndex = i;
                    this._fontSize = splits[i];
                    break;
                }
            }

            // we can now search for fontWeight as we know it must occur before the fontSize
            this._fontWeight = 'normal';
            for ( i = 0; i < fontSizeIndex; ++i )
            {
                if ( splits[i].match( /(bold|bolder|lighter|100|200|300|400|500|600|700|800|900)/ ) )
                {
                    this._fontWeight = splits[i];
                    break;
                }
            }

            // and finally join everything together after the fontSize in case the font family has multiple words
            if ( fontSizeIndex > -1 && fontSizeIndex < splits.length-1 )
            {
                this._fontFamily = '';
                for ( i = fontSizeIndex + 1; i < splits.length; ++i )
                {
                    this._fontFamily += splits[i] + ' ';
                }

                this._fontFamily = this._fontFamily.slice(0, -1);
            }
            else
            {
                this._fontFamily = 'Arial';
            }

            this.styleID++;
        }
    }
} );

/**
 * @method
 * @name PIXI.Texture#setFrame
 * @see PIXI.Texture#setFrame
 * @deprecated since version 3.0.0
 */
core.Texture.prototype.setFrame = function(frame)
{
    this.frame = frame;
    // @if DEBUG
    warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
    // @endif
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
            // @if DEBUG
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');
            // @endif
            return core.AbstractFilter;
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
            // @if DEBUG
            warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');
            // @endif
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
    // @if DEBUG
    warn('utils.uuid() is deprecated, please use utils.uid() from now on.');
    // @endif
    return core.utils.uid();
};

/**
 * @method
 * @name PIXI.utils.canUseNewCanvasBlendModes
 * @see PIXI.CanvasTinter
 * @deprecated
 */
core.utils.canUseNewCanvasBlendModes = function() {
    // @if DEBUG
    warn('utils.canUseNewCanvasBlendModes() is deprecated, please use CanvasTinter.canUseMultiply from now on');
    // @endif
    return core.CanvasTinter.canUseMultiply;
};