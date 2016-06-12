var Sprite = require('../sprites/Sprite'),
    Texture = require('../textures/Texture'),
    math = require('../math'),
    CONST = require('../const'),
    TextStyle = require('./TextStyle');

/**
 * A Text Object will create a line or multiple lines of text. To split a line you can use '\n' in your text string,
 * or add a wordWrap property set to true and and wordWrapWidth property with a value in the style object.
 *
 * A Text can be created directly from a string and a style object
 *
 * ```js
 * var text = new PIXI.Text('This is a pixi text',{font : '24px Arial', fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 * @param text {string} The string that you would like the text to display
 * @param [style] {object|PIXI.TextStyle} The style parameters
 * @param [resolution=1] {number} The current resolution / device pixel ratio of the canvas
 */
function Text(text, style, resolution)
{
    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * The canvas 2d context that everything is drawn with
     * @member {HTMLCanvasElement}
     */
    this.context = this.canvas.getContext('2d');

    /**
     * The resolution / device pixel ratio of the canvas
     * @member {number}
     * @default 1
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = null;

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._style = null;
    /**
     * Private listener to track style changes.
     *
     * @member {Function}
     * @private
     */
    this._styleListener = null;

    /**
     * Private tracker for the current font.
     *
     * @member {string}
     * @private
     */
    this._font = '';

    var texture = Texture.fromCanvas(this.canvas);
    texture.trim = new math.Rectangle();
    Sprite.call(this, texture);

    this.text = text;
    this.style = style;
}

// constructor
Text.prototype = Object.create(Sprite.prototype);
Text.prototype.constructor = Text;
module.exports = Text;

Text.fontPropertiesCache = {};
Text.fontPropertiesCanvas = document.createElement('canvas');
Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');

