var core = require('../core');

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font. To
 * split a line you can use '\n', '\r' or '\r\n' in your string. You can generate the fnt files using:
 *
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 *
 * @class
 * @extends Container
 * @namespace PIXI
 * @param text {string} The copy that you would like the text to display
 * @param style {object} The style parameters
 * @param style.font {string} The size (optional) and bitmap font id (required) eq 'Arial' or '20px Arial' (must have loaded previously)
 * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 */
function BitmapText(text, style)
{
    core.Container.call(this);

    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readOnly
     */
    this.textWidth = 0;

    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readOnly
     */
    this.textHeight = 0;

    /**
     * Private tracker for the letter sprite pool.
     *
     * @member {Sprite[]}
     * @private
     */
    this._glyphs = [];

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._style = {
        tint: style.tint,
        align: style.align,
        fontName: null,
        fontSize: 0
    };
    this.font = style.font; // run font setter

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = text;

    /**
     * The dirty state of this object.
     *
     * @member {boolean}
     */
    this.dirty = false;

    this.updateText();
}

// constructor
BitmapText.prototype = Object.create(core.Container.prototype);
BitmapText.prototype.constructor = BitmapText;
module.exports = BitmapText;

Object.defineProperties(BitmapText.prototype, {
    /**
     * The tint of the BitmapText object
     *
     * @member {number}
     * @memberof BitmapText#
     */
    tint: {
        get: function ()
        {
            return this._style.tint;
        },
        set: function (value)
        {
            this._style.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;

            this.dirty = true;
        }
    },

    /**
     * The tint of the BitmapText object
     *
     * @member {string}
     * @default 'left'
     * @memberof BitmapText#
     */
    align: {
        get: function ()
        {
            return this._style.align;
        },
        set: function (value)
        {
            this._style.align = value;

            this.dirty = true;
        }
    },

    /**
     * The tint of the BitmapText object
     *
     * @member {Font}
     * @memberof BitmapText#
     */
    font: {
        get: function ()
        {
            return this._style.font;
        },
        set: function (value)
        {
            value = value.split(' ');

            // TODO - This should be object-based not string based like it has been.
            this._style.fontName = value[value.length - 1];
            this._style.fontSize = value.length >= 2 ? parseInt(value[value.length - 2], 10) : BitmapText.fonts[this.fontName].size;

            this.dirty = true;
        }
    },

    /**
     * The text of the BitmapText object
     *
     * @member {string}
     * @memberof BitmapText#
     */
    text: {
        get: function ()
        {
            return this._text;
        },
        set: function (value)
        {
            this._text = value;

            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 *
 * @private
 */
BitmapText.prototype.updateText = function ()
{
    var data = BitmapText.fonts[this.fontName];
    var pos = new core.math.Point();
    var prevCharCode = null;
    var chars = [];
    var lastLineWidth = 0;
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this.fontSize / data.size;

    for (var i = 0; i < this.text.length; i++)
    {
        var charCode = this.text.charCodeAt(i);

        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i)))
        {
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        var charData = data.chars[charCode];

        if (!charData)
        {
            continue;
        }

        if (prevCharCode && charData.kerning[prevCharCode])
        {
            pos.x += charData.kerning[prevCharCode];
        }

        chars.push({texture:charData.texture, line: line, charCode: charCode, position: new core.math.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)});
        lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
        pos.x += charData.xAdvance;

        prevCharCode = charCode;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

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

    var lenChars = chars.length;
    var tint = this.tint;

    for (i = 0; i < lenChars; i++)
    {
        var c = this._glyphs[i]; // get the next glyph sprite

        if (c)
        {
            c.texture = chars[i].texture;
        }
        else
        {
            c = new core.Sprite(chars[i].texture);
            this._glyphs.push(c);
        }

        c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        c.position.y = chars[i].position.y * scale;
        c.scale.x = c.scale.y = scale;
        c.tint = tint;

        if (!c.parent)
        {
            this.addChild(c);
        }
    }

    // remove unnecessary children.
    for (var i = lenChars; i < this._glyphs.length; ++i)
    {
        this.removeChild(this._glyphs[i]);
    }

    this.textWidth = maxLineWidth * scale;
    this.textHeight = (pos.y + data.lineHeight) * scale;
};

/**
 * Updates the transform of this object
 *
 * @private
 */
BitmapText.prototype.updateTransform = function ()
{
    if (this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }

    this.containerUpdateTransform();
};

BitmapText.fonts = {};
