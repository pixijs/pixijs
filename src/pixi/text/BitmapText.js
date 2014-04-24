/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Text Object will create a line(s) of text using bitmap font. To split a line you can use '\n', '\r' or '\r\n'
 * You can generate the fnt files using
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 *
 * @class BitmapText
 * @extends DisplayObjectContainer
 * @constructor
 * @param text {String} The copy that you would like the text to display
 * @param style {Object} The style parameters
 * @param style.font {String} The size (optional) and bitmap font id (required) eq 'Arial' or '20px Arial' (must have loaded previously)
 * @param [style.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 */
PIXI.BitmapText = function(text, style)
{
    PIXI.DisplayObjectContainer.call(this);

    this._pool = [];

    this.setText(text);
    this.setStyle(style);
    this.updateText();
    this.dirty = false;
};

// constructor
PIXI.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PIXI.BitmapText.prototype.constructor = PIXI.BitmapText;

/**
 * Set the copy for the text object
 *
 * @method setText
 * @param text {String} The copy that you would like the text to display
 */
PIXI.BitmapText.prototype.setText = function(text)
{
    this.text = text || ' ';
    this.dirty = true;
};

/**
 * Set the style of the text
 * style.font {String} The size (optional) and bitmap font id (required) eq 'Arial' or '20px Arial' (must have loaded previously)
 * [style.align='left'] {String} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 *
 * @method setStyle
 * @param style {Object} The style parameters, contained as properties of an object
 */
PIXI.BitmapText.prototype.setStyle = function(style)
{
    style = style || {};
    style.align = style.align || 'left';
    this.style = style;

    var font = style.font.split(' ');
    this.fontName = font[font.length - 1];
    this.fontSize = font.length >= 2 ? parseInt(font[font.length - 2], 10) : PIXI.BitmapText.fonts[this.fontName].size;

    this.dirty = true;
    this.tint = style.tint;
};

/**
 * Parses the text string for color codes into an array containing either individual characters, or objects with tint and alpha values.
 * 
 * Text can contain color codes in the format:
 * {#ffffff} (RGB)
 * {#ffffffff} (RGBA)
 * {#} (revert to default colors)
 * These will be parsed and applied if any are detected, otherwise the text will behave
 * as normal. Codes contained within the text setting tint colors will override the
 * overall tint value if set, hence the need for the {#} 'revert' code.
 * 
 * Example: "The following text is {#ff0000}RED{#}, and the following text is {#00ff007c}GREEN{#} and (approximately) half opacity."
 * 
 * @method parseColors
 * @param input {String} The text to be split into a colored character array.
 * @return {Array} An array of tint/alpha objects and nulls, one per character of the original stripped text.
 * @static
 */

PIXI.BitmapText.parseColors = function (text)
{
    var output = [];
    var textTokenized = text.split(/({#[0-9a-fA-F]{0,8}})/); // split the text into normal strings and codes
    var currentToken;
    
    for (var i = 0; i < textTokenized.length; i++)
    {
        currentToken = textTokenized[i].match(/^{#([0-9a-fA-F]{0,8})}$/); // extract the value from the code
        if (currentToken && currentToken.length > 0)
        {
            // looks like we have a code, so parse as appropriate
            if (currentToken[1] === '')
            { 
                // matches a {#} (revert) code
                output.push({ tint: -1, alpha: 1 });
            }
            else {
                if (currentToken[1].length === 6)
                { 
                    // matches a {#ffffff} (RGB) code
                    output.push({ tint: parseInt(currentToken[1], 16), alpha: 1 });
                }
                else if (currentToken[1].length === 8)
                { 
                    // matches a {#ffffffff} (RGBA) code
                    output.push({
                        tint: parseInt(currentToken[1].substr(0, 6), 16),
                        alpha: parseInt(currentToken[1].substr(6, 2), 16) / 255
                    });
                }
            }
        }
        else {
            // doesn't seem to be a code, so just fill out the array with nulls (one per character), making sure to skip newlines
            for (var j = 0; j < textTokenized[i].length; j++) {
                if (/(?:\r\n|\r|\n)/.test(textTokenized[i].charAt(j)))
                {
                    continue;
                }
                output.push(null);
            }
        }
    }

    return output;
};

/**
 * Renders text and updates it when needed
 *
 * @method updateText
 * @private
 */
PIXI.BitmapText.prototype.updateText = function () {
    var data = PIXI.BitmapText.fonts[this.fontName];
    var pos = new PIXI.Point();
    var prevCharCode = null;
    var chars = [];
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this.fontSize / data.size;
    var parsedTextArray = [];
    var text = this.text;

    if (text && /{#[0-9a-fA-F]{0,8}}/.test(text))
    {
        // looks like this text contains at least one color code, so parse the codes and strip them from the final text
        parsedTextArray = PIXI.BitmapText.parseColors(text);
        text = text.replace(/{#[0-9a-fA-F]{0,8}}/g, '');
    }

    for (var i = 0; i < text.length; i++)
    {
        var charCode = text.charCodeAt(i);
        if (/(?:\r\n|\r|\n)/.test(text.charAt(i)))
        {
            lineWidths.push(pos.x);
            maxLineWidth = Math.max(maxLineWidth, pos.x);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        var charData = data.chars[charCode];
        if (!charData) continue;

        if (prevCharCode && charData[prevCharCode])
        {
            pos.x += charData.kerning[prevCharCode];
        }
        chars.push({ texture: charData.texture, line: line, charCode: charCode, position: new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset) });
        pos.x += charData.xAdvance;

        prevCharCode = charCode;
    }

    lineWidths.push(pos.x);
    maxLineWidth = Math.max(maxLineWidth, pos.x);

    var lineAlignOffsets = [];
    for (i = 0; i <= line; i++)
    {
        var alignOffset = 0;
        if (this.style.align === 'right')
        {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if (this.style.align === 'center')
        {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }
        lineAlignOffsets.push(alignOffset);
    }

    var lenChildren = this.children.length;
    var lenChars = chars.length;
    var tint = this.tint || 0xFFFFFF;
    var alpha = 1;
    var codeIndex = 0;
    for (i = 0; i < lenChars; i++)
    {
        var c = i < lenChildren ? this.children[i] : this._pool.pop(); // get old child if have. if not - take from pool.

        if (c) c.setTexture(chars[i].texture); // check if got one before.
        else c = new PIXI.Sprite(chars[i].texture); // if no create new one.

        c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        c.position.y = chars[i].position.y * scale;
        c.scale.x = c.scale.y = scale;
        if (parsedTextArray[codeIndex])
        {
            // we have color information for this character, so change the default tint and alpha from now until the next code or the end of the text
            tint = (parsedTextArray[codeIndex].tint === -1 ? (this.tint || 0xFFFFFF) : parsedTextArray[codeIndex].tint); // if the tint is -1, reset tint to default
            alpha = parsedTextArray[codeIndex].alpha;
            ++codeIndex; // increase the code index twice to skip the code's place in the array (which does not map to a specific character)
        }
        c.tint = tint;
        c.alpha = alpha;
        // c.alpha = parsedTextArray[i].alpha || 1;
        if (!c.parent) this.addChild(c);
        ++codeIndex;
    }

    // remove unnecessary children.
    // and put their into the pool.
    while (this.children.length > lenChars)
    {
        var child = this.getChildAt(this.children.length - 1);
        this._pool.push(child);
        this.removeChild(child);
    }


    /**
     * [read-only] The width of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @property textWidth
     * @type Number
     */
    this.textWidth = maxLineWidth * scale;

    /**
     * [read-only] The height of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @property textHeight
     * @type Number
     */
    this.textHeight = (pos.y + data.lineHeight) * scale;
};

/**
 * Updates the transform of this object
 *
 * @method updateTransform
 * @private
 */
PIXI.BitmapText.prototype.updateTransform = function()
{
    if(this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }

    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
};

PIXI.BitmapText.fonts = {};
