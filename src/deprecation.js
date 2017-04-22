// provide method to give a stack track for warnings
// useful for tracking-down where deprecated methods/properties/classes
// are being used within the code
function warn(msg)
{
    // @if DEBUG
    /* eslint-disable no-console */
    let stack = new Error().stack;

    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined')
    {
        console.warn('Deprecation Warning: ', msg);
    }
    else
    {
        // chop off the stack trace which includes pixi.js internal calls
        stack = stack.split('\n').splice(3).join('\n');

        if (console.groupCollapsed)
        {
            console.groupCollapsed(
                '%cDeprecation Warning: %c%s',
                'color:#614108;background:#fffbe6',
                'font-weight:normal;color:#614108;background:#fffbe6',
                msg
            );
            console.warn(stack);
            console.groupEnd();
        }
        else
        {
            console.warn('Deprecation Warning: ', msg);
            console.warn(stack);
        }
    }
    /* eslint-enable no-console */
    // @endif
}

export default function deprecation(core)
{
    const { mesh, particles, extras, filters, prepare, loaders, interaction } = core;

    Object.defineProperties(core, {

        /**
         * @class
         * @private
         * @name SpriteBatch
         * @memberof PIXI
         * @see PIXI.ParticleContainer
         * @throws {ReferenceError} SpriteBatch does not exist any more, please use the new ParticleContainer instead.
         * @deprecated since version 3.0.0
         */
        SpriteBatch: {
            get()
            {
                throw new ReferenceError('SpriteBatch does not exist any more, '
                    + 'please use the new ParticleContainer instead.');
            },
        },

        /**
         * @class
         * @private
         * @name AssetLoader
         * @memberof PIXI
         * @see PIXI.loaders.Loader
         * @throws {ReferenceError} The loader system was overhauled in pixi v3,
         * please see the new PIXI.loaders.Loader class.
         * @deprecated since version 3.0.0
         */
        AssetLoader: {
            get()
            {
                throw new ReferenceError('The loader system was overhauled in pixi v3, '
                    + 'please see the new PIXI.loaders.Loader class.');
            },
        },

        /**
         * @class
         * @private
         * @name Stage
         * @memberof PIXI
         * @see PIXI.Container
         * @deprecated since version 3.0.0
         */
        Stage: {
            get()
            {
                warn('You do not need to use a PIXI Stage any more, you can simply render any container.');

                return core.Container;
            },
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
            get()
            {
                warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');

                return core.Container;
            },
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
            get()
            {
                warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');

                return mesh.Mesh;
            },
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
            get()
            {
                warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');

                return mesh.Rope;
            },
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
            get()
            {
                warn('The ParticleContainer class has been moved to particles.ParticleContainer, '
                    + 'please use particles.ParticleContainer from now on.');

                return particles.ParticleContainer;
            },
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
            get()
            {
                warn('The MovieClip class has been moved to extras.AnimatedSprite, please use extras.AnimatedSprite.');

                return extras.AnimatedSprite;
            },
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
            get()
            {
                warn('The TilingSprite class has been moved to extras.TilingSprite, '
                    + 'please use extras.TilingSprite from now on.');

                return extras.TilingSprite;
            },
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
            get()
            {
                warn('The BitmapText class has been moved to extras.BitmapText, '
                    + 'please use extras.BitmapText from now on.');

                return extras.BitmapText;
            },
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
            get()
            {
                warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');

                return core.BLEND_MODES;
            },
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
            get()
            {
                warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');

                return core.SCALE_MODES;
            },
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
            get()
            {
                warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, '
                    + 'please use utils.BaseTextureCache from now on.');

                return core.utils.BaseTextureCache;
            },
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
            get()
            {
                warn('The TextureCache class has been moved to utils.TextureCache, '
                    + 'please use utils.TextureCache from now on.');

                return core.utils.TextureCache;
            },
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
            get()
            {
                warn('The math namespace is deprecated, please access members already accessible on PIXI.');

                return core;
            },
        },

        /**
         * @class
         * @private
         * @name PIXI.AbstractFilter
         * @see PIXI.Filter
         * @deprecated since version 3.0.6
         */
        AbstractFilter: {
            get()
            {
                warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');

                return core.Filter;
            },
        },

        /**
         * @class
         * @private
         * @name PIXI.TransformManual
         * @see PIXI.TransformBase
         * @deprecated since version 4.0.0
         */
        TransformManual: {
            get()
            {
                warn('TransformManual has been renamed to TransformBase, please update your pixi-spine');

                return core.TransformBase;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.TARGET_FPMS
         * @see PIXI.settings.TARGET_FPMS
         * @deprecated since version 4.2.0
         */
        TARGET_FPMS: {
            get()
            {
                warn('PIXI.TARGET_FPMS has been deprecated, please use PIXI.settings.TARGET_FPMS');

                return core.settings.TARGET_FPMS;
            },
            set(value)
            {
                warn('PIXI.TARGET_FPMS has been deprecated, please use PIXI.settings.TARGET_FPMS');

                core.settings.TARGET_FPMS = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.FILTER_RESOLUTION
         * @see PIXI.settings.FILTER_RESOLUTION
         * @deprecated since version 4.2.0
         */
        FILTER_RESOLUTION: {
            get()
            {
                warn('PIXI.FILTER_RESOLUTION has been deprecated, please use PIXI.settings.FILTER_RESOLUTION');

                return core.settings.FILTER_RESOLUTION;
            },
            set(value)
            {
                warn('PIXI.FILTER_RESOLUTION has been deprecated, please use PIXI.settings.FILTER_RESOLUTION');

                core.settings.FILTER_RESOLUTION = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.RESOLUTION
         * @see PIXI.settings.RESOLUTION
         * @deprecated since version 4.2.0
         */
        RESOLUTION: {
            get()
            {
                warn('PIXI.RESOLUTION has been deprecated, please use PIXI.settings.RESOLUTION');

                return core.settings.RESOLUTION;
            },
            set(value)
            {
                warn('PIXI.RESOLUTION has been deprecated, please use PIXI.settings.RESOLUTION');

                core.settings.RESOLUTION = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.MIPMAP_TEXTURES
         * @see PIXI.settings.MIPMAP_TEXTURES
         * @deprecated since version 4.2.0
         */
        MIPMAP_TEXTURES: {
            get()
            {
                warn('PIXI.MIPMAP_TEXTURES has been deprecated, please use PIXI.settings.MIPMAP_TEXTURES');

                return core.settings.MIPMAP_TEXTURES;
            },
            set(value)
            {
                warn('PIXI.MIPMAP_TEXTURES has been deprecated, please use PIXI.settings.MIPMAP_TEXTURES');

                core.settings.MIPMAP_TEXTURES = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.SPRITE_BATCH_SIZE
         * @see PIXI.settings.SPRITE_BATCH_SIZE
         * @deprecated since version 4.2.0
         */
        SPRITE_BATCH_SIZE: {
            get()
            {
                warn('PIXI.SPRITE_BATCH_SIZE has been deprecated, please use PIXI.settings.SPRITE_BATCH_SIZE');

                return core.settings.SPRITE_BATCH_SIZE;
            },
            set(value)
            {
                warn('PIXI.SPRITE_BATCH_SIZE has been deprecated, please use PIXI.settings.SPRITE_BATCH_SIZE');

                core.settings.SPRITE_BATCH_SIZE = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.SPRITE_MAX_TEXTURES
         * @see PIXI.settings.SPRITE_MAX_TEXTURES
         * @deprecated since version 4.2.0
         */
        SPRITE_MAX_TEXTURES: {
            get()
            {
                warn('PIXI.SPRITE_MAX_TEXTURES has been deprecated, please use PIXI.settings.SPRITE_MAX_TEXTURES');

                return core.settings.SPRITE_MAX_TEXTURES;
            },
            set(value)
            {
                warn('PIXI.SPRITE_MAX_TEXTURES has been deprecated, please use PIXI.settings.SPRITE_MAX_TEXTURES');

                core.settings.SPRITE_MAX_TEXTURES = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.RETINA_PREFIX
         * @see PIXI.settings.RETINA_PREFIX
         * @deprecated since version 4.2.0
         */
        RETINA_PREFIX: {
            get()
            {
                warn('PIXI.RETINA_PREFIX has been deprecated, please use PIXI.settings.RETINA_PREFIX');

                return core.settings.RETINA_PREFIX;
            },
            set(value)
            {
                warn('PIXI.RETINA_PREFIX has been deprecated, please use PIXI.settings.RETINA_PREFIX');

                core.settings.RETINA_PREFIX = value;
            },
        },

        /**
         * @static
         * @constant
         * @name PIXI.DEFAULT_RENDER_OPTIONS
         * @see PIXI.settings.RENDER_OPTIONS
         * @deprecated since version 4.2.0
         */
        DEFAULT_RENDER_OPTIONS: {
            get()
            {
                warn('PIXI.DEFAULT_RENDER_OPTIONS has been deprecated, please use PIXI.settings.DEFAULT_RENDER_OPTIONS');

                return core.settings.RENDER_OPTIONS;
            },
        },
    });

    // Move the default properties to settings
    const defaults = [
        { parent: 'TRANSFORM_MODE', target: 'TRANSFORM_MODE' },
        { parent: 'GC_MODES', target: 'GC_MODE' },
        { parent: 'WRAP_MODES', target: 'WRAP_MODE' },
        { parent: 'SCALE_MODES', target: 'SCALE_MODE' },
        { parent: 'PRECISION', target: 'PRECISION_FRAGMENT' },
    ];

    for (let i = 0; i < defaults.length; i++)
    {
        const deprecation = defaults[i];

        Object.defineProperty(core[deprecation.parent], 'DEFAULT', {
            get()
            {
                warn(`PIXI.${deprecation.parent}.DEFAULT has been deprecated, `
                    + `please use PIXI.settings.${deprecation.target}`);

                return core.settings[deprecation.target];
            },
            set(value)
            {
                warn(`PIXI.${deprecation.parent}.DEFAULT has been deprecated, `
                    + `please use PIXI.settings.${deprecation.target}`);

                core.settings[deprecation.target] = value;
            },
        });
    }

    Object.defineProperties(core.settings, {

        /**
         * @static
         * @name PRECISION
         * @memberof PIXI.settings
         * @see PIXI.PRECISION
         * @deprecated since version 4.4.0
         */
        PRECISION: {
            get()
            {
                warn('PIXI.settings.PRECISION has been deprecated, please use PIXI.settings.PRECISION_FRAGMENT');

                return core.settings.PRECISION_FRAGMENT;
            },
            set(value)
            {
                warn('PIXI.settings.PRECISION has been deprecated, please use PIXI.settings.PRECISION_FRAGMENT');

                core.settings.PRECISION_FRAGMENT = value;
            },
        },
    });

    Object.defineProperties(extras, {

        /**
         * @class
         * @name MovieClip
         * @memberof PIXI.extras
         * @see PIXI.extras.AnimatedSprite
         * @deprecated since version 4.2.0
         */
        MovieClip: {
            get()
            {
                warn('The MovieClip class has been renamed to AnimatedSprite, please use AnimatedSprite from now on.');

                return extras.AnimatedSprite;
            },
        },
    });

    core.DisplayObject.prototype.generateTexture = function generateTexture(renderer, scaleMode, resolution)
    {
        warn('generateTexture has moved to the renderer, please use renderer.generateTexture(displayObject)');

        return renderer.generateTexture(this, scaleMode, resolution);
    };

    core.Graphics.prototype.generateTexture = function generateTexture(scaleMode, resolution)
    {
        warn('graphics generate texture has moved to the renderer. '
            + 'Or to render a graphics to a texture using canvas please use generateCanvasTexture');

        return this.generateCanvasTexture(scaleMode, resolution);
    };

    core.RenderTexture.prototype.render = function render(displayObject, matrix, clear, updateTransform)
    {
        this.legacyRenderer.render(displayObject, this, clear, matrix, !updateTransform);
        warn('RenderTexture.render is now deprecated, please use renderer.render(displayObject, renderTexture)');
    };

    core.RenderTexture.prototype.getImage = function getImage(target)
    {
        warn('RenderTexture.getImage is now deprecated, please use renderer.extract.image(target)');

        return this.legacyRenderer.extract.image(target);
    };

    core.RenderTexture.prototype.getBase64 = function getBase64(target)
    {
        warn('RenderTexture.getBase64 is now deprecated, please use renderer.extract.base64(target)');

        return this.legacyRenderer.extract.base64(target);
    };

    core.RenderTexture.prototype.getCanvas = function getCanvas(target)
    {
        warn('RenderTexture.getCanvas is now deprecated, please use renderer.extract.canvas(target)');

        return this.legacyRenderer.extract.canvas(target);
    };

    core.RenderTexture.prototype.getPixels = function getPixels(target)
    {
        warn('RenderTexture.getPixels is now deprecated, please use renderer.extract.pixels(target)');

        return this.legacyRenderer.pixels(target);
    };

    /**
     * @method
     * @private
     * @name PIXI.Sprite#setTexture
     * @see PIXI.Sprite#texture
     * @deprecated since version 3.0.0
     * @param {PIXI.Texture} texture - The texture to set to.
     */
    core.Sprite.prototype.setTexture = function setTexture(texture)
    {
        this.texture = texture;
        warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
    };

    /**
     * @method
     * @name PIXI.extras.BitmapText#setText
     * @see PIXI.extras.BitmapText#text
     * @deprecated since version 3.0.0
     * @param {string} text - The text to set to.
     */
    extras.BitmapText.prototype.setText = function setText(text)
    {
        this.text = text;
        warn(`setText is now deprecated, please use the text property, e.g : myBitmapText.text = 'my text';`);
    };

    /**
     * @method
     * @name PIXI.Text#setText
     * @see PIXI.Text#text
     * @deprecated since version 3.0.0
     * @param {string} text - The text to set to.
     */
    core.Text.prototype.setText = function setText(text)
    {
        this.text = text;
        warn(`setText is now deprecated, please use the text property, e.g : myText.text = 'my text';`);
    };

    /**
     * Calculates the ascent, descent and fontSize of a given fontStyle
     *
     * @name PIXI.Text.calculateFontProperties
     * @see PIXI.TextMetrics.measureFont
     * @deprecated since version 4.5.0
     * @param {string} font - String representing the style of the font
     * @return {Object} Font properties object
     */
    core.Text.calculateFontProperties = function calculateFontProperties(font)
    {
        warn(`Text.calculateFontProperties is now deprecated, please use the TextMetrics.measureFont`);

        return core.TextMetrics.measureFont(font);
    };

    Object.defineProperties(core.Text, {
        fontPropertiesCache: {
            get()
            {
                warn(`Text.fontPropertiesCache is deprecated`);

                return core.TextMetrics._fonts;
            },
        },
        fontPropertiesCanvas: {
            get()
            {
                warn(`Text.fontPropertiesCanvas is deprecated`);

                return core.TextMetrics._canvas;
            },
        },
        fontPropertiesContext: {
            get()
            {
                warn(`Text.fontPropertiesContext is deprecated`);

                return core.TextMetrics._context;
            },
        },
    });

    /**
     * @method
     * @name PIXI.Text#setStyle
     * @see PIXI.Text#style
     * @deprecated since version 3.0.0
     * @param {*} style - The style to set to.
     */
    core.Text.prototype.setStyle = function setStyle(style)
    {
        this.style = style;
        warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
    };

    /**
     * @method
     * @name PIXI.Text#determineFontProperties
     * @see PIXI.Text#measureFontProperties
     * @deprecated since version 4.2.0
     * @private
     * @param {string} fontStyle - String representing the style of the font
     * @return {Object} Font properties object
     */
    core.Text.prototype.determineFontProperties = function determineFontProperties(fontStyle)
    {
        warn('determineFontProperties is now deprecated, please use TextMetrics.measureFont method');

        return core.TextMetrics.measureFont(fontStyle);
    };

    /**
     * @method
     * @name PIXI.Text.getFontStyle
     * @see PIXI.TextMetrics.getFontStyle
     * @deprecated since version 4.5.0
     * @param {PIXI.TextStyle} style - The style to use.
     * @return {string} Font string
     */
    core.Text.getFontStyle = function getFontStyle(style)
    {
        warn('getFontStyle is now deprecated, please use TextStyle.toFontString() instead');

        style = style || {};

        if (!(style instanceof core.TextStyle))
        {
            style = new core.TextStyle(style);
        }

        return style.toFontString();
    };

    Object.defineProperties(core.TextStyle.prototype, {
        /**
         * Set all properties of a font as a single string
         *
         * @name PIXI.TextStyle#font
         * @deprecated since version 4.0.0
         */
        font: {
            get()
            {
                warn(`text style property 'font' is now deprecated, please use the `
                    + `'fontFamily', 'fontSize', 'fontStyle', 'fontVariant' and 'fontWeight' properties from now on`);

                const fontSizeString = (typeof this._fontSize === 'number') ? `${this._fontSize}px` : this._fontSize;

                return `${this._fontStyle} ${this._fontVariant} ${this._fontWeight} ${fontSizeString} ${this._fontFamily}`;
            },
            set(font)
            {
                warn(`text style property 'font' is now deprecated, please use the `
                    + `'fontFamily','fontSize',fontStyle','fontVariant' and 'fontWeight' properties from now on`);

                // can work out fontStyle from search of whole string
                if (font.indexOf('italic') > 1)
                {
                    this._fontStyle = 'italic';
                }
                else if (font.indexOf('oblique') > -1)
                {
                    this._fontStyle = 'oblique';
                }
                else
                {
                    this._fontStyle = 'normal';
                }

                // can work out fontVariant from search of whole string
                if (font.indexOf('small-caps') > -1)
                {
                    this._fontVariant = 'small-caps';
                }
                else
                {
                    this._fontVariant = 'normal';
                }

                // fontWeight and fontFamily are tricker to find, but it's easier to find the fontSize due to it's units
                const splits = font.split(' ');
                let fontSizeIndex = -1;

                this._fontSize = 26;
                for (let i = 0; i < splits.length; ++i)
                {
                    if (splits[i].match(/(px|pt|em|%)/))
                    {
                        fontSizeIndex = i;
                        this._fontSize = splits[i];
                        break;
                    }
                }

                // we can now search for fontWeight as we know it must occur before the fontSize
                this._fontWeight = 'normal';
                for (let i = 0; i < fontSizeIndex; ++i)
                {
                    if (splits[i].match(/(bold|bolder|lighter|100|200|300|400|500|600|700|800|900)/))
                    {
                        this._fontWeight = splits[i];
                        break;
                    }
                }

                // and finally join everything together after the fontSize in case the font family has multiple words
                if (fontSizeIndex > -1 && fontSizeIndex < splits.length - 1)
                {
                    this._fontFamily = '';
                    for (let i = fontSizeIndex + 1; i < splits.length; ++i)
                    {
                        this._fontFamily += `${splits[i]} `;
                    }

                    this._fontFamily = this._fontFamily.slice(0, -1);
                }
                else
                {
                    this._fontFamily = 'Arial';
                }

                this.styleID++;
            },
        },
    });

    /**
     * @method
     * @name PIXI.Texture#setFrame
     * @see PIXI.Texture#setFrame
     * @deprecated since version 3.0.0
     * @param {PIXI.Rectangle} frame - The frame to set.
     */
    core.Texture.prototype.setFrame = function setFrame(frame)
    {
        this.frame = frame;
        warn('setFrame is now deprecated, please use the frame property, e.g: myTexture.frame = frame;');
    };

    /**
     * @static
     * @function
     * @name PIXI.Texture.addTextureToCache
     * @see PIXI.Texture.addToCache
     * @deprecated since 4.5.0
     * @param {PIXI.Texture} texture - The Texture to add to the cache.
     * @param {string} id - The id that the texture will be stored against.
     */
    core.Texture.addTextureToCache = function addTextureToCache(texture, id)
    {
        core.Texture.addToCache(texture, id);
        warn('Texture.addTextureToCache is deprecated, please use Texture.addToCache from now on.');
    };

    /**
     * @static
     * @function
     * @name PIXI.Texture.removeTextureFromCache
     * @see PIXI.Texture.removeFromCache
     * @deprecated since 4.5.0
     * @param {string} id - The id of the texture to be removed
     * @return {PIXI.Texture|null} The texture that was removed
     */
    core.Texture.removeTextureFromCache = function removeTextureFromCache(id)
    {
        warn('Texture.removeTextureFromCache is deprecated, please use Texture.removeFromCache from now on. '
         + 'Be aware that Texture.removeFromCache does not automatically its BaseTexture from the BaseTextureCache. '
         + 'For that, use BaseTexture.removeFromCache');

        core.BaseTexture.removeFromCache(id);

        return core.Texture.removeFromCache(id);
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
            get()
            {
                warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');

                return core.AbstractFilter;
            },
        },

        /**
         * @class
         * @private
         * @name PIXI.filters.SpriteMaskFilter
         * @see PIXI.SpriteMaskFilter
         * @deprecated since version 3.0.6
         */
        SpriteMaskFilter: {
            get()
            {
                warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');

                return core.SpriteMaskFilter;
            },
        },
    });

    /**
     * @method
     * @name PIXI.utils.uuid
     * @see PIXI.utils.uid
     * @deprecated since version 3.0.6
     * @return {number} The uid
     */
    core.utils.uuid = () =>
    {
        warn('utils.uuid() is deprecated, please use utils.uid() from now on.');

        return core.utils.uid();
    };

    /**
     * @method
     * @name PIXI.utils.canUseNewCanvasBlendModes
     * @see PIXI.CanvasTinter
     * @deprecated
     * @return {boolean} Can use blend modes.
     */
    core.utils.canUseNewCanvasBlendModes = () =>
    {
        warn('utils.canUseNewCanvasBlendModes() is deprecated, please use CanvasTinter.canUseMultiply from now on');

        return core.CanvasTinter.canUseMultiply;
    };

    let saidHello = true;

    /**
     * @name PIXI.utils._saidHello
     * @type {boolean}
     * @see PIXI.utils.skipHello
     * @deprecated since 4.1.0
     */
    Object.defineProperty(core.utils, '_saidHello', {
        set(bool)
        {
            if (bool)
            {
                warn('PIXI.utils._saidHello is deprecated, please use PIXI.utils.skipHello()');
                this.skipHello();
            }
            saidHello = bool;
        },
        get()
        {
            return saidHello;
        },
    });

    /**
     * @method
     * @name PIXI.prepare.BasePrepare#register
     * @see PIXI.prepare.BasePrepare#registerFindHook
     * @deprecated since version 4.4.2
     * @param {Function} [addHook] - Function call that takes two parameters: `item:*, queue:Array`
     *        function must return `true` if it was able to add item to the queue.
     * @param {Function} [uploadHook] - Function call that takes two parameters: `prepare:CanvasPrepare, item:*` and
     *        function must return `true` if it was able to handle upload of item.
     * @return {PIXI.BasePrepare} Instance of plugin for chaining.
     */
    prepare.BasePrepare.prototype.register = function register(addHook, uploadHook)
    {
        warn('renderer.plugins.prepare.register is now deprecated, '
            + 'please use renderer.plugins.prepare.registerFindHook & renderer.plugins.prepare.registerUploadHook');

        if (addHook)
        {
            this.registerFindHook(addHook);
        }

        if (uploadHook)
        {
            this.registerUploadHook(uploadHook);
        }

        return this;
    };

    /**
     * The number of graphics or textures to upload to the GPU.
     *
     * @name PIXI.prepare.canvas.UPLOADS_PER_FRAME
     * @static
     * @type {number}
     * @see PIXI.prepare.BasePrepare.limiter
     * @deprecated since 4.2.0
     */
    Object.defineProperty(prepare.canvas, 'UPLOADS_PER_FRAME', {
        set()
        {
            warn('PIXI.CanvasPrepare.UPLOADS_PER_FRAME has been removed. Please set '
                + 'renderer.plugins.prepare.limiter.maxItemsPerFrame on your renderer');
            // because we don't have a reference to the renderer, we can't actually set
            // the uploads per frame, so we'll have to stick with the warning.
        },
        get()
        {
            warn('PIXI.CanvasPrepare.UPLOADS_PER_FRAME has been removed. Please use '
                + 'renderer.plugins.prepare.limiter');

            return NaN;
        },
    });

    /**
     * The number of graphics or textures to upload to the GPU.
     *
     * @name PIXI.prepare.webgl.UPLOADS_PER_FRAME
     * @static
     * @type {number}
     * @see PIXI.prepare.BasePrepare.limiter
     * @deprecated since 4.2.0
     */
    Object.defineProperty(prepare.webgl, 'UPLOADS_PER_FRAME', {
        set()
        {
            warn('PIXI.WebGLPrepare.UPLOADS_PER_FRAME has been removed. Please set '
                + 'renderer.plugins.prepare.limiter.maxItemsPerFrame on your renderer');
            // because we don't have a reference to the renderer, we can't actually set
            // the uploads per frame, so we'll have to stick with the warning.
        },
        get()
        {
            warn('PIXI.WebGLPrepare.UPLOADS_PER_FRAME has been removed. Please use '
                + 'renderer.plugins.prepare.limiter');

            return NaN;
        },
    });

    if (loaders.Loader)
    {
        const Resource = loaders.Resource;
        const Loader = loaders.Loader;

        Object.defineProperties(Resource.prototype, {
            isJson: {
                get()
                {
                    warn('The isJson property is deprecated, please use `resource.type === Resource.TYPE.JSON`.');

                    return this.type === Resource.TYPE.JSON;
                },
            },
            isXml: {
                get()
                {
                    warn('The isXml property is deprecated, please use `resource.type === Resource.TYPE.XML`.');

                    return this.type === Resource.TYPE.XML;
                },
            },
            isImage: {
                get()
                {
                    warn('The isImage property is deprecated, please use `resource.type === Resource.TYPE.IMAGE`.');

                    return this.type === Resource.TYPE.IMAGE;
                },
            },
            isAudio: {
                get()
                {
                    warn('The isAudio property is deprecated, please use `resource.type === Resource.TYPE.AUDIO`.');

                    return this.type === Resource.TYPE.AUDIO;
                },
            },
            isVideo: {
                get()
                {
                    warn('The isVideo property is deprecated, please use `resource.type === Resource.TYPE.VIDEO`.');

                    return this.type === Resource.TYPE.VIDEO;
                },
            },
        });

        Object.defineProperties(Loader.prototype, {
            before: {
                get()
                {
                    warn('The before() method is deprecated, please use pre().');

                    return this.pre;
                },
            },
            after: {
                get()
                {
                    warn('The after() method is deprecated, please use use().');

                    return this.use;
                },
            },
        });
    }

    /**
     * @name PIXI.interaction.interactiveTarget#defaultCursor
     * @static
     * @type {number}
     * @see PIXI.interaction.interactiveTarget#cursor
     * @deprecated since 4.3.0
     */
    Object.defineProperty(interaction.interactiveTarget, 'defaultCursor', {
        set(value)
        {
            warn('Property defaultCursor has been replaced with \'cursor\'. ');
            this.cursor = value;
        },
        get()
        {
            warn('Property defaultCursor has been replaced with \'cursor\'. ');

            return this.cursor;
        },
    });

    /**
     * @name PIXI.interaction.InteractionManager#defaultCursorStyle
     * @static
     * @type {string}
     * @see PIXI.interaction.InteractionManager#cursorStyles
     * @deprecated since 4.3.0
     */
    Object.defineProperty(interaction.InteractionManager, 'defaultCursorStyle', {
        set(value)
        {
            warn('Property defaultCursorStyle has been replaced with \'cursorStyles.default\'. ');
            this.cursorStyles.default = value;
        },
        get()
        {
            warn('Property defaultCursorStyle has been replaced with \'cursorStyles.default\'. ');

            return this.cursorStyles.default;
        },
    });

    /**
     * @name PIXI.interaction.InteractionManager#currentCursorStyle
     * @static
     * @type {string}
     * @see PIXI.interaction.InteractionManager#cursorStyles
     * @deprecated since 4.3.0
     */
    Object.defineProperty(interaction.InteractionManager, 'currentCursorStyle', {
        set(value)
        {
            warn('Property currentCursorStyle has been removed.'
            + 'See the currentCursorMode property, which works differently.');
            this.currentCursorMode = value;
        },
        get()
        {
            warn('Property currentCursorStyle has been removed.'
            + 'See the currentCursorMode property, which works differently.');

            return this.currentCursorMode;
        },
    });
}
