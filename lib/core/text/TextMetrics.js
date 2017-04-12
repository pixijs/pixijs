'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The TextMetrics object represents the measurement of a block of text with a specified style.
 *
 * @class
 * @memberOf PIXI
 */
var TextMetrics = function () {
    /**
     * @param {string} text - the text that was measured
     * @param {PIXI.TextStyle} style - the style that was measured
     * @param {number} width - the measured width of the text
     * @param {number} height - the measured height of the text
     * @param {array} lines - an array of the lines of text broken by new lines and wrapping if specified in style
     * @param {array} lineWidths - an array of the line widths for each line matched to `lines`
     * @param {number} lineHeight - the measured line height for this style
     * @param {number} maxLineWidth - the maximum line width for all measured lines
     * @param {Object} fontProperties - the font properties object from TextMetrics.measureFont
     */
    function TextMetrics(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties) {
        _classCallCheck(this, TextMetrics);

        this.text = text;
        this.style = style;
        this.width = width;
        this.height = height;
        this.lines = lines;
        this.lineWidths = lineWidths;
        this.lineHeight = lineHeight;
        this.maxLineWidth = maxLineWidth;
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


    TextMetrics.measureText = function measureText(text, style, wordWrap) {
        var canvas = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : TextMetrics._canvas;

        wordWrap = wordWrap || style.wordWrap;
        var font = style.toFontString();
        var fontProperties = TextMetrics.measureFont(font);
        var context = canvas.getContext('2d');

        context.font = font;

        var outputText = wordWrap ? TextMetrics.wordWrap(text, style, canvas) : text;
        var lines = outputText.split(/(?:\r\n|\r|\n)/);
        var lineWidths = new Array(lines.length);
        var maxLineWidth = 0;

        for (var i = 0; i < lines.length; i++) {
            var lineWidth = context.measureText(lines[i]).width + (lines[i].length - 1) * style.letterSpacing;

            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }
        var width = maxLineWidth + style.strokeThickness;

        if (style.dropShadow) {
            width += style.dropShadowDistance;
        }

        var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
        var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness) + (lines.length - 1) * lineHeight;

        if (style.dropShadow) {
            height += style.dropShadowDistance;
        }

        return new TextMetrics(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties);
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


    TextMetrics.wordWrap = function wordWrap(text, style) {
        var canvas = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TextMetrics._canvas;

        var context = canvas.getContext('2d');

        // Greedy wrapping algorithm that will wrap words as the line grows longer
        // than its horizontal bounds.
        var result = '';
        var lines = text.split('\n');
        var wordWrapWidth = style.wordWrapWidth;
        var characterCache = {};

        for (var i = 0; i < lines.length; i++) {
            var spaceLeft = wordWrapWidth;
            var words = lines[i].split(' ');

            for (var j = 0; j < words.length; j++) {
                var wordWidth = context.measureText(words[j]).width;

                if (style.breakWords && wordWidth > wordWrapWidth) {
                    // Word should be split in the middle
                    var characters = words[j].split('');

                    for (var c = 0; c < characters.length; c++) {
                        var character = characters[c];
                        var characterWidth = characterCache[character];

                        if (characterWidth === undefined) {
                            characterWidth = context.measureText(character).width;
                            characterCache[character] = characterWidth;
                        }

                        if (characterWidth > spaceLeft) {
                            result += '\n' + character;
                            spaceLeft = wordWrapWidth - characterWidth;
                        } else {
                            if (c === 0) {
                                result += ' ';
                            }

                            result += character;
                            spaceLeft -= characterWidth;
                        }
                    }
                } else {
                    var wordWidthWithSpace = wordWidth + context.measureText(' ').width;

                    if (j === 0 || wordWidthWithSpace > spaceLeft) {
                        // Skip printing the newline if it's the first word of the line that is
                        // greater than the word wrap width.
                        if (j > 0) {
                            result += '\n';
                        }
                        result += words[j];
                        spaceLeft = wordWrapWidth - wordWidth;
                    } else {
                        spaceLeft -= wordWidthWithSpace;
                        result += ' ' + words[j];
                    }
                }
            }

            if (i < lines.length - 1) {
                result += '\n';
            }
        }

        return result;
    };

    /**
     * Calculates the ascent, descent and fontSize of a given font-style
     *
     * @static
     * @param {string} font - String representing the style of the font
     * @return {PIXI.TextMetrics~FontMetrics} Font properties object
     */


    TextMetrics.measureFont = function measureFont(font) {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (TextMetrics._fonts[font]) {
            return TextMetrics._fonts[font];
        }

        var properties = {};

        var canvas = TextMetrics._canvas;
        var context = TextMetrics._context;

        context.font = font;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = font;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

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
            } else {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; --i) {
            for (var _j = 0; _j < line; _j += 4) {
                if (imagedata[idx + _j] !== 255) {
                    stop = true;
                    break;
                }
            }

            if (!stop) {
                idx -= line;
            } else {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        TextMetrics._fonts[font] = properties;

        return properties;
    };

    return TextMetrics;
}();

/**
 * Internal return object for {@link PIXI.TextMetrics.measureFont `TextMetrics.measureFont`}.
 * @class FontMetrics
 * @memberof PIXI.TextMetrics~
 * @property {number} ascent - The ascent distance
 * @property {number} descent - The descent distance
 * @property {number} fontSize - Font size from ascent to descent
 */

exports.default = TextMetrics;
var canvas = document.createElement('canvas');

canvas.width = canvas.height = 10;

/**
 * Cached canvas element for measuring text
 * @memberof PIXI.TextMetrics
 * @type {HTMLCanvasElement}
 * @private
 */
TextMetrics._canvas = canvas;

/**
 * Cache for context to use.
 * @memberof PIXI.TextMetrics
 * @type {CanvasRenderingContext2D}
 * @private
 */
TextMetrics._context = canvas.getContext('2d');

/**
 * Cache of PIXI.TextMetrics~FontMetrics objects.
 * @memberof PIXI.TextMetrics
 * @type {Object}
 * @private
 */
TextMetrics._fonts = {};
//# sourceMappingURL=TextMetrics.js.map