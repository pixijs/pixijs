'use strict';

var _core = require('./core');

var core = _interopRequireWildcard(_core);

var _mesh = require('./mesh');

var mesh = _interopRequireWildcard(_mesh);

var _particles = require('./particles');

var particles = _interopRequireWildcard(_particles);

var _extras = require('./extras');

var extras = _interopRequireWildcard(_extras);

var _filters = require('./filters');

var filters = _interopRequireWildcard(_filters);

var _prepare = require('./prepare');

var prepare = _interopRequireWildcard(_prepare);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// provide method to give a stack track for warnings
// useful for tracking-down where deprecated methods/properties/classes
// are being used within the code
function warn(msg) {
    // @if DEBUG
    /* eslint-disable no-console */
    var stack = new Error().stack;

    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined') {
        console.warn('Deprecation Warning: ', msg);
    } else {
        // chop off the stack trace which includes pixi.js internal calls
        stack = stack.split('\n').splice(3).join('\n');

        if (console.groupCollapsed) {
            console.groupCollapsed('%cDeprecation Warning: %c%s', 'color:#614108;background:#fffbe6', 'font-weight:normal;color:#614108;background:#fffbe6', msg);
            console.warn(stack);
            console.groupEnd();
        } else {
            console.warn('Deprecation Warning: ', msg);
            console.warn(stack);
        }
    }
    /* eslint-enable no-console */
    // @endif
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
core.SpriteBatch = function () {
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
core.AssetLoader = function () {
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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
            warn('The ParticleContainer class has been moved to particles.ParticleContainer, ' + 'please use particles.ParticleContainer from now on.');

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
        enumerable: true,
        get: function get() {
            warn('The MovieClip class has been moved to extras.AnimatedSprite, please use extras.AnimatedSprite.');

            return extras.AnimatedSprite;
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
        enumerable: true,
        get: function get() {
            warn('The TilingSprite class has been moved to extras.TilingSprite, ' + 'please use extras.TilingSprite from now on.');

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
        enumerable: true,
        get: function get() {
            warn('The BitmapText class has been moved to extras.BitmapText, ' + 'please use extras.BitmapText from now on.');

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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
            warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, ' + 'please use utils.BaseTextureCache from now on.');

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
        enumerable: true,
        get: function get() {
            warn('The TextureCache class has been moved to utils.TextureCache, ' + 'please use utils.TextureCache from now on.');

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
        enumerable: true,
        get: function get() {
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
        enumerable: true,
        get: function get() {
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');

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
        enumerable: true,
        get: function get() {
            warn('TransformManual has been renamed to TransformBase, please update your pixi-spine');

            return core.TransformBase;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.TARGET_FPMS
     * @see PIXI.settings.TARGET_FPMS
     * @deprecated since version 4.2.0
     */
    TARGET_FPMS: {
        enumerable: true,
        get: function get() {
            warn('PIXI.TARGET_FPMS has been deprecated, please use PIXI.settings.TARGET_FPMS');

            return core.settings.TARGET_FPMS;
        },
        set: function set(value) {
            warn('PIXI.TARGET_FPMS has been deprecated, please use PIXI.settings.TARGET_FPMS');

            core.settings.TARGET_FPMS = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.FILTER_RESOLUTION
     * @see PIXI.settings.FILTER_RESOLUTION
     * @deprecated since version 4.2.0
     */
    FILTER_RESOLUTION: {
        enumerable: true,
        get: function get() {
            warn('PIXI.FILTER_RESOLUTION has been deprecated, please use PIXI.settings.FILTER_RESOLUTION');

            return core.settings.FILTER_RESOLUTION;
        },
        set: function set(value) {
            warn('PIXI.FILTER_RESOLUTION has been deprecated, please use PIXI.settings.FILTER_RESOLUTION');

            core.settings.FILTER_RESOLUTION = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.RESOLUTION
     * @see PIXI.settings.RESOLUTION
     * @deprecated since version 4.2.0
     */
    RESOLUTION: {
        enumerable: true,
        get: function get() {
            warn('PIXI.RESOLUTION has been deprecated, please use PIXI.settings.RESOLUTION');

            return core.settings.RESOLUTION;
        },
        set: function set(value) {
            warn('PIXI.RESOLUTION has been deprecated, please use PIXI.settings.RESOLUTION');

            core.settings.RESOLUTION = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.MIPMAP_TEXTURES
     * @see PIXI.settings.MIPMAP_TEXTURES
     * @deprecated since version 4.2.0
     */
    MIPMAP_TEXTURES: {
        enumerable: true,
        get: function get() {
            warn('PIXI.MIPMAP_TEXTURES has been deprecated, please use PIXI.settings.MIPMAP_TEXTURES');

            return core.settings.MIPMAP_TEXTURES;
        },
        set: function set(value) {
            warn('PIXI.MIPMAP_TEXTURES has been deprecated, please use PIXI.settings.MIPMAP_TEXTURES');

            core.settings.MIPMAP_TEXTURES = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.SPRITE_BATCH_SIZE
     * @see PIXI.settings.SPRITE_BATCH_SIZE
     * @deprecated since version 4.2.0
     */
    SPRITE_BATCH_SIZE: {
        enumerable: true,
        get: function get() {
            warn('PIXI.SPRITE_BATCH_SIZE has been deprecated, please use PIXI.settings.SPRITE_BATCH_SIZE');

            return core.settings.SPRITE_BATCH_SIZE;
        },
        set: function set(value) {
            warn('PIXI.SPRITE_BATCH_SIZE has been deprecated, please use PIXI.settings.SPRITE_BATCH_SIZE');

            core.settings.SPRITE_BATCH_SIZE = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.SPRITE_MAX_TEXTURES
     * @see PIXI.settings.SPRITE_MAX_TEXTURES
     * @deprecated since version 4.2.0
     */
    SPRITE_MAX_TEXTURES: {
        enumerable: true,
        get: function get() {
            warn('PIXI.SPRITE_MAX_TEXTURES has been deprecated, please use PIXI.settings.SPRITE_MAX_TEXTURES');

            return core.settings.SPRITE_MAX_TEXTURES;
        },
        set: function set(value) {
            warn('PIXI.SPRITE_MAX_TEXTURES has been deprecated, please use PIXI.settings.SPRITE_MAX_TEXTURES');

            core.settings.SPRITE_MAX_TEXTURES = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.RETINA_PREFIX
     * @see PIXI.settings.RETINA_PREFIX
     * @deprecated since version 4.2.0
     */
    RETINA_PREFIX: {
        enumerable: true,
        get: function get() {
            warn('PIXI.RETINA_PREFIX has been deprecated, please use PIXI.settings.RETINA_PREFIX');

            return core.settings.RETINA_PREFIX;
        },
        set: function set(value) {
            warn('PIXI.RETINA_PREFIX has been deprecated, please use PIXI.settings.RETINA_PREFIX');

            core.settings.RETINA_PREFIX = value;
        }
    },

    /**
     * @static
     * @constant
     * @name PIXI.DEFAULT_RENDER_OPTIONS
     * @see PIXI.settings.RENDER_OPTIONS
     * @deprecated since version 4.2.0
     */
    DEFAULT_RENDER_OPTIONS: {
        enumerable: true,
        get: function get() {
            warn('PIXI.DEFAULT_RENDER_OPTIONS has been deprecated, please use PIXI.settings.DEFAULT_RENDER_OPTIONS');

            return core.settings.RENDER_OPTIONS;
        }
    }
});

// Move the default properties to settings
var defaults = [{ parent: 'TRANSFORM_MODE', target: 'TRANSFORM_MODE' }, { parent: 'GC_MODES', target: 'GC_MODE' }, { parent: 'WRAP_MODES', target: 'WRAP_MODE' }, { parent: 'SCALE_MODES', target: 'SCALE_MODE' }, { parent: 'PRECISION', target: 'PRECISION' }];

var _loop = function _loop(i) {
    var deprecation = defaults[i];

    Object.defineProperty(core[deprecation.parent], 'DEFAULT', {
        enumerable: true,
        get: function get() {
            warn('PIXI.' + deprecation.parent + '.DEFAULT has been deprecated, please use PIXI.settings.' + deprecation.target);

            return core.settings[deprecation.target];
        },
        set: function set(value) {
            warn('PIXI.' + deprecation.parent + '.DEFAULT has been deprecated, please use PIXI.settings.' + deprecation.target);

            core.settings[deprecation.target] = value;
        }
    });
};

for (var i = 0; i < defaults.length; i++) {
    _loop(i);
}

Object.defineProperties(extras, {

    /**
     * @class
     * @name MovieClip
     * @memberof PIXI.extras
     * @see PIXI.extras.AnimatedSprite
     * @deprecated since version 4.2.0
     */
    MovieClip: {
        enumerable: true,
        get: function get() {
            warn('The MovieClip class has been renamed to AnimatedSprite, please use AnimatedSprite from now on.');

            return extras.AnimatedSprite;
        }
    }
});

core.DisplayObject.prototype.generateTexture = function generateTexture(renderer, scaleMode, resolution) {
    warn('generateTexture has moved to the renderer, please use renderer.generateTexture(displayObject)');

    return renderer.generateTexture(this, scaleMode, resolution);
};

core.Graphics.prototype.generateTexture = function generateTexture(scaleMode, resolution) {
    warn('graphics generate texture has moved to the renderer. ' + 'Or to render a graphics to a texture using canvas please use generateCanvasTexture');

    return this.generateCanvasTexture(scaleMode, resolution);
};

core.RenderTexture.prototype.render = function render(displayObject, matrix, clear, updateTransform) {
    this.legacyRenderer.render(displayObject, this, clear, matrix, !updateTransform);
    warn('RenderTexture.render is now deprecated, please use renderer.render(displayObject, renderTexture)');
};

core.RenderTexture.prototype.getImage = function getImage(target) {
    warn('RenderTexture.getImage is now deprecated, please use renderer.extract.image(target)');

    return this.legacyRenderer.extract.image(target);
};

core.RenderTexture.prototype.getBase64 = function getBase64(target) {
    warn('RenderTexture.getBase64 is now deprecated, please use renderer.extract.base64(target)');

    return this.legacyRenderer.extract.base64(target);
};

core.RenderTexture.prototype.getCanvas = function getCanvas(target) {
    warn('RenderTexture.getCanvas is now deprecated, please use renderer.extract.canvas(target)');

    return this.legacyRenderer.extract.canvas(target);
};

core.RenderTexture.prototype.getPixels = function getPixels(target) {
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
core.Sprite.prototype.setTexture = function setTexture(texture) {
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
extras.BitmapText.prototype.setText = function setText(text) {
    this.text = text;
    warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setText
 * @see PIXI.Text#text
 * @deprecated since version 3.0.0
 * @param {string} text - The text to set to.
 */
core.Text.prototype.setText = function setText(text) {
    this.text = text;
    warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setStyle
 * @see PIXI.Text#style
 * @deprecated since version 3.0.0
 * @param {*} style - The style to set to.
 */
core.Text.prototype.setStyle = function setStyle(style) {
    this.style = style;
    warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
};

/**
 * @method
 * @name PIXI.Text#determineFontProperties
 * @see PIXI.Text#calculateFontProperties
 * @deprecated since version 4.2.0
 * @private
 * @param {string} fontStyle - String representing the style of the font
 * @return {Object} Font properties object
 */
core.Text.prototype.determineFontProperties = function determineFontProperties(fontStyle) {
    warn('determineFontProperties is now deprecated, please use the static calculateFontProperties method, ' + 'e.g : Text.calculateFontProperties(fontStyle);');

    return Text.calculateFontProperties(fontStyle);
};

Object.defineProperties(core.TextStyle.prototype, {
    /**
     * Set all properties of a font as a single string
     *
     * @name PIXI.TextStyle#font
     * @deprecated since version 4.0.0
     */
    font: {
        get: function get() {
            warn('text style property \'font\' is now deprecated, please use the ' + '\'fontFamily\', \'fontSize\', \'fontStyle\', \'fontVariant\' and \'fontWeight\' properties from now on');

            var fontSizeString = typeof this._fontSize === 'number' ? this._fontSize + 'px' : this._fontSize;

            return this._fontStyle + ' ' + this._fontVariant + ' ' + this._fontWeight + ' ' + fontSizeString + ' ' + this._fontFamily;
        },
        set: function set(font) {
            warn('text style property \'font\' is now deprecated, please use the ' + '\'fontFamily\',\'fontSize\',fontStyle\',\'fontVariant\' and \'fontWeight\' properties from now on');

            // can work out fontStyle from search of whole string
            if (font.indexOf('italic') > 1) {
                this._fontStyle = 'italic';
            } else if (font.indexOf('oblique') > -1) {
                this._fontStyle = 'oblique';
            } else {
                this._fontStyle = 'normal';
            }

            // can work out fontVariant from search of whole string
            if (font.indexOf('small-caps') > -1) {
                this._fontVariant = 'small-caps';
            } else {
                this._fontVariant = 'normal';
            }

            // fontWeight and fontFamily are tricker to find, but it's easier to find the fontSize due to it's units
            var splits = font.split(' ');
            var fontSizeIndex = -1;

            this._fontSize = 26;
            for (var _i = 0; _i < splits.length; ++_i) {
                if (splits[_i].match(/(px|pt|em|%)/)) {
                    fontSizeIndex = _i;
                    this._fontSize = splits[_i];
                    break;
                }
            }

            // we can now search for fontWeight as we know it must occur before the fontSize
            this._fontWeight = 'normal';
            for (var _i2 = 0; _i2 < fontSizeIndex; ++_i2) {
                if (splits[_i2].match(/(bold|bolder|lighter|100|200|300|400|500|600|700|800|900)/)) {
                    this._fontWeight = splits[_i2];
                    break;
                }
            }

            // and finally join everything together after the fontSize in case the font family has multiple words
            if (fontSizeIndex > -1 && fontSizeIndex < splits.length - 1) {
                this._fontFamily = '';
                for (var _i3 = fontSizeIndex + 1; _i3 < splits.length; ++_i3) {
                    this._fontFamily += splits[_i3] + ' ';
                }

                this._fontFamily = this._fontFamily.slice(0, -1);
            } else {
                this._fontFamily = 'Arial';
            }

            this.styleID++;
        }
    }
});

/**
 * @method
 * @name PIXI.Texture#setFrame
 * @see PIXI.Texture#setFrame
 * @deprecated since version 3.0.0
 * @param {PIXI.Rectangle} frame - The frame to set.
 */
core.Texture.prototype.setFrame = function setFrame(frame) {
    this.frame = frame;
    warn('setFrame is now deprecated, please use the frame property, e.g: myTexture.frame = frame;');
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
        get: function get() {
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');

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
        get: function get() {
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
 * @return {number} The uid
 */
core.utils.uuid = function () {
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
core.utils.canUseNewCanvasBlendModes = function () {
    warn('utils.canUseNewCanvasBlendModes() is deprecated, please use CanvasTinter.canUseMultiply from now on');

    return core.CanvasTinter.canUseMultiply;
};

var saidHello = true;

/**
 * @name PIXI.utils._saidHello
 * @type {boolean}
 * @see PIXI.utils.skipHello
 * @deprecated since 4.1.0
 */
Object.defineProperty(core.utils, '_saidHello', {
    set: function set(bool) {
        if (bool) {
            warn('PIXI.utils._saidHello is deprecated, please use PIXI.utils.skipHello()');
            this.skipHello();
        }
        saidHello = bool;
    },
    get: function get() {
        return saidHello;
    }
});

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
    set: function set() {
        warn('PIXI.CanvasPrepare.UPLOADS_PER_FRAME has been removed. Please set ' + 'renderer.plugins.prepare.limiter.maxItemsPerFrame on your renderer');
        // because we don't have a reference to the renderer, we can't actually set
        // the uploads per frame, so we'll have to stick with the warning.
    },
    get: function get() {
        warn('PIXI.CanvasPrepare.UPLOADS_PER_FRAME has been removed. Please use ' + 'renderer.plugins.prepare.limiter');

        return NaN;
    }
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
    set: function set() {
        warn('PIXI.WebGLPrepare.UPLOADS_PER_FRAME has been removed. Please set ' + 'renderer.plugins.prepare.limiter.maxItemsPerFrame on your renderer');
        // because we don't have a reference to the renderer, we can't actually set
        // the uploads per frame, so we'll have to stick with the warning.
    },
    get: function get() {
        warn('PIXI.WebGLPrepare.UPLOADS_PER_FRAME has been removed. Please use ' + 'renderer.plugins.prepare.limiter');

        return NaN;
    }
});
//# sourceMappingURL=deprecation.js.map