/*!
 * @pixi/text - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/text is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { settings } from '@pixi/settings';
import { Rectangle } from '@pixi/math';
import { hex2string, hex2rgb, string2hex, trimCanvas, sign } from '@pixi/utils';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Constants that define the type of gradient on text.
 *
 * @static
 * @constant
 * @name TEXT_GRADIENT
 * @memberof PIXI
 * @type {object}
 * @property {number} LINEAR_VERTICAL Vertical gradient
 * @property {number} LINEAR_HORIZONTAL Linear gradient
 */
var TEXT_GRADIENT;
(function (TEXT_GRADIENT) {
    TEXT_GRADIENT[TEXT_GRADIENT["LINEAR_VERTICAL"] = 0] = "LINEAR_VERTICAL";
    TEXT_GRADIENT[TEXT_GRADIENT["LINEAR_HORIZONTAL"] = 1] = "LINEAR_HORIZONTAL";
})(TEXT_GRADIENT || (TEXT_GRADIENT = {}));

// disabling eslint for now, going to rewrite this in v5
var defaultStyle = {
    align: 'left',
    breakWords: false,
    dropShadow: false,
    dropShadowAlpha: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 0,
    dropShadowColor: 'black',
    dropShadowDistance: 5,
    fill: 'black',
    fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
    fillGradientStops: [],
    fontFamily: 'Arial',
    fontSize: 26,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    letterSpacing: 0,
    lineHeight: 0,
    lineJoin: 'miter',
    miterLimit: 10,
    padding: 0,
    stroke: 'black',
    strokeThickness: 0,
    textBaseline: 'alphabetic',
    trim: false,
    whiteSpace: 'pre',
    wordWrap: false,
    wordWrapWidth: 100,
    leading: 0,
};
var genericFontFamilies = [
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui' ];
/**
 * A TextStyle Object contains information to decorate a Text objects.
 *
 * An instance can be shared between multiple Text objects; then changing the style will update all text objects using it.
 *
 * A tool can be used to generate a text style [here](https://pixijs.io/pixi-text-style).
 *
 * @class
 * @memberof PIXI
 */
var TextStyle = /** @class */ (function () {
    /**
     * @param {object} [style] - The style parameters
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'),
     *  does not affect single line text
     * @param {boolean} [style.breakWords=false] - Indicates if lines can be wrapped within words, it
     *  needs wordWrap to be set to true
     * @param {boolean} [style.dropShadow=false] - Set a drop shadow for the text
     * @param {number} [style.dropShadowAlpha=1] - Set alpha for the drop shadow
     * @param {number} [style.dropShadowAngle=Math.PI/6] - Set a angle of the drop shadow
     * @param {number} [style.dropShadowBlur=0] - Set a shadow blur radius
     * @param {string|number} [style.dropShadowColor='black'] - A fill style to be used on the dropshadow e.g 'red', '#00FF00'
     * @param {number} [style.dropShadowDistance=5] - Set a distance of the drop shadow
     * @param {string|string[]|number|number[]|CanvasGradient|CanvasPattern} [style.fill='black'] - A canvas
     *  fillstyle that will be used on the text e.g 'red', '#00FF00'. Can be an array to create a gradient
     *  eg ['#000000','#FFFFFF']
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
     * @param {number} [style.fillGradientType=PIXI.TEXT_GRADIENT.LINEAR_VERTICAL] - If fill is an array of colours
     *  to create a gradient, this can change the type/direction of the gradient. See {@link PIXI.TEXT_GRADIENT}
     * @param {number[]} [style.fillGradientStops] - If fill is an array of colours to create a gradient, this array can set
     * the stop points (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
     * @param {string|string[]} [style.fontFamily='Arial'] - The font family
     * @param {number|string} [style.fontSize=26] - The font size (as a number it converts to px, but as a string,
     *  equivalents are '26px','20pt','160%' or '1.6em')
     * @param {string} [style.fontStyle='normal'] - The font style ('normal', 'italic' or 'oblique')
     * @param {string} [style.fontVariant='normal'] - The font variant ('normal' or 'small-caps')
     * @param {string} [style.fontWeight='normal'] - The font weight ('normal', 'bold', 'bolder', 'lighter' and '100',
     *  '200', '300', '400', '500', '600', '700', '800' or '900')
     * @param {number} [style.leading=0] - The space between lines
     * @param {number} [style.letterSpacing=0] - The amount of spacing between letters, default is 0
     * @param {number} [style.lineHeight] - The line height, a number that represents the vertical space that a letter uses
     * @param {string} [style.lineJoin='miter'] - The lineJoin property sets the type of corner created, it can resolve
     *      spiked text issues. Possible values "miter" (creates a sharp corner), "round" (creates a round corner) or "bevel"
     *      (creates a squared corner).
     * @param {number} [style.miterLimit=10] - The miter limit to use when using the 'miter' lineJoin mode. This can reduce
     *      or increase the spikiness of rendered text.
     * @param {number} [style.padding=0] - Occasionally some fonts are cropped. Adding some padding will prevent this from
     *     happening by adding padding to all sides of the text.
     * @param {string|number} [style.stroke='black'] - A canvas fillstyle that will be used on the text stroke
     *  e.g 'blue', '#FCFF00'
     * @param {number} [style.strokeThickness=0] - A number that represents the thickness of the stroke.
     *  Default is 0 (no stroke)
     * @param {boolean} [style.trim=false] - Trim transparent borders
     * @param {string} [style.textBaseline='alphabetic'] - The baseline of the text that is rendered.
     * @param {string} [style.whiteSpace='pre'] - Determines whether newlines & spaces are collapsed or preserved "normal"
     *      (collapse, collapse), "pre" (preserve, preserve) | "pre-line" (preserve, collapse). It needs wordWrap to be set to true
     * @param {boolean} [style.wordWrap=false] - Indicates if word wrap should be used
     * @param {number} [style.wordWrapWidth=100] - The width at which text will wrap, it needs wordWrap to be set to true
     */
    function TextStyle(style) {
        this.styleID = 0;
        this.reset();
        deepCopyProperties(this, style, style);
    }
    /**
     * Creates a new TextStyle object with the same values as this one.
     * Note that the only the properties of the object are cloned.
     *
     * @return {PIXI.TextStyle} New cloned TextStyle object
     */
    TextStyle.prototype.clone = function () {
        var clonedProperties = {};
        deepCopyProperties(clonedProperties, this, defaultStyle);
        return new TextStyle(clonedProperties);
    };
    /**
     * Resets all properties to the defaults specified in TextStyle.prototype._default
     */
    TextStyle.prototype.reset = function () {
        deepCopyProperties(this, defaultStyle, defaultStyle);
    };
    Object.defineProperty(TextStyle.prototype, "align", {
        /**
         * Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
         *
         * @member {string}
         */
        get: function () {
            return this._align;
        },
        set: function (align) {
            if (this._align !== align) {
                this._align = align;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "breakWords", {
        /**
         * Indicates if lines can be wrapped within words, it needs wordWrap to be set to true
         *
         * @member {boolean}
         */
        get: function () {
            return this._breakWords;
        },
        set: function (breakWords) {
            if (this._breakWords !== breakWords) {
                this._breakWords = breakWords;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "dropShadow", {
        /**
         * Set a drop shadow for the text
         *
         * @member {boolean}
         */
        get: function () {
            return this._dropShadow;
        },
        set: function (dropShadow) {
            if (this._dropShadow !== dropShadow) {
                this._dropShadow = dropShadow;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "dropShadowAlpha", {
        /**
         * Set alpha for the drop shadow
         *
         * @member {number}
         */
        get: function () {
            return this._dropShadowAlpha;
        },
        set: function (dropShadowAlpha) {
            if (this._dropShadowAlpha !== dropShadowAlpha) {
                this._dropShadowAlpha = dropShadowAlpha;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "dropShadowAngle", {
        /**
         * Set a angle of the drop shadow
         *
         * @member {number}
         */
        get: function () {
            return this._dropShadowAngle;
        },
        set: function (dropShadowAngle) {
            if (this._dropShadowAngle !== dropShadowAngle) {
                this._dropShadowAngle = dropShadowAngle;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "dropShadowBlur", {
        /**
         * Set a shadow blur radius
         *
         * @member {number}
         */
        get: function () {
            return this._dropShadowBlur;
        },
        set: function (dropShadowBlur) {
            if (this._dropShadowBlur !== dropShadowBlur) {
                this._dropShadowBlur = dropShadowBlur;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "dropShadowColor", {
        /**
         * A fill style to be used on the dropshadow e.g 'red', '#00FF00'
         *
         * @member {string|number}
         */
        get: function () {
            return this._dropShadowColor;
        },
        set: function (dropShadowColor) {
            var outputColor = getColor(dropShadowColor);
            if (this._dropShadowColor !== outputColor) {
                this._dropShadowColor = outputColor;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "dropShadowDistance", {
        /**
         * Set a distance of the drop shadow
         *
         * @member {number}
         */
        get: function () {
            return this._dropShadowDistance;
        },
        set: function (dropShadowDistance) {
            if (this._dropShadowDistance !== dropShadowDistance) {
                this._dropShadowDistance = dropShadowDistance;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fill", {
        /**
         * A canvas fillstyle that will be used on the text e.g 'red', '#00FF00'.
         * Can be an array to create a gradient eg ['#000000','#FFFFFF']
         * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
         *
         * @member {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
         */
        get: function () {
            return this._fill;
        },
        set: function (fill) {
            // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
            //       the setter converts to string. See this thread for more details:
            //       https://github.com/microsoft/TypeScript/issues/2521
            // TODO: Not sure if getColor works properly with CanvasGradient and/or CanvasPattern, can't pass in
            //       without casting here.
            var outputColor = getColor(fill);
            if (this._fill !== outputColor) {
                this._fill = outputColor;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fillGradientType", {
        /**
         * If fill is an array of colours to create a gradient, this can change the type/direction of the gradient.
         * See {@link PIXI.TEXT_GRADIENT}
         *
         * @member {number}
         */
        get: function () {
            return this._fillGradientType;
        },
        set: function (fillGradientType) {
            if (this._fillGradientType !== fillGradientType) {
                this._fillGradientType = fillGradientType;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fillGradientStops", {
        /**
         * If fill is an array of colours to create a gradient, this array can set the stop points
         * (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
         *
         * @member {number[]}
         */
        get: function () {
            return this._fillGradientStops;
        },
        set: function (fillGradientStops) {
            if (!areArraysEqual(this._fillGradientStops, fillGradientStops)) {
                this._fillGradientStops = fillGradientStops;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fontFamily", {
        /**
         * The font family
         *
         * @member {string|string[]}
         */
        get: function () {
            return this._fontFamily;
        },
        set: function (fontFamily) {
            if (this.fontFamily !== fontFamily) {
                this._fontFamily = fontFamily;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fontSize", {
        /**
         * The font size
         * (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em')
         *
         * @member {number|string}
         */
        get: function () {
            return this._fontSize;
        },
        set: function (fontSize) {
            if (this._fontSize !== fontSize) {
                this._fontSize = fontSize;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fontStyle", {
        /**
         * The font style
         * ('normal', 'italic' or 'oblique')
         *
         * @member {string}
         */
        get: function () {
            return this._fontStyle;
        },
        set: function (fontStyle) {
            if (this._fontStyle !== fontStyle) {
                this._fontStyle = fontStyle;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fontVariant", {
        /**
         * The font variant
         * ('normal' or 'small-caps')
         *
         * @member {string}
         */
        get: function () {
            return this._fontVariant;
        },
        set: function (fontVariant) {
            if (this._fontVariant !== fontVariant) {
                this._fontVariant = fontVariant;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "fontWeight", {
        /**
         * The font weight
         * ('normal', 'bold', 'bolder', 'lighter' and '100', '200', '300', '400', '500', '600', '700', 800' or '900')
         *
         * @member {string}
         */
        get: function () {
            return this._fontWeight;
        },
        set: function (fontWeight) {
            if (this._fontWeight !== fontWeight) {
                this._fontWeight = fontWeight;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "letterSpacing", {
        /**
         * The amount of spacing between letters, default is 0
         *
         * @member {number}
         */
        get: function () {
            return this._letterSpacing;
        },
        set: function (letterSpacing) {
            if (this._letterSpacing !== letterSpacing) {
                this._letterSpacing = letterSpacing;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "lineHeight", {
        /**
         * The line height, a number that represents the vertical space that a letter uses
         *
         * @member {number}
         */
        get: function () {
            return this._lineHeight;
        },
        set: function (lineHeight) {
            if (this._lineHeight !== lineHeight) {
                this._lineHeight = lineHeight;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "leading", {
        /**
         * The space between lines
         *
         * @member {number}
         */
        get: function () {
            return this._leading;
        },
        set: function (leading) {
            if (this._leading !== leading) {
                this._leading = leading;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "lineJoin", {
        /**
         * The lineJoin property sets the type of corner created, it can resolve spiked text issues.
         * Default is 'miter' (creates a sharp corner).
         *
         * @member {string}
         */
        get: function () {
            return this._lineJoin;
        },
        set: function (lineJoin) {
            if (this._lineJoin !== lineJoin) {
                this._lineJoin = lineJoin;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "miterLimit", {
        /**
         * The miter limit to use when using the 'miter' lineJoin mode
         * This can reduce or increase the spikiness of rendered text.
         *
         * @member {number}
         */
        get: function () {
            return this._miterLimit;
        },
        set: function (miterLimit) {
            if (this._miterLimit !== miterLimit) {
                this._miterLimit = miterLimit;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "padding", {
        /**
         * Occasionally some fonts are cropped. Adding some padding will prevent this from happening
         * by adding padding to all sides of the text.
         *
         * @member {number}
         */
        get: function () {
            return this._padding;
        },
        set: function (padding) {
            if (this._padding !== padding) {
                this._padding = padding;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "stroke", {
        /**
         * A canvas fillstyle that will be used on the text stroke
         * e.g 'blue', '#FCFF00'
         *
         * @member {string|number}
         */
        get: function () {
            return this._stroke;
        },
        set: function (stroke) {
            // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
            //       the setter converts to string. See this thread for more details:
            //       https://github.com/microsoft/TypeScript/issues/2521
            var outputColor = getColor(stroke);
            if (this._stroke !== outputColor) {
                this._stroke = outputColor;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "strokeThickness", {
        /**
         * A number that represents the thickness of the stroke.
         * Default is 0 (no stroke)
         *
         * @member {number}
         */
        get: function () {
            return this._strokeThickness;
        },
        set: function (strokeThickness) {
            if (this._strokeThickness !== strokeThickness) {
                this._strokeThickness = strokeThickness;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "textBaseline", {
        /**
         * The baseline of the text that is rendered.
         *
         * @member {string}
         */
        get: function () {
            return this._textBaseline;
        },
        set: function (textBaseline) {
            if (this._textBaseline !== textBaseline) {
                this._textBaseline = textBaseline;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "trim", {
        /**
         * Trim transparent borders
         *
         * @member {boolean}
         */
        get: function () {
            return this._trim;
        },
        set: function (trim) {
            if (this._trim !== trim) {
                this._trim = trim;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "whiteSpace", {
        /**
         * How newlines and spaces should be handled.
         * Default is 'pre' (preserve, preserve).
         *
         *  value       | New lines     |   Spaces
         *  ---         | ---           |   ---
         * 'normal'     | Collapse      |   Collapse
         * 'pre'        | Preserve      |   Preserve
         * 'pre-line'   | Preserve      |   Collapse
         *
         * @member {string}
         */
        get: function () {
            return this._whiteSpace;
        },
        set: function (whiteSpace) {
            if (this._whiteSpace !== whiteSpace) {
                this._whiteSpace = whiteSpace;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "wordWrap", {
        /**
         * Indicates if word wrap should be used
         *
         * @member {boolean}
         */
        get: function () {
            return this._wordWrap;
        },
        set: function (wordWrap) {
            if (this._wordWrap !== wordWrap) {
                this._wordWrap = wordWrap;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextStyle.prototype, "wordWrapWidth", {
        /**
         * The width at which text will wrap, it needs wordWrap to be set to true
         *
         * @member {number}
         */
        get: function () {
            return this._wordWrapWidth;
        },
        set: function (wordWrapWidth) {
            if (this._wordWrapWidth !== wordWrapWidth) {
                this._wordWrapWidth = wordWrapWidth;
                this.styleID++;
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Generates a font style string to use for `TextMetrics.measureFont()`.
     *
     * @return {string} Font style string, for passing to `TextMetrics.measureFont()`
     */
    TextStyle.prototype.toFontString = function () {
        // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
        var fontSizeString = (typeof this.fontSize === 'number') ? this.fontSize + "px" : this.fontSize;
        // Clean-up fontFamily property by quoting each font name
        // this will support font names with spaces
        var fontFamilies = this.fontFamily;
        if (!Array.isArray(this.fontFamily)) {
            fontFamilies = this.fontFamily.split(',');
        }
        for (var i = fontFamilies.length - 1; i >= 0; i--) {
            // Trim any extra white-space
            var fontFamily = fontFamilies[i].trim();
            // Check if font already contains strings
            if (!(/([\"\'])[^\'\"]+\1/).test(fontFamily) && genericFontFamilies.indexOf(fontFamily) < 0) {
                fontFamily = "\"" + fontFamily + "\"";
            }
            fontFamilies[i] = fontFamily;
        }
        return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + fontSizeString + " " + fontFamilies.join(',');
    };
    return TextStyle;
}());
/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 * @private
 * @param {string|number} color
 * @return {string} The color as a string.
 */
function getSingleColor(color) {
    if (typeof color === 'number') {
        return hex2string(color);
    }
    else if (typeof color === 'string') {
        if (color.indexOf('0x') === 0) {
            color = color.replace('0x', '#');
        }
    }
    return color;
}
function getColor(color) {
    if (!Array.isArray(color)) {
        return getSingleColor(color);
    }
    else {
        for (var i = 0; i < color.length; ++i) {
            color[i] = getSingleColor(color[i]);
        }
        return color;
    }
}
/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 * This version can also convert array of colors
 * @private
 * @param {Array} array1 - First array to compare
 * @param {Array} array2 - Second array to compare
 * @return {boolean} Do the arrays contain the same values in the same order
 */
function areArraysEqual(array1, array2) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
        return false;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; ++i) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
}
/**
 * Utility function to ensure that object properties are copied by value, and not by reference
 * @private
 * @param {Object} target - Target object to copy properties into
 * @param {Object} source - Source object for the properties to copy
 * @param {string} propertyObj - Object containing properties names we want to loop over
 */
function deepCopyProperties(target, source, propertyObj) {
    for (var prop in propertyObj) {
        if (Array.isArray(source[prop])) {
            target[prop] = source[prop].slice();
        }
        else {
            target[prop] = source[prop];
        }
    }
}

/**
 * The TextMetrics object represents the measurement of a block of text with a specified style.
 *
 * ```js
 * let style = new PIXI.TextStyle({fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'})
 * let textMetrics = PIXI.TextMetrics.measureText('Your text', style)
 * ```
 *
 * @class
 * @memberof PIXI
 */
var TextMetrics = /** @class */ (function () {
    /**
     * @param {string} text - the text that was measured
     * @param {PIXI.TextStyle} style - the style that was measured
     * @param {number} width - the measured width of the text
     * @param {number} height - the measured height of the text
     * @param {string[]} lines - an array of the lines of text broken by new lines and wrapping if specified in style
     * @param {number[]} lineWidths - an array of the line widths for each line matched to `lines`
     * @param {number} lineHeight - the measured line height for this style
     * @param {number} maxLineWidth - the maximum line width for all measured lines
     * @param {Object} fontProperties - the font properties object from TextMetrics.measureFont
     */
    function TextMetrics(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties) {
        /**
         * The text that was measured
         *
         * @member {string}
         */
        this.text = text;
        /**
         * The style that was measured
         *
         * @member {PIXI.TextStyle}
         */
        this.style = style;
        /**
         * The measured width of the text
         *
         * @member {number}
         */
        this.width = width;
        /**
         * The measured height of the text
         *
         * @member {number}
         */
        this.height = height;
        /**
         * An array of lines of the text broken by new lines and wrapping is specified in style
         *
         * @member {string[]}
         */
        this.lines = lines;
        /**
         * An array of the line widths for each line matched to `lines`
         *
         * @member {number[]}
         */
        this.lineWidths = lineWidths;
        /**
         * The measured line height for this style
         *
         * @member {number}
         */
        this.lineHeight = lineHeight;
        /**
         * The maximum line width for all measured lines
         *
         * @member {number}
         */
        this.maxLineWidth = maxLineWidth;
        /**
         * The font properties object from TextMetrics.measureFont
         *
         * @member {PIXI.IFontMetrics}
         */
        this.fontProperties = fontProperties;
    }
    /**
     * Measures the supplied string of text and returns a Rectangle.
     *
     * @param {string} text - the text to measure.
     * @param {PIXI.TextStyle} style - the text style to use for measuring
     * @param {boolean} [wordWrap] - optional override for if word-wrap should be applied to the text.
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {PIXI.TextMetrics} measured width and height of the text.
     */
    TextMetrics.measureText = function (text, style, wordWrap, canvas) {
        if (canvas === void 0) { canvas = TextMetrics._canvas; }
        wordWrap = (wordWrap === undefined || wordWrap === null) ? style.wordWrap : wordWrap;
        var font = style.toFontString();
        var fontProperties = TextMetrics.measureFont(font);
        // fallback in case UA disallow canvas data extraction
        // (toDataURI, getImageData functions)
        if (fontProperties.fontSize === 0) {
            fontProperties.fontSize = style.fontSize;
            fontProperties.ascent = style.fontSize;
        }
        var context = canvas.getContext('2d');
        context.font = font;
        var outputText = wordWrap ? TextMetrics.wordWrap(text, style, canvas) : text;
        var lines = outputText.split(/(?:\r\n|\r|\n)/);
        var lineWidths = new Array(lines.length);
        var maxLineWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            var lineWidth = context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);
            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }
        var width = maxLineWidth + style.strokeThickness;
        if (style.dropShadow) {
            width += style.dropShadowDistance;
        }
        var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
        var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness)
            + ((lines.length - 1) * (lineHeight + style.leading));
        if (style.dropShadow) {
            height += style.dropShadowDistance;
        }
        return new TextMetrics(text, style, width, height, lines, lineWidths, lineHeight + style.leading, maxLineWidth, fontProperties);
    };
    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     *
     * @private
     * @param {string} text - String to apply word wrapping to
     * @param {PIXI.TextStyle} style - the style to use when wrapping
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {string} New string with new lines applied where required
     */
    TextMetrics.wordWrap = function (text, style, canvas) {
        if (canvas === void 0) { canvas = TextMetrics._canvas; }
        var context = canvas.getContext('2d');
        var width = 0;
        var line = '';
        var lines = '';
        var cache = Object.create(null);
        var letterSpacing = style.letterSpacing, whiteSpace = style.whiteSpace;
        // How to handle whitespaces
        var collapseSpaces = TextMetrics.collapseSpaces(whiteSpace);
        var collapseNewlines = TextMetrics.collapseNewlines(whiteSpace);
        // whether or not spaces may be added to the beginning of lines
        var canPrependSpaces = !collapseSpaces;
        // There is letterSpacing after every char except the last one
        // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!
        // so for convenience the above needs to be compared to width + 1 extra letterSpace
        // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!_
        // ________________________________________________
        // And then the final space is simply no appended to each line
        var wordWrapWidth = style.wordWrapWidth + letterSpacing;
        // break text into words, spaces and newline chars
        var tokens = TextMetrics.tokenize(text);
        for (var i = 0; i < tokens.length; i++) {
            // get the word, space or newlineChar
            var token = tokens[i];
            // if word is a new line
            if (TextMetrics.isNewline(token)) {
                // keep the new line
                if (!collapseNewlines) {
                    lines += TextMetrics.addLine(line);
                    canPrependSpaces = !collapseSpaces;
                    line = '';
                    width = 0;
                    continue;
                }
                // if we should collapse new lines
                // we simply convert it into a space
                token = ' ';
            }
            // if we should collapse repeated whitespaces
            if (collapseSpaces) {
                // check both this and the last tokens for spaces
                var currIsBreakingSpace = TextMetrics.isBreakingSpace(token);
                var lastIsBreakingSpace = TextMetrics.isBreakingSpace(line[line.length - 1]);
                if (currIsBreakingSpace && lastIsBreakingSpace) {
                    continue;
                }
            }
            // get word width from cache if possible
            var tokenWidth = TextMetrics.getFromCache(token, letterSpacing, cache, context);
            // word is longer than desired bounds
            if (tokenWidth > wordWrapWidth) {
                // if we are not already at the beginning of a line
                if (line !== '') {
                    // start newlines for overflow words
                    lines += TextMetrics.addLine(line);
                    line = '';
                    width = 0;
                }
                // break large word over multiple lines
                if (TextMetrics.canBreakWords(token, style.breakWords)) {
                    // break word into characters
                    var characters = TextMetrics.wordWrapSplit(token);
                    // loop the characters
                    for (var j = 0; j < characters.length; j++) {
                        var char = characters[j];
                        var k = 1;
                        // we are not at the end of the token
                        while (characters[j + k]) {
                            var nextChar = characters[j + k];
                            var lastChar = char[char.length - 1];
                            // should not split chars
                            if (!TextMetrics.canBreakChars(lastChar, nextChar, token, j, style.breakWords)) {
                                // combine chars & move forward one
                                char += nextChar;
                            }
                            else {
                                break;
                            }
                            k++;
                        }
                        j += char.length - 1;
                        var characterWidth = TextMetrics.getFromCache(char, letterSpacing, cache, context);
                        if (characterWidth + width > wordWrapWidth) {
                            lines += TextMetrics.addLine(line);
                            canPrependSpaces = false;
                            line = '';
                            width = 0;
                        }
                        line += char;
                        width += characterWidth;
                    }
                }
                // run word out of the bounds
                else {
                    // if there are words in this line already
                    // finish that line and start a new one
                    if (line.length > 0) {
                        lines += TextMetrics.addLine(line);
                        line = '';
                        width = 0;
                    }
                    var isLastToken = i === tokens.length - 1;
                    // give it its own line if it's not the end
                    lines += TextMetrics.addLine(token, !isLastToken);
                    canPrependSpaces = false;
                    line = '';
                    width = 0;
                }
            }
            // word could fit
            else {
                // word won't fit because of existing words
                // start a new line
                if (tokenWidth + width > wordWrapWidth) {
                    // if its a space we don't want it
                    canPrependSpaces = false;
                    // add a new line
                    lines += TextMetrics.addLine(line);
                    // start a new line
                    line = '';
                    width = 0;
                }
                // don't add spaces to the beginning of lines
                if (line.length > 0 || !TextMetrics.isBreakingSpace(token) || canPrependSpaces) {
                    // add the word to the current line
                    line += token;
                    // update width counter
                    width += tokenWidth;
                }
            }
        }
        lines += TextMetrics.addLine(line, false);
        return lines;
    };
    /**
     * Convienience function for logging each line added during the wordWrap
     * method
     *
     * @private
     * @param  {string}   line        - The line of text to add
     * @param  {boolean}  newLine     - Add new line character to end
     * @return {string}  A formatted line
     */
    TextMetrics.addLine = function (line, newLine) {
        if (newLine === void 0) { newLine = true; }
        line = TextMetrics.trimRight(line);
        line = (newLine) ? line + "\n" : line;
        return line;
    };
    /**
     * Gets & sets the widths of calculated characters in a cache object
     *
     * @private
     * @param  {string}                    key            - The key
     * @param  {number}                    letterSpacing  - The letter spacing
     * @param  {object}                    cache          - The cache
     * @param  {CanvasRenderingContext2D}  context        - The canvas context
     * @return {number}                    The from cache.
     */
    TextMetrics.getFromCache = function (key, letterSpacing, cache, context) {
        var width = cache[key];
        if (typeof width !== 'number') {
            var spacing = ((key.length) * letterSpacing);
            width = context.measureText(key).width + spacing;
            cache[key] = width;
        }
        return width;
    };
    /**
     * Determines whether we should collapse breaking spaces
     *
     * @private
     * @param  {string}   whiteSpace - The TextStyle property whiteSpace
     * @return {boolean}  should collapse
     */
    TextMetrics.collapseSpaces = function (whiteSpace) {
        return (whiteSpace === 'normal' || whiteSpace === 'pre-line');
    };
    /**
     * Determines whether we should collapse newLine chars
     *
     * @private
     * @param  {string}   whiteSpace - The white space
     * @return {boolean}  should collapse
     */
    TextMetrics.collapseNewlines = function (whiteSpace) {
        return (whiteSpace === 'normal');
    };
    /**
     * trims breaking whitespaces from string
     *
     * @private
     * @param  {string}  text - The text
     * @return {string}  trimmed string
     */
    TextMetrics.trimRight = function (text) {
        if (typeof text !== 'string') {
            return '';
        }
        for (var i = text.length - 1; i >= 0; i--) {
            var char = text[i];
            if (!TextMetrics.isBreakingSpace(char)) {
                break;
            }
            text = text.slice(0, -1);
        }
        return text;
    };
    /**
     * Determines if char is a newline.
     *
     * @private
     * @param  {string}  char - The character
     * @return {boolean}  True if newline, False otherwise.
     */
    TextMetrics.isNewline = function (char) {
        if (typeof char !== 'string') {
            return false;
        }
        return (TextMetrics._newlines.indexOf(char.charCodeAt(0)) >= 0);
    };
    /**
     * Determines if char is a breaking whitespace.
     *
     * @private
     * @param  {string}  char - The character
     * @return {boolean}  True if whitespace, False otherwise.
     */
    TextMetrics.isBreakingSpace = function (char) {
        if (typeof char !== 'string') {
            return false;
        }
        return (TextMetrics._breakingSpaces.indexOf(char.charCodeAt(0)) >= 0);
    };
    /**
     * Splits a string into words, breaking-spaces and newLine characters
     *
     * @private
     * @param  {string}  text - The text
     * @return {string[]}  A tokenized array
     */
    TextMetrics.tokenize = function (text) {
        var tokens = [];
        var token = '';
        if (typeof text !== 'string') {
            return tokens;
        }
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            if (TextMetrics.isBreakingSpace(char) || TextMetrics.isNewline(char)) {
                if (token !== '') {
                    tokens.push(token);
                    token = '';
                }
                tokens.push(char);
                continue;
            }
            token += char;
        }
        if (token !== '') {
            tokens.push(token);
        }
        return tokens;
    };
    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It allows one to customise which words should break
     * Examples are if the token is CJK or numbers.
     * It must return a boolean.
     *
     * @param  {string}  token       - The token
     * @param  {boolean}  breakWords - The style attr break words
     * @return {boolean} whether to break word or not
     */
    TextMetrics.canBreakWords = function (_token, breakWords) {
        return breakWords;
    };
    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It allows one to determine whether a pair of characters
     * should be broken by newlines
     * For example certain characters in CJK langs or numbers.
     * It must return a boolean.
     *
     * @param  {string}  char        - The character
     * @param  {string}  nextChar    - The next character
     * @param  {string}  token       - The token/word the characters are from
     * @param  {number}  index       - The index in the token of the char
     * @param  {boolean}  breakWords - The style attr break words
     * @return {boolean} whether to break word or not
     */
    TextMetrics.canBreakChars = function (_char, _nextChar, _token, _index, _breakWords) {
        return true;
    };
    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It is called when a token (usually a word) has to be split into separate pieces
     * in order to determine the point to break a word.
     * It must return an array of characters.
     *
     * @example
     * // Correctly splits emojis, eg "🤪🤪" will result in two element array, each with one emoji.
     * TextMetrics.wordWrapSplit = (token) => [...token];
     *
     * @param  {string}  token - The token to split
     * @return {string[]} The characters of the token
     */
    TextMetrics.wordWrapSplit = function (token) {
        return token.split('');
    };
    /**
     * Calculates the ascent, descent and fontSize of a given font-style
     *
     * @static
     * @param {string} font - String representing the style of the font
     * @return {PIXI.IFontMetrics} Font properties object
     */
    TextMetrics.measureFont = function (font) {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (TextMetrics._fonts[font]) {
            return TextMetrics._fonts[font];
        }
        var properties = {
            ascent: 0,
            descent: 0,
            fontSize: 0,
        };
        var canvas = TextMetrics._canvas;
        var context = TextMetrics._context;
        context.font = font;
        var metricsString = TextMetrics.METRICS_STRING + TextMetrics.BASELINE_SYMBOL;
        var width = Math.ceil(context.measureText(metricsString).width);
        var baseline = Math.ceil(context.measureText(TextMetrics.BASELINE_SYMBOL).width);
        var height = 2 * baseline;
        baseline = baseline * TextMetrics.BASELINE_MULTIPLIER | 0;
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);
        context.font = font;
        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText(metricsString, 0, baseline);
        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;
        var i = 0;
        var idx = 0;
        var stop = false;
        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; ++i) {
            for (var j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (!stop) {
                idx += line;
            }
            else {
                break;
            }
        }
        properties.ascent = baseline - i;
        idx = pixels - line;
        stop = false;
        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; --i) {
            for (var j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (!stop) {
                idx -= line;
            }
            else {
                break;
            }
        }
        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;
        TextMetrics._fonts[font] = properties;
        return properties;
    };
    /**
     * Clear font metrics in metrics cache.
     *
     * @static
     * @param {string} [font] - font name. If font name not set then clear cache for all fonts.
     */
    TextMetrics.clearMetrics = function (font) {
        if (font === void 0) { font = ''; }
        if (font) {
            delete TextMetrics._fonts[font];
        }
        else {
            TextMetrics._fonts = {};
        }
    };
    return TextMetrics;
}());
/**
 * Internal return object for {@link PIXI.TextMetrics.measureFont `TextMetrics.measureFont`}.
 *
 * @typedef {object} FontMetrics
 * @property {number} ascent - The ascent distance
 * @property {number} descent - The descent distance
 * @property {number} fontSize - Font size from ascent to descent
 * @memberof PIXI.TextMetrics
 * @private
 */
var canvas = (function () {
    try {
        // OffscreenCanvas2D measureText can be up to 40% faster.
        var c = new OffscreenCanvas(0, 0);
        var context = c.getContext('2d');
        if (context && context.measureText) {
            return c;
        }
        return document.createElement('canvas');
    }
    catch (ex) {
        return document.createElement('canvas');
    }
})();
canvas.width = canvas.height = 10;
/**
 * Cached canvas element for measuring text
 *
 * @memberof PIXI.TextMetrics
 * @type {HTMLCanvasElement}
 * @private
 */
TextMetrics._canvas = canvas;
/**
 * Cache for context to use.
 *
 * @memberof PIXI.TextMetrics
 * @type {CanvasRenderingContext2D}
 * @private
 */
TextMetrics._context = canvas.getContext('2d');
/**
 * Cache of {@see PIXI.TextMetrics.FontMetrics} objects.
 *
 * @memberof PIXI.TextMetrics
 * @type {Object}
 * @private
 */
TextMetrics._fonts = {};
/**
 * String used for calculate font metrics.
 * These characters are all tall to help calculate the height required for text.
 *
 * @static
 * @memberof PIXI.TextMetrics
 * @name METRICS_STRING
 * @type {string}
 * @default |ÉqÅ
 */
TextMetrics.METRICS_STRING = '|ÉqÅ';
/**
 * Baseline symbol for calculate font metrics.
 *
 * @static
 * @memberof PIXI.TextMetrics
 * @name BASELINE_SYMBOL
 * @type {string}
 * @default M
 */
TextMetrics.BASELINE_SYMBOL = 'M';
/**
 * Baseline multiplier for calculate font metrics.
 *
 * @static
 * @memberof PIXI.TextMetrics
 * @name BASELINE_MULTIPLIER
 * @type {number}
 * @default 1.4
 */
TextMetrics.BASELINE_MULTIPLIER = 1.4;
/**
 * Cache of new line chars.
 *
 * @memberof PIXI.TextMetrics
 * @type {number[]}
 * @private
 */
TextMetrics._newlines = [
    0x000A,
    0x000D ];
/**
 * Cache of breaking spaces.
 *
 * @memberof PIXI.TextMetrics
 * @type {number[]}
 * @private
 */
TextMetrics._breakingSpaces = [
    0x0009,
    0x0020,
    0x2000,
    0x2001,
    0x2002,
    0x2003,
    0x2004,
    0x2005,
    0x2006,
    0x2008,
    0x2009,
    0x200A,
    0x205F,
    0x3000 ];
/**
 * A number, or a string containing a number.
 *
 * @memberof PIXI
 * @typedef IFontMetrics
 * @property {number} ascent - Font ascent
 * @property {number} descent - Font descent
 * @property {number} fontSize - Font size
 */

var defaultDestroyOptions = {
    texture: true,
    children: false,
    baseTexture: true,
};
/**
 * A Text Object will create a line or multiple lines of text.
 *
 * The text is created using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 *
 * The primary advantage of this class over BitmapText is that you have great control over the style of the text,
 * which you can change at runtime.
 *
 * The primary disadvantages is that each piece of text has it's own texture, which can use more memory.
 * When text changes, this texture has to be re-generated and re-uploaded to the GPU, taking up time.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 *
 * A Text can be created directly from a string and a style object,
 * which can be generated [here](https://pixijs.io/pixi-text-style).
 *
 * ```js
 * let text = new PIXI.Text('This is a PixiJS text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    /**
     * @param {string} text - The string that you would like the text to display
     * @param {object|PIXI.TextStyle} [style] - The style parameters
     * @param {HTMLCanvasElement} [canvas] - The canvas element for drawing text
     */
    function Text(text, style, canvas) {
        var _this = this;
        var ownCanvas = false;
        if (!canvas) {
            canvas = document.createElement('canvas');
            ownCanvas = true;
        }
        canvas.width = 3;
        canvas.height = 3;
        var texture = Texture.from(canvas);
        texture.orig = new Rectangle();
        texture.trim = new Rectangle();
        _this = _super.call(this, texture) || this;
        /**
         * Keep track if this Text object created it's own canvas
         * element (`true`) or uses the constructor argument (`false`).
         * Used to workaround a GC issues with Safari < 13 when
         * destroying Text. See `destroy` for more info.
         *
         * @member {boolean}
         * @private
         */
        _this._ownCanvas = ownCanvas;
        /**
         * The canvas element that everything is drawn to
         *
         * @member {HTMLCanvasElement}
         */
        _this.canvas = canvas;
        /**
         * The canvas 2d context that everything is drawn with
         * @member {CanvasRenderingContext2D}
         */
        _this.context = _this.canvas.getContext('2d');
        /**
         * The resolution / device pixel ratio of the canvas.
         * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
         * @member {number}
         * @default 1
         */
        _this._resolution = settings.RESOLUTION;
        _this._autoResolution = true;
        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        _this._text = null;
        /**
         * Private tracker for the current style.
         *
         * @member {object}
         * @private
         */
        _this._style = null;
        /**
         * Private listener to track style changes.
         *
         * @member {Function}
         * @private
         */
        _this._styleListener = null;
        /**
         * Private tracker for the current font.
         *
         * @member {string}
         * @private
         */
        _this._font = '';
        _this.text = text;
        _this.style = style;
        _this.localStyleID = -1;
        return _this;
    }
    /**
     * Renders text to its canvas, and updates its texture.
     * By default this is used internally to ensure the texture is correct before rendering,
     * but it can be used called externally, for example from this class to 'pre-generate' the texture from a piece of text,
     * and then shared across multiple Sprites.
     *
     * @param {boolean} respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
     */
    Text.prototype.updateText = function (respectDirty) {
        var style = this._style;
        // check if style has changed..
        if (this.localStyleID !== style.styleID) {
            this.dirty = true;
            this.localStyleID = style.styleID;
        }
        if (!this.dirty && respectDirty) {
            return;
        }
        this._font = this._style.toFontString();
        var context = this.context;
        var measured = TextMetrics.measureText(this._text || ' ', this._style, this._style.wordWrap, this.canvas);
        var width = measured.width;
        var height = measured.height;
        var lines = measured.lines;
        var lineHeight = measured.lineHeight;
        var lineWidths = measured.lineWidths;
        var maxLineWidth = measured.maxLineWidth;
        var fontProperties = measured.fontProperties;
        this.canvas.width = Math.ceil((Math.max(1, width) + (style.padding * 2)) * this._resolution);
        this.canvas.height = Math.ceil((Math.max(1, height) + (style.padding * 2)) * this._resolution);
        context.scale(this._resolution, this._resolution);
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.font = this._font;
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;
        var linePositionX;
        var linePositionY;
        // require 2 passes if a shadow; the first to draw the drop shadow, the second to draw the text
        var passesCount = style.dropShadow ? 2 : 1;
        // For v4, we drew text at the colours of the drop shadow underneath the normal text. This gave the correct zIndex,
        // but features such as alpha and shadowblur did not look right at all, since we were using actual text as a shadow.
        //
        // For v5.0.0, we moved over to just use the canvas API for drop shadows, which made them look much nicer and more
        // visually please, but now because the stroke is drawn and then the fill, drop shadows would appear on both the fill
        // and the stroke; and fill drop shadows would appear over the top of the stroke.
        //
        // For v5.1.1, the new route is to revert to v4 style of drawing text first to get the drop shadows underneath normal
        // text, but instead drawing text in the correct location, we'll draw it off screen (-paddingY), and then adjust the
        // drop shadow so only that appears on screen (+paddingY). Now we'll have the correct draw order of the shadow
        // beneath the text, whilst also having the proper text shadow styling.
        for (var i = 0; i < passesCount; ++i) {
            var isShadowPass = style.dropShadow && i === 0;
            // we only want the drop shadow, so put text way off-screen
            var dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + (style.padding * 2)) : 0;
            var dsOffsetShadow = dsOffsetText * this._resolution;
            if (isShadowPass) {
                // On Safari, text with gradient and drop shadows together do not position correctly
                // if the scale of the canvas is not 1: https://bugs.webkit.org/show_bug.cgi?id=197689
                // Therefore we'll set the styles to be a plain black whilst generating this drop shadow
                context.fillStyle = 'black';
                context.strokeStyle = 'black';
                var dropShadowColor = style.dropShadowColor;
                var rgb = hex2rgb(typeof dropShadowColor === 'number' ? dropShadowColor : string2hex(dropShadowColor));
                context.shadowColor = "rgba(" + rgb[0] * 255 + "," + rgb[1] * 255 + "," + rgb[2] * 255 + "," + style.dropShadowAlpha + ")";
                context.shadowBlur = style.dropShadowBlur;
                context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
                context.shadowOffsetY = (Math.sin(style.dropShadowAngle) * style.dropShadowDistance) + dsOffsetShadow;
            }
            else {
                // set canvas text styles
                context.fillStyle = this._generateFillStyle(style, lines, measured);
                // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
                //       the setter converts to string. See this thread for more details:
                //       https://github.com/microsoft/TypeScript/issues/2521
                context.strokeStyle = style.stroke;
                context.shadowColor = '0';
                context.shadowBlur = 0;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
            }
            // draw lines line by line
            for (var i_1 = 0; i_1 < lines.length; i_1++) {
                linePositionX = style.strokeThickness / 2;
                linePositionY = ((style.strokeThickness / 2) + (i_1 * lineHeight)) + fontProperties.ascent;
                if (style.align === 'right') {
                    linePositionX += maxLineWidth - lineWidths[i_1];
                }
                else if (style.align === 'center') {
                    linePositionX += (maxLineWidth - lineWidths[i_1]) / 2;
                }
                if (style.stroke && style.strokeThickness) {
                    this.drawLetterSpacing(lines[i_1], linePositionX + style.padding, linePositionY + style.padding - dsOffsetText, true);
                }
                if (style.fill) {
                    this.drawLetterSpacing(lines[i_1], linePositionX + style.padding, linePositionY + style.padding - dsOffsetText);
                }
            }
        }
        this.updateTexture();
    };
    /**
     * Render the text with letter-spacing.
     * @param {string} text - The text to draw
     * @param {number} x - Horizontal position to draw the text
     * @param {number} y - Vertical position to draw the text
     * @param {boolean} [isStroke=false] - Is this drawing for the outside stroke of the
     *  text? If not, it's for the inside fill
     * @private
     */
    Text.prototype.drawLetterSpacing = function (text, x, y, isStroke) {
        if (isStroke === void 0) { isStroke = false; }
        var style = this._style;
        // letterSpacing of 0 means normal
        var letterSpacing = style.letterSpacing;
        if (letterSpacing === 0) {
            if (isStroke) {
                this.context.strokeText(text, x, y);
            }
            else {
                this.context.fillText(text, x, y);
            }
            return;
        }
        var currentPosition = x;
        // Using Array.from correctly splits characters whilst keeping emoji together.
        // This is not supported on IE as it requires ES6, so regular text splitting occurs.
        // This also doesn't account for emoji that are multiple emoji put together to make something else.
        // Handling all of this would require a big library itself.
        // https://medium.com/@giltayar/iterating-over-emoji-characters-the-es6-way-f06e4589516
        // https://github.com/orling/grapheme-splitter
        var stringArray = Array.from ? Array.from(text) : text.split('');
        var previousWidth = this.context.measureText(text).width;
        var currentWidth = 0;
        for (var i = 0; i < stringArray.length; ++i) {
            var currentChar = stringArray[i];
            if (isStroke) {
                this.context.strokeText(currentChar, currentPosition, y);
            }
            else {
                this.context.fillText(currentChar, currentPosition, y);
            }
            currentWidth = this.context.measureText(text.substring(i + 1)).width;
            currentPosition += previousWidth - currentWidth + letterSpacing;
            previousWidth = currentWidth;
        }
    };
    /**
     * Updates texture size based on canvas size
     *
     * @private
     */
    Text.prototype.updateTexture = function () {
        var canvas = this.canvas;
        if (this._style.trim) {
            var trimmed = trimCanvas(canvas);
            if (trimmed.data) {
                canvas.width = trimmed.width;
                canvas.height = trimmed.height;
                this.context.putImageData(trimmed.data, 0, 0);
            }
        }
        var texture = this._texture;
        var style = this._style;
        var padding = style.trim ? 0 : style.padding;
        var baseTexture = texture.baseTexture;
        texture.trim.width = texture._frame.width = Math.ceil(canvas.width / this._resolution);
        texture.trim.height = texture._frame.height = Math.ceil(canvas.height / this._resolution);
        texture.trim.x = -padding;
        texture.trim.y = -padding;
        texture.orig.width = texture._frame.width - (padding * 2);
        texture.orig.height = texture._frame.height - (padding * 2);
        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();
        baseTexture.setRealSize(canvas.width, canvas.height, this._resolution);
        // Recursively updates transform of all objects from the root to this one
        this._recursivePostUpdateTransform();
        this.dirty = false;
    };
    /**
     * Renders the object using the WebGL renderer
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    Text.prototype._render = function (renderer) {
        if (this._autoResolution && this._resolution !== renderer.resolution) {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }
        this.updateText(true);
        _super.prototype._render.call(this, renderer);
    };
    /**
     * Gets the local bounds of the text object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */
    Text.prototype.getLocalBounds = function (rect) {
        this.updateText(true);
        return _super.prototype.getLocalBounds.call(this, rect);
    };
    /**
     * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
     * @protected
     */
    Text.prototype._calculateBounds = function () {
        this.updateText(true);
        this.calculateVertices();
        // if we have already done this on THIS frame.
        this._bounds.addQuad(this.vertexData);
    };
    /**
     * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
     *
     * @private
     * @param {object} style - The style.
     * @param {string[]} lines - The lines of text.
     * @return {string|number|CanvasGradient} The fill style
     */
    Text.prototype._generateFillStyle = function (style, lines, metrics) {
        // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
        //       the setter converts to string. See this thread for more details:
        //       https://github.com/microsoft/TypeScript/issues/2521
        var fillStyle = style.fill;
        if (!Array.isArray(fillStyle)) {
            return fillStyle;
        }
        else if (fillStyle.length === 1) {
            return fillStyle[0];
        }
        // the gradient will be evenly spaced out according to how large the array is.
        // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
        var gradient;
        // a dropshadow will enlarge the canvas and result in the gradient being
        // generated with the incorrect dimensions
        var dropShadowCorrection = (style.dropShadow) ? style.dropShadowDistance : 0;
        // should also take padding into account, padding can offset the gradient
        var padding = style.padding || 0;
        var width = Math.ceil(this.canvas.width / this._resolution) - dropShadowCorrection - (padding * 2);
        var height = Math.ceil(this.canvas.height / this._resolution) - dropShadowCorrection - (padding * 2);
        // make a copy of the style settings, so we can manipulate them later
        var fill = fillStyle.slice();
        var fillGradientStops = style.fillGradientStops.slice();
        // wanting to evenly distribute the fills. So an array of 4 colours should give fills of 0.25, 0.5 and 0.75
        if (!fillGradientStops.length) {
            var lengthPlus1 = fill.length + 1;
            for (var i = 1; i < lengthPlus1; ++i) {
                fillGradientStops.push(i / lengthPlus1);
            }
        }
        // stop the bleeding of the last gradient on the line above to the top gradient of the this line
        // by hard defining the first gradient colour at point 0, and last gradient colour at point 1
        fill.unshift(fillStyle[0]);
        fillGradientStops.unshift(0);
        fill.push(fillStyle[fillStyle.length - 1]);
        fillGradientStops.push(1);
        if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL) {
            // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
            gradient = this.context.createLinearGradient(width / 2, padding, width / 2, height + padding);
            // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
            // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
            // There's potential for floating point precision issues at the seams between gradient repeats.
            // The loop below generates the stops in order, so track the last generated one to prevent
            // floating point precision from making us go the teeniest bit backwards, resulting in
            // the first and last colors getting swapped.
            var lastIterationStop = 0;
            // Actual height of the text itself, not counting spacing for lineHeight/leading/dropShadow etc
            var textHeight = metrics.fontProperties.fontSize + style.strokeThickness;
            // textHeight, but as a 0-1 size in global gradient stop space
            var gradStopLineHeight = textHeight / height;
            for (var i = 0; i < lines.length; i++) {
                var thisLineTop = metrics.lineHeight * i;
                for (var j = 0; j < fill.length; j++) {
                    // 0-1 stop point for the current line, multiplied to global space afterwards
                    var lineStop = 0;
                    if (typeof fillGradientStops[j] === 'number') {
                        lineStop = fillGradientStops[j];
                    }
                    else {
                        lineStop = j / fill.length;
                    }
                    var globalStop = (thisLineTop / height) + (lineStop * gradStopLineHeight);
                    // Prevent color stop generation going backwards from floating point imprecision
                    var clampedStop = Math.max(lastIterationStop, globalStop);
                    clampedStop = Math.min(clampedStop, 1); // Cap at 1 as well for safety's sake to avoid a possible throw.
                    gradient.addColorStop(clampedStop, fill[j]);
                    lastIterationStop = clampedStop;
                }
            }
        }
        else {
            // start the gradient at the center left of the canvas, and end at the center right of the canvas
            gradient = this.context.createLinearGradient(padding, height / 2, width + padding, height / 2);
            // can just evenly space out the gradients in this case, as multiple lines makes no difference
            // to an even left to right gradient
            var totalIterations = fill.length + 1;
            var currentIteration = 1;
            for (var i = 0; i < fill.length; i++) {
                var stop = void 0;
                if (typeof fillGradientStops[i] === 'number') {
                    stop = fillGradientStops[i];
                }
                else {
                    stop = currentIteration / totalIterations;
                }
                gradient.addColorStop(stop, fill[i]);
                currentIteration++;
            }
        }
        return gradient;
    };
    /**
     * Destroys this text object.
     * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
     * the majority of the time the texture will not be shared with any other Sprites.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=true] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=true] - Should it destroy the base texture of the sprite as well
     */
    Text.prototype.destroy = function (options) {
        if (typeof options === 'boolean') {
            options = { children: options };
        }
        options = Object.assign({}, defaultDestroyOptions, options);
        _super.prototype.destroy.call(this, options);
        // set canvas width and height to 0 to workaround memory leak in Safari < 13
        // https://stackoverflow.com/questions/52532614/total-canvas-memory-use-exceeds-the-maximum-limit-safari-12
        if (this._ownCanvas) {
            this.canvas.height = this.canvas.width = 0;
        }
        // make sure to reset the the context and canvas.. dont want this hanging around in memory!
        this.context = null;
        this.canvas = null;
        this._style = null;
    };
    Object.defineProperty(Text.prototype, "width", {
        /**
         * The width of the Text, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         */
        get: function () {
            this.updateText(true);
            return Math.abs(this.scale.x) * this._texture.orig.width;
        },
        set: function (value) {
            this.updateText(true);
            var s = sign(this.scale.x) || 1;
            this.scale.x = s * value / this._texture.orig.width;
            this._width = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "height", {
        /**
         * The height of the Text, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         */
        get: function () {
            this.updateText(true);
            return Math.abs(this.scale.y) * this._texture.orig.height;
        },
        set: function (value) {
            this.updateText(true);
            var s = sign(this.scale.y) || 1;
            this.scale.y = s * value / this._texture.orig.height;
            this._height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "style", {
        /**
         * Set the style of the text. Set up an event listener to listen for changes on the style
         * object and mark the text as dirty.
         *
         * @member {object|PIXI.TextStyle}
         */
        get: function () {
            // TODO: Can't have different types for getter and setter. The getter shouldn't have the ITextStyle
            //       since the setter creates the TextStyle. See this thread for more details:
            //       https://github.com/microsoft/TypeScript/issues/2521
            return this._style;
        },
        set: function (style) {
            style = style || {};
            if (style instanceof TextStyle) {
                this._style = style;
            }
            else {
                this._style = new TextStyle(style);
            }
            this.localStyleID = -1;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "text", {
        /**
         * Set the copy for the text object. To split a line you can use '\n'.
         *
         * @member {string}
         */
        get: function () {
            return this._text;
        },
        set: function (text) {
            text = String(text === null || text === undefined ? '' : text);
            if (this._text === text) {
                return;
            }
            this._text = text;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "resolution", {
        /**
         * The resolution / device pixel ratio of the canvas.
         * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
         * @member {number}
         * @default 1
         */
        get: function () {
            return this._resolution;
        },
        set: function (value) {
            this._autoResolution = false;
            if (this._resolution === value) {
                return;
            }
            this._resolution = value;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    return Text;
}(Sprite));

export { TEXT_GRADIENT, Text, TextMetrics, TextStyle };
//# sourceMappingURL=text.es.js.map
