'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // disabling eslint for now, going to rewrite this in v5
/* eslint-disable */

var _const = require('../const');

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultStyle = {
    align: 'left',
    breakWords: false,
    dropShadow: false,
    dropShadowAlpha: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 0,
    dropShadowColor: '#000000',
    dropShadowDistance: 5,
    fill: 'black',
    fillGradientType: _const.TEXT_GRADIENT.LINEAR_VERTICAL,
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
    wordWrap: false,
    wordWrapWidth: 100
};

/**
 * A TextStyle Object decorates a Text Object. It can be shared between
 * multiple Text objects. Changing the style will update all text objects using it.
 *
 * @class
 * @memberof PIXI
 */

var TextStyle = function () {
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
     * @param {string} [style.dropShadowColor='#000000'] - A fill style to be used on the dropshadow e.g 'red', '#00FF00'
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
     *  '200', '300', '400', '500', '600', '700', 800' or '900')
     * @param {number} [style.letterSpacing=0] - The amount of spacing between letters, default is 0
     * @param {number} [style.lineHeight] - The line height, a number that represents the vertical space that a letter uses
     * @param {string} [style.lineJoin='miter'] - The lineJoin property sets the type of corner created, it can resolve
     *      spiked text issues. Default is 'miter' (creates a sharp corner).
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
     * @param {boolean} [style.wordWrap=false] - Indicates if word wrap should be used
     * @param {number} [style.wordWrapWidth=100] - The width at which text will wrap, it needs wordWrap to be set to true
     */
    function TextStyle(style) {
        _classCallCheck(this, TextStyle);

        this.styleID = 0;

        Object.assign(this, defaultStyle, style);
    }

    /**
     * Creates a new TextStyle object with the same values as this one.
     * Note that the only the properties of the object are cloned.
     *
     * @return {PIXI.TextStyle} New cloned TextStyle object
     */


    TextStyle.prototype.clone = function clone() {
        var clonedProperties = {};

        for (var key in defaultStyle) {
            clonedProperties[key] = this[key];
        }

        return new TextStyle(clonedProperties);
    };

    /**
     * Resets all properties to the defaults specified in TextStyle.prototype._default
     */


    TextStyle.prototype.reset = function reset() {
        Object.assign(this, defaultStyle);
    };

    _createClass(TextStyle, [{
        key: 'align',
        get: function get() {
            return this._align;
        },
        set: function set(align) {
            if (this._align !== align) {
                this._align = align;
                this.styleID++;
            }
        }
    }, {
        key: 'breakWords',
        get: function get() {
            return this._breakWords;
        },
        set: function set(breakWords) {
            if (this._breakWords !== breakWords) {
                this._breakWords = breakWords;
                this.styleID++;
            }
        }
    }, {
        key: 'dropShadow',
        get: function get() {
            return this._dropShadow;
        },
        set: function set(dropShadow) {
            if (this._dropShadow !== dropShadow) {
                this._dropShadow = dropShadow;
                this.styleID++;
            }
        }
    }, {
        key: 'dropShadowAlpha',
        get: function get() {
            return this._dropShadowAlpha;
        },
        set: function set(dropShadowAlpha) {
            if (this._dropShadowAlpha !== dropShadowAlpha) {
                this._dropShadowAlpha = dropShadowAlpha;
                this.styleID++;
            }
        }
    }, {
        key: 'dropShadowAngle',
        get: function get() {
            return this._dropShadowAngle;
        },
        set: function set(dropShadowAngle) {
            if (this._dropShadowAngle !== dropShadowAngle) {
                this._dropShadowAngle = dropShadowAngle;
                this.styleID++;
            }
        }
    }, {
        key: 'dropShadowBlur',
        get: function get() {
            return this._dropShadowBlur;
        },
        set: function set(dropShadowBlur) {
            if (this._dropShadowBlur !== dropShadowBlur) {
                this._dropShadowBlur = dropShadowBlur;
                this.styleID++;
            }
        }
    }, {
        key: 'dropShadowColor',
        get: function get() {
            return this._dropShadowColor;
        },
        set: function set(dropShadowColor) {
            var outputColor = getColor(dropShadowColor);
            if (this._dropShadowColor !== outputColor) {
                this._dropShadowColor = outputColor;
                this.styleID++;
            }
        }
    }, {
        key: 'dropShadowDistance',
        get: function get() {
            return this._dropShadowDistance;
        },
        set: function set(dropShadowDistance) {
            if (this._dropShadowDistance !== dropShadowDistance) {
                this._dropShadowDistance = dropShadowDistance;
                this.styleID++;
            }
        }
    }, {
        key: 'fill',
        get: function get() {
            return this._fill;
        },
        set: function set(fill) {
            var outputColor = getColor(fill);
            if (this._fill !== outputColor) {
                this._fill = outputColor;
                this.styleID++;
            }
        }
    }, {
        key: 'fillGradientType',
        get: function get() {
            return this._fillGradientType;
        },
        set: function set(fillGradientType) {
            if (this._fillGradientType !== fillGradientType) {
                this._fillGradientType = fillGradientType;
                this.styleID++;
            }
        }
    }, {
        key: 'fillGradientStops',
        get: function get() {
            return this._fillGradientStops;
        },
        set: function set(fillGradientStops) {
            if (!areArraysEqual(this._fillGradientStops, fillGradientStops)) {
                this._fillGradientStops = fillGradientStops;
                this.styleID++;
            }
        }
    }, {
        key: 'fontFamily',
        get: function get() {
            return this._fontFamily;
        },
        set: function set(fontFamily) {
            if (this.fontFamily !== fontFamily) {
                this._fontFamily = fontFamily;
                this.styleID++;
            }
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this._fontSize;
        },
        set: function set(fontSize) {
            if (this._fontSize !== fontSize) {
                this._fontSize = fontSize;
                this.styleID++;
            }
        }
    }, {
        key: 'fontStyle',
        get: function get() {
            return this._fontStyle;
        },
        set: function set(fontStyle) {
            if (this._fontStyle !== fontStyle) {
                this._fontStyle = fontStyle;
                this.styleID++;
            }
        }
    }, {
        key: 'fontVariant',
        get: function get() {
            return this._fontVariant;
        },
        set: function set(fontVariant) {
            if (this._fontVariant !== fontVariant) {
                this._fontVariant = fontVariant;
                this.styleID++;
            }
        }
    }, {
        key: 'fontWeight',
        get: function get() {
            return this._fontWeight;
        },
        set: function set(fontWeight) {
            if (this._fontWeight !== fontWeight) {
                this._fontWeight = fontWeight;
                this.styleID++;
            }
        }
    }, {
        key: 'letterSpacing',
        get: function get() {
            return this._letterSpacing;
        },
        set: function set(letterSpacing) {
            if (this._letterSpacing !== letterSpacing) {
                this._letterSpacing = letterSpacing;
                this.styleID++;
            }
        }
    }, {
        key: 'lineHeight',
        get: function get() {
            return this._lineHeight;
        },
        set: function set(lineHeight) {
            if (this._lineHeight !== lineHeight) {
                this._lineHeight = lineHeight;
                this.styleID++;
            }
        }
    }, {
        key: 'lineJoin',
        get: function get() {
            return this._lineJoin;
        },
        set: function set(lineJoin) {
            if (this._lineJoin !== lineJoin) {
                this._lineJoin = lineJoin;
                this.styleID++;
            }
        }
    }, {
        key: 'miterLimit',
        get: function get() {
            return this._miterLimit;
        },
        set: function set(miterLimit) {
            if (this._miterLimit !== miterLimit) {
                this._miterLimit = miterLimit;
                this.styleID++;
            }
        }
    }, {
        key: 'padding',
        get: function get() {
            return this._padding;
        },
        set: function set(padding) {
            if (this._padding !== padding) {
                this._padding = padding;
                this.styleID++;
            }
        }
    }, {
        key: 'stroke',
        get: function get() {
            return this._stroke;
        },
        set: function set(stroke) {
            var outputColor = getColor(stroke);
            if (this._stroke !== outputColor) {
                this._stroke = outputColor;
                this.styleID++;
            }
        }
    }, {
        key: 'strokeThickness',
        get: function get() {
            return this._strokeThickness;
        },
        set: function set(strokeThickness) {
            if (this._strokeThickness !== strokeThickness) {
                this._strokeThickness = strokeThickness;
                this.styleID++;
            }
        }
    }, {
        key: 'textBaseline',
        get: function get() {
            return this._textBaseline;
        },
        set: function set(textBaseline) {
            if (this._textBaseline !== textBaseline) {
                this._textBaseline = textBaseline;
                this.styleID++;
            }
        }
    }, {
        key: 'trim',
        get: function get() {
            return this._trim;
        },
        set: function set(trim) {
            if (this._trim !== trim) {
                this._trim = trim;
                this.styleID++;
            }
        }
    }, {
        key: 'wordWrap',
        get: function get() {
            return this._wordWrap;
        },
        set: function set(wordWrap) {
            if (this._wordWrap !== wordWrap) {
                this._wordWrap = wordWrap;
                this.styleID++;
            }
        }
    }, {
        key: 'wordWrapWidth',
        get: function get() {
            return this._wordWrapWidth;
        },
        set: function set(wordWrapWidth) {
            if (this._wordWrapWidth !== wordWrapWidth) {
                this._wordWrapWidth = wordWrapWidth;
                this.styleID++;
            }
        }
    }]);

    return TextStyle;
}();

/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 *
 * @param {number|number[]} color
 * @return {string} The color as a string.
 */


exports.default = TextStyle;
function getSingleColor(color) {
    if (typeof color === 'number') {
        return (0, _utils.hex2string)(color);
    } else if (typeof color === 'string') {
        if (color.indexOf('0x') === 0) {
            color = color.replace('0x', '#');
        }
    }

    return color;
}

/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 * This version can also convert array of colors
 *
 * @param {number|number[]} color
 * @return {string} The color as a string.
 */
function getColor(color) {
    if (!Array.isArray(color)) {
        return getSingleColor(color);
    } else {
        for (var i = 0; i < color.length; ++i) {
            color[i] = getSingleColor(color[i]);
        }

        return color;
    }
}

/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 * This version can also convert array of colors
 *
 * @param {Array} array1 First array to compare
 * @param {Array} array2 Second array to compare
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
//# sourceMappingURL=TextStyle.js.map