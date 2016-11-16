'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Sprite2 = require('../sprites/Sprite');

var _Sprite3 = _interopRequireDefault(_Sprite2);

var _Texture = require('../textures/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _math = require('../math');

var _utils = require('../utils');

var _const = require('../const');

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _TextStyle = require('./TextStyle');

var _TextStyle2 = _interopRequireDefault(_TextStyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint max-depth: [2, 8] */


var RESOLUTION = _settings2.default.RESOLUTION;


var defaultDestroyOptions = {
    texture: true,
    children: false,
    baseTexture: true
};

/**
 * A Text Object will create a line or multiple lines of text. To split a line you can use '\n' in your text string,
 * or add a wordWrap property set to true and and wordWrapWidth property with a value in the style object.
 *
 * A Text can be created directly from a string and a style object
 *
 * ```js
 * let text = new PIXI.Text('This is a pixi text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */

var Text = function (_Sprite) {
    _inherits(Text, _Sprite);

    /**
     * @param {string} text - The string that you would like the text to display
     * @param {object|PIXI.TextStyle} [style] - The style parameters
     */
    function Text(text, style) {
        _classCallCheck(this, Text);

        var canvas = document.createElement('canvas');

        canvas.width = 3;
        canvas.height = 3;

        var texture = _Texture2.default.fromCanvas(canvas);

        texture.orig = new _math.Rectangle();
        texture.trim = new _math.Rectangle();

        /**
         * The canvas element that everything is drawn to
         *
         * @member {HTMLCanvasElement}
         */
        var _this = _possibleConstructorReturn(this, _Sprite.call(this, texture));

        _this.canvas = canvas;

        /**
         * The canvas 2d context that everything is drawn with
         * @member {HTMLCanvasElement}
         */
        _this.context = _this.canvas.getContext('2d');

        /**
         * The resolution / device pixel ratio of the canvas. This is set automatically by the renderer.
         * @member {number}
         * @default 1
         */
        _this.resolution = RESOLUTION;

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
     * Renders text and updates it when needed.
     *
     * @private
     * @param {boolean} respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
     */


    Text.prototype.updateText = function updateText(respectDirty) {
        var style = this._style;

        // check if style has changed..
        if (this.localStyleID !== style.styleID) {
            this.dirty = true;
            this.localStyleID = style.styleID;
        }

        if (!this.dirty && respectDirty) {
            return;
        }

        this._font = Text.getFontStyle(style);

        this.context.font = this._font;

        // word wrap
        // preserve original text
        var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;

        // split text into lines
        var lines = outputText.split(/(?:\r\n|\r|\n)/);

        // calculate text width
        var lineWidths = new Array(lines.length);
        var maxLineWidth = 0;
        var fontProperties = Text.calculateFontProperties(this._font);

        for (var i = 0; i < lines.length; i++) {
            var lineWidth = this.context.measureText(lines[i]).width + (lines[i].length - 1) * style.letterSpacing;

            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }

        var width = maxLineWidth + style.strokeThickness;

        if (style.dropShadow) {
            width += style.dropShadowDistance;
        }

        width += style.padding * 2;

        this.canvas.width = Math.ceil((width + this.context.lineWidth) * this.resolution);

        // calculate text height
        var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

        var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness) + (lines.length - 1) * lineHeight;

        if (style.dropShadow) {
            height += style.dropShadowDistance;
        }

        this.canvas.height = Math.ceil((height + this._style.padding * 2) * this.resolution);

        this.context.scale(this.resolution, this.resolution);

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.font = this._font;
        this.context.strokeStyle = style.stroke;
        this.context.lineWidth = style.strokeThickness;
        this.context.textBaseline = style.textBaseline;
        this.context.lineJoin = style.lineJoin;
        this.context.miterLimit = style.miterLimit;

        var linePositionX = void 0;
        var linePositionY = void 0;

        if (style.dropShadow) {
            if (style.dropShadowBlur > 0) {
                this.context.shadowColor = style.dropShadowColor;
                this.context.shadowBlur = style.dropShadowBlur;
            } else {
                this.context.fillStyle = style.dropShadowColor;
            }

            var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
            var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

            for (var _i = 0; _i < lines.length; _i++) {
                linePositionX = style.strokeThickness / 2;
                linePositionY = style.strokeThickness / 2 + _i * lineHeight + fontProperties.ascent;

                if (style.align === 'right') {
                    linePositionX += maxLineWidth - lineWidths[_i];
                } else if (style.align === 'center') {
                    linePositionX += (maxLineWidth - lineWidths[_i]) / 2;
                }

                if (style.fill) {
                    this.drawLetterSpacing(lines[_i], linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding);

                    if (style.stroke && style.strokeThickness) {
                        this.context.strokeStyle = style.dropShadowColor;
                        this.drawLetterSpacing(lines[_i], linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding, true);
                        this.context.strokeStyle = style.stroke;
                    }
                }
            }
        }

        // set canvas text styles
        this.context.fillStyle = this._generateFillStyle(style, lines);

        // draw lines line by line
        for (var _i2 = 0; _i2 < lines.length; _i2++) {
            linePositionX = style.strokeThickness / 2;
            linePositionY = style.strokeThickness / 2 + _i2 * lineHeight + fontProperties.ascent;

            if (style.align === 'right') {
                linePositionX += maxLineWidth - lineWidths[_i2];
            } else if (style.align === 'center') {
                linePositionX += (maxLineWidth - lineWidths[_i2]) / 2;
            }

            if (style.stroke && style.strokeThickness) {
                this.drawLetterSpacing(lines[_i2], linePositionX + style.padding, linePositionY + style.padding, true);
            }

            if (style.fill) {
                this.drawLetterSpacing(lines[_i2], linePositionX + style.padding, linePositionY + style.padding);
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


    Text.prototype.drawLetterSpacing = function drawLetterSpacing(text, x, y) {
        var isStroke = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var style = this._style;

        // letterSpacing of 0 means normal
        var letterSpacing = style.letterSpacing;

        if (letterSpacing === 0) {
            if (isStroke) {
                this.context.strokeText(text, x, y);
            } else {
                this.context.fillText(text, x, y);
            }

            return;
        }

        var characters = String.prototype.split.call(text, '');
        var currentPosition = x;
        var index = 0;
        var current = '';

        while (index < text.length) {
            current = characters[index++];
            if (isStroke) {
                this.context.strokeText(current, currentPosition, y);
            } else {
                this.context.fillText(current, currentPosition, y);
            }
            currentPosition += this.context.measureText(current).width + letterSpacing;
        }
    };

    /**
     * Updates texture size based on canvas size
     *
     * @private
     */


    Text.prototype.updateTexture = function updateTexture() {
        var texture = this._texture;
        var style = this._style;

        texture.baseTexture.hasLoaded = true;
        texture.baseTexture.resolution = this.resolution;

        texture.baseTexture.realWidth = this.canvas.width;
        texture.baseTexture.realHeight = this.canvas.height;
        texture.baseTexture.width = this.canvas.width / this.resolution;
        texture.baseTexture.height = this.canvas.height / this.resolution;
        texture.trim.width = texture._frame.width = this.canvas.width / this.resolution;
        texture.trim.height = texture._frame.height = this.canvas.height / this.resolution;

        texture.trim.x = -style.padding;
        texture.trim.y = -style.padding;

        texture.orig.width = texture._frame.width - style.padding * 2;
        texture.orig.height = texture._frame.height - style.padding * 2;

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        texture.baseTexture.emit('update', texture.baseTexture);

        this.dirty = false;
    };

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.WebGLRenderer} renderer - The renderer
     */


    Text.prototype.renderWebGL = function renderWebGL(renderer) {
        if (this.resolution !== renderer.resolution) {
            this.resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        _Sprite.prototype.renderWebGL.call(this, renderer);
    };

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The renderer
     */


    Text.prototype._renderCanvas = function _renderCanvas(renderer) {
        if (this.resolution !== renderer.resolution) {
            this.resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        _Sprite.prototype._renderCanvas.call(this, renderer);
    };

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     *
     * @private
     * @param {string} text - String to apply word wrapping to
     * @return {string} New string with new lines applied where required
     */


    Text.prototype.wordWrap = function wordWrap(text) {
        // Greedy wrapping algorithm that will wrap words as the line grows longer
        // than its horizontal bounds.
        var result = '';
        var lines = text.split('\n');
        var wordWrapWidth = this._style.wordWrapWidth;

        for (var i = 0; i < lines.length; i++) {
            var spaceLeft = wordWrapWidth;
            var words = lines[i].split(' ');

            for (var j = 0; j < words.length; j++) {
                var wordWidth = this.context.measureText(words[j]).width;

                if (this._style.breakWords && wordWidth > wordWrapWidth) {
                    // Word should be split in the middle
                    var characters = words[j].split('');

                    for (var c = 0; c < characters.length; c++) {
                        var characterWidth = this.context.measureText(characters[c]).width;

                        if (characterWidth > spaceLeft) {
                            result += '\n' + characters[c];
                            spaceLeft = wordWrapWidth - characterWidth;
                        } else {
                            if (c === 0) {
                                result += ' ';
                            }

                            result += characters[c];
                            spaceLeft -= characterWidth;
                        }
                    }
                } else {
                    var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;

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
     * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
     */


    Text.prototype._calculateBounds = function _calculateBounds() {
        this.updateText(true);
        this.calculateVertices();
        // if we have already done this on THIS frame.
        this._bounds.addQuad(this.vertexData);
    };

    /**
     * Method to be called upon a TextStyle change.
     * @private
     */


    Text.prototype._onStyleChange = function _onStyleChange() {
        this.dirty = true;
    };

    /**
     * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
     *
     * @private
     * @param {object} style - The style.
     * @param {string} lines - The lines of text.
     * @return {string|number|CanvasGradient} The fill style
     */


    Text.prototype._generateFillStyle = function _generateFillStyle(style, lines) {
        if (!Array.isArray(style.fill)) {
            return style.fill;
        }

        // cocoon on canvas+ cannot generate textures, so use the first colour instead
        if (navigator.isCocoonJS) {
            return style.fill[0];
        }

        // the gradient will be evenly spaced out according to how large the array is.
        // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
        var gradient = void 0;
        var totalIterations = void 0;
        var currentIteration = void 0;
        var stop = void 0;

        var width = this.canvas.width / this.resolution;
        var height = this.canvas.height / this.resolution;

        if (style.fillGradientType === _const.TEXT_GRADIENT.LINEAR_VERTICAL) {
            // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
            gradient = this.context.createLinearGradient(width / 2, 0, width / 2, height);

            // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
            // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
            totalIterations = (style.fill.length + 1) * lines.length;
            currentIteration = 0;
            for (var i = 0; i < lines.length; i++) {
                currentIteration += 1;
                for (var j = 0; j < style.fill.length; j++) {
                    stop = currentIteration / totalIterations;
                    gradient.addColorStop(stop, style.fill[j]);
                    currentIteration++;
                }
            }
        } else {
            // start the gradient at the center left of the canvas, and end at the center right of the canvas
            gradient = this.context.createLinearGradient(0, height / 2, width, height / 2);

            // can just evenly space out the gradients in this case, as multiple lines makes no difference
            // to an even left to right gradient
            totalIterations = style.fill.length + 1;
            currentIteration = 1;

            for (var _i3 = 0; _i3 < style.fill.length; _i3++) {
                stop = currentIteration / totalIterations;
                gradient.addColorStop(stop, style.fill[_i3]);
                currentIteration++;
            }
        }

        return gradient;
    };

    /**
     * Destroys this text object.
     * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
     * the majorety of the time the texture will not be shared with any other Sprites.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=true] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=true] - Should it destroy the base texture of the sprite as well
     */


    Text.prototype.destroy = function destroy(options) {
        if (typeof options === 'boolean') {
            options = { children: options };
        }

        options = Object.assign({}, defaultDestroyOptions, options);

        _Sprite.prototype.destroy.call(this, options);

        // make sure to reset the the context and canvas.. dont want this hanging around in memory!
        this.context = null;
        this.canvas = null;

        this._style = null;
    };

    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */


    /**
     * Generates a font style string to use for Text.calculateFontProperties(). Takes the same parameter
     * as Text.style.
     *
     * @static
     * @param {object|TextStyle} style - String representing the style of the font
     * @return {string} Font style string, for passing to Text.calculateFontProperties()
     */
    Text.getFontStyle = function getFontStyle(style) {
        style = style || {};

        if (!(style instanceof _TextStyle2.default)) {
            style = new _TextStyle2.default(style);
        }

        // build canvas api font setting from individual components. Convert a numeric style.fontSize to px
        var fontSizeString = typeof style.fontSize === 'number' ? style.fontSize + 'px' : style.fontSize;

        return style.fontStyle + ' ' + style.fontVariant + ' ' + style.fontWeight + ' ' + fontSizeString + ' ' + style.fontFamily;
    };

    /**
     * Calculates the ascent, descent and fontSize of a given fontStyle
     *
     * @static
     * @param {string} fontStyle - String representing the style of the font
     * @return {Object} Font properties object
     */


    Text.calculateFontProperties = function calculateFontProperties(fontStyle) {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (Text.fontPropertiesCache[fontStyle]) {
            return Text.fontPropertiesCache[fontStyle];
        }

        var properties = {};

        var canvas = Text.fontPropertiesCanvas;
        var context = Text.fontPropertiesContext;

        context.font = fontStyle;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = fontStyle;

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

        Text.fontPropertiesCache[fontStyle] = properties;

        return properties;
    };

    _createClass(Text, [{
        key: 'width',
        get: function get() {
            this.updateText(true);

            return Math.abs(this.scale.x) * this.texture.orig.width;
        }

        /**
         * Sets the width of the text.
         *
         * @param {number} value - The value to set to.
         */
        ,
        set: function set(value) {
            this.updateText(true);

            var s = (0, _utils.sign)(this.scale.x) || 1;

            this.scale.x = s * value / this.texture.orig.width;
            this._width = value;
        }

        /**
         * The height of the Text, setting this will actually modify the scale to achieve the value set
         *
         * @member {number}
         * @memberof PIXI.Text#
         */

    }, {
        key: 'height',
        get: function get() {
            this.updateText(true);

            return Math.abs(this.scale.y) * this._texture.orig.height;
        }

        /**
         * Sets the height of the text.
         *
         * @param {number} value - The value to set to.
         */
        ,
        set: function set(value) {
            this.updateText(true);

            var s = (0, _utils.sign)(this.scale.y) || 1;

            this.scale.y = s * value / this.texture.orig.height;
            this._height = value;
        }

        /**
         * Set the style of the text. Set up an event listener to listen for changes on the style
         * object and mark the text as dirty.
         *
         * @member {object|PIXI.TextStyle}
         * @memberof PIXI.Text#
         */

    }, {
        key: 'style',
        get: function get() {
            return this._style;
        }

        /**
         * Sets the style of the text.
         *
         * @param {object} style - The value to set to.
         */
        ,
        set: function set(style) {
            style = style || {};

            if (style instanceof _TextStyle2.default) {
                this._style = style;
            } else {
                this._style = new _TextStyle2.default(style);
            }

            this.localStyleID = -1;
            this.dirty = true;
        }

        /**
         * Set the copy for the text object. To split a line you can use '\n'.
         *
         * @member {string}
         * @memberof PIXI.Text#
         */

    }, {
        key: 'text',
        get: function get() {
            return this._text;
        }

        /**
         * Sets the text.
         *
         * @param {string} text - The value to set to.
         */
        ,
        set: function set(text) {
            text = text || ' ';
            text = text.toString();

            if (this._text === text) {
                return;
            }
            this._text = text;
            this.dirty = true;
        }
    }]);

    return Text;
}(_Sprite3.default);

exports.default = Text;


Text.fontPropertiesCache = {};
Text.fontPropertiesCanvas = document.createElement('canvas');
Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');
//# sourceMappingURL=Text.js.map