Object.defineProperties(Text.prototype, {
    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    width: {
        get: function ()
        {
            this.updateText(true);

            return this.scale.x * this._texture._frame.width;
        },
        set: function (value)
        {
            this.updateText(true);

            this.scale.x = value / this._texture._frame.width;
            this._width = value;
        }
    },

    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    height: {
        get: function ()
        {
            this.updateText(true);

            return  this.scale.y * this._texture._frame.height;
        },
        set: function (value)
        {
            this.updateText(true);

            this.scale.y = value / this._texture._frame.height;
            this._height = value;
        }
    },

    /**
     * Set the style of the text. Set up an event listener to listen for changes on the style object and mark the text as dirty.
     *
     * @param [style] {object|PIXI.TextStyle} The style parameters
     * @memberof PIXI.Text#
     */
    style: {
        get: function ()
        {
            return this._style;
        },
        set: function (style)
        {
            if (this._style)
            {
                this._style.off(CONST.TEXT_STYLE_CHANGED, this._onStyleChange, this);
            }

            style = style || {};
            if (style instanceof TextStyle)
            {
                this._style = style;
            }
            else
            {
                this._style = new TextStyle(style);
            }
            this._style.on(CONST.TEXT_STYLE_CHANGED, this._onStyleChange, this);
            this.dirty = true;
        }
    },

    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @param text {string} The copy that you would like the text to display
     * @memberof PIXI.Text#
     */
    text: {
        get: function()
        {
            return this._text;
        },
        set: function (text){

            text = text || ' ';
            text = text.toString();

            if (this._text === text)
            {
                return;
            }
            this._text = text;
            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 * @param respectDirty {boolean} Whether to abort updating the text if the Text isn't dirty and the function is called.
 * @private
 */
Text.prototype.updateText = function (respectDirty)
{
    if (!this.dirty && respectDirty) {
        return;
    }
    var style = this._style;

    // build canvas api font setting from invididual components. Convert a numeric style.fontSize to px
    var fontSizeString = (typeof style.fontSize === 'number') ? style.fontSize + 'px' : style.fontSize;
    this._font = style.fontStyle + ' ' + style.fontVariant + ' ' + style.fontWeight + ' ' + fontSizeString + ' ' + style.fontFamily;

    this.context.font = this._font;

    // word wrap
    // preserve original text
    var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;

    // split text into lines
    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    // calculate text width
    var lineWidths = new Array(lines.length);
    var maxLineWidth = 0;
    var fontProperties = this.determineFontProperties(this._font);

    var i;
    for (i = 0; i < lines.length; i++)
    {
        var lineWidth = this.context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    var width = maxLineWidth + style.strokeThickness;
    if (style.dropShadow)
    {
        width += style.dropShadowDistance;
    }

    this.canvas.width = Math.ceil( ( width + this.context.lineWidth ) * this.resolution );

    // calculate text height
    var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

    var height = lineHeight * lines.length;
    if (style.dropShadow)
    {
        height += style.dropShadowDistance;
    }

    this.canvas.height = Math.ceil( ( height + this._style.padding * 2 ) * this.resolution );

    this.context.scale( this.resolution, this.resolution);

    if (navigator.isCocoonJS)
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }

    //this.context.fillStyle="#FF0000";
    //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = this._font;
    this.context.strokeStyle = style.stroke;
    this.context.lineWidth = style.strokeThickness;
    this.context.textBaseline = style.textBaseline;
    this.context.lineJoin = style.lineJoin;
    this.context.miterLimit = style.miterLimit;

    var linePositionX;
    var linePositionY;

    if (style.dropShadow)
    {
        if (style.dropShadowBlur > 0) {
            this.context.shadowColor = style.dropShadowColor;
            this.context.shadowBlur = style.dropShadowBlur;
        } else {
            this.context.fillStyle = style.dropShadowColor;
        }

        var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

        for (i = 0; i < lines.length; i++)
        {
            linePositionX = style.strokeThickness / 2;
            linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

            if (style.align === 'right')
            {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if (style.align === 'center')
            {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if (style.fill)
            {
                this.drawLetterSpacing(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset + style.padding);
            }
        }
    }

    //set canvas text styles
    this.context.fillStyle = style.fill;

    //draw lines line by line
    for (i = 0; i < lines.length; i++)
    {
        linePositionX = style.strokeThickness / 2;
        linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

        if (style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidths[i];
        }
        else if (style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if (style.stroke && style.strokeThickness)
        {
            this.drawLetterSpacing(lines[i], linePositionX, linePositionY + style.padding, true);
        }

        if (style.fill)
        {
            this.drawLetterSpacing(lines[i], linePositionX, linePositionY + style.padding);
        }
    }

    this.updateTexture();
};

/**
 * Render the text with letter-spacing.
 *
 * @private
 */
Text.prototype.drawLetterSpacing = function(text, x, y, isStroke)
{
    var style = this._style;

    // letterSpacing of 0 means normal
    var letterSpacing = style.letterSpacing;

    if (letterSpacing === 0)
    {
        if (isStroke)
        {
            this.context.strokeText(text, x, y);
        }
        else
        {
            this.context.fillText(text, x, y);
        }
        return;
    }

    var characters = String.prototype.split.call(text, ''),
        index = 0,
        current,
        currentPosition = x;

    while (index < text.length)
    {
        current = characters[index++];
        if (isStroke)
        {
            this.context.strokeText(current, currentPosition, y);
        }
        else
        {
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
Text.prototype.updateTexture = function ()
{
    var texture = this._texture;
    var style = this._style;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;
    texture.orig.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.orig.height = texture._frame.height = this.canvas.height / this.resolution;

    texture.trim.x = 0;
    texture.trim.y = -style.padding;

    texture.trim.width = texture._frame.width;
    texture.trim.height = texture._frame.height - style.padding*2;

    this._width = this.canvas.width / this.resolution;
    this._height = this.canvas.height / this.resolution;

    texture.baseTexture.emit('update',  texture.baseTexture);

    this.dirty = false;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 */
Text.prototype.renderWebGL = function (renderer)
{
    this.updateText(true);

    Sprite.prototype.renderWebGL.call(this, renderer);
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Text.prototype._renderCanvas = function (renderer)
{
    this.updateText(true);

    Sprite.prototype._renderCanvas.call(this, renderer);
};

/**
 * Calculates the ascent, descent and fontSize of a given fontStyle
 *
 * @param fontStyle {object}
 * @private
 */
Text.prototype.determineFontProperties = function (fontStyle)
{
    var properties = Text.fontPropertiesCache[fontStyle];

    if (!properties)
    {
        properties = {};

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

        var i, j;

        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        Text.fontPropertiesCache[fontStyle] = properties;
    }

    return properties;
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 *
 * @param text {string}
 * @private
 */
Text.prototype.wordWrap = function (text)
{
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var result = '';
    var lines = text.split('\n');
    var wordWrapWidth = this._style.wordWrapWidth;
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            if (this._style.breakWords && wordWidth > wordWrapWidth)
            {
                // Word should be split in the middle
                var characters = words[j].split('');
                for (var c = 0; c < characters.length; c++)
                {
                  var characterWidth = this.context.measureText(characters[c]).width;
                  if (characterWidth > spaceLeft)
                  {
                    result += '\n' + characters[c];
                    spaceLeft = wordWrapWidth - characterWidth;
                  }
                  else
                  {
                    if (c === 0)
                    {
                      result += ' ';
                    }
                    result += characters[c];
                    spaceLeft -= characterWidth;
                  }
                }
            }
            else
            {
                var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
                if (j === 0 || wordWidthWithSpace > spaceLeft)
                {
                    // Skip printing the newline if it's the first word of the line that is
                    // greater than the word wrap width.
                    if (j > 0)
                    {
                        result += '\n';
                    }
                    result += words[j];
                    spaceLeft = wordWrapWidth - wordWidth;
                }
                else
                {
                    spaceLeft -= wordWidthWithSpace;
                    result += ' ' + words[j];
                }
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

/**
 * Returns the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {PIXI.Matrix} the transformation matrix of the Text
 * @return {PIXI.Rectangle} the framing rectangle
 */
Text.prototype.getBounds = function (matrix)
{
    this.updateText(true);

    return Sprite.prototype.getBounds.call(this, matrix);
};

/**
 * Method to be called upon a TextStyle change.
 * @private
 */
Text.prototype._onStyleChange = function ()
{
    this.dirty = true;
};

/**
 * Destroys this text
 *
 * @param [options] {object|boolean} Options parameter. A boolean will act as if all options have been set to that value
 * @param [options.children=false] {boolean} if set to true, all the children will have their destroy
 *      method called as well. 'options' will be passed on to those calls.
 * @param [options.texture=false] {boolean} Should it destroy the current texture of the sprite as well
 * @param [options.baseTexture=false] {boolean} Should it destroy the base texture of the sprite as well
 */
Text.prototype.destroy = function (options)
{
    Sprite.prototype.destroy.call(this, options);

    // make sure to reset the the context and canvas.. dont want this hanging around in memory!
    this.context = null;
    this.canvas = null;

    this._style.off(CONST.TEXT_STYLE_CHANGED, this._onStyleChange, this);
    this._style = null;
};
