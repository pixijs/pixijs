import * as core from '../core';
import ObservablePoint from '../core/math/ObservablePoint';

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font. To
 * split a line you can use '\n', '\r' or '\r\n' in your string. You can generate the fnt files using:
 *
 * A BitmapText can only be created when the font is loaded
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * let bitmapText = new PIXI.extras.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.extras
 */
export default class BitmapText extends core.Container
{
    /**
     * @param {string} text - The copy that you would like the text to display
     * @param {object} style - The style parameters
     * @param {string|object} style.font - The font descriptor for the object, can be passed as a string of form
     *      "24px FontName" or "FontName" or as an object with explicit name/size properties.
     * @param {string} [style.font.name] - The bitmap font id
     * @param {number} [style.font.size] - The size of the font in pixels, e.g. 24
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'), does not affect
     *      single line text
     * @param {number} [style.tint=0xFFFFFF] - The tint color
     */
    constructor(text, style = {})
    {
        super();

        /**
         * Private tracker for the width of the overall text
         *
         * @member {number}
         * @private
         */
        this._textWidth = 0;

        /**
         * Private tracker for the height of the overall text
         *
         * @member {number}
         * @private
         */
        this._textHeight = 0;

        /**
         * Private tracker for the letter sprite pool.
         *
         * @member {PIXI.Sprite[]}
         * @private
         */
        this._glyphs = [];

        /**
         * Private tracker for the current style.
         *
         * @member {object}
         * @private
         */
        this._font = {
            tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
            align: style.align || 'left',
            name: null,
            size: 0,
        };

        /**
         * Private tracker for the current font.
         *
         * @member {object}
         * @private
         */
        this.font = style.font; // run font setter

        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        this._text = text;

        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting value to 0
         *
         * @member {number}
         */
        this.maxWidth = 0;

        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * ie: when trying to vertically align.
         *
         * @member {number}
         */
        this.maxLineHeight = 0;

        /**
         * Text anchor. read-only
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this._anchor = new ObservablePoint(() => { this.dirty = true; }, this, 0, 0);

        /**
         * The dirty state of this object.
         *
         * @member {boolean}
         */
        this.dirty = false;

        this.updateText();
    }

    /**
     * Renders text and updates it when needed
     *
     * @private
     */
    updateText()
    {
        const data = BitmapText.fonts[this._font.name];
        const scale = this._font.size / data.size;
        const pos = new core.Point();
        const chars = [];
        const lineWidths = [];

        let prevCharCode = null;
        let lastLineWidth = 0;
        let maxLineWidth = 0;
        let line = 0;
        let lastSpace = -1;
        let lastSpaceWidth = 0;
        let maxLineHeight = 0;

        for (let i = 0; i < this.text.length; i++)
        {
            const charCode = this.text.charCodeAt(i);

            if (/(\s)/.test(this.text.charAt(i)))
            {
                lastSpace = i;
                lastSpaceWidth = lastLineWidth;
            }

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

            if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth)
            {
                core.utils.removeItems(chars, lastSpace, i - lastSpace);
                i = lastSpace;
                lastSpace = -1;

                lineWidths.push(lastSpaceWidth);
                maxLineWidth = Math.max(maxLineWidth, lastSpaceWidth);
                line++;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }

            const charData = data.chars[charCode];

            if (!charData)
            {
                continue;
            }

            if (prevCharCode && charData.kerning[prevCharCode])
            {
                pos.x += charData.kerning[prevCharCode];
            }

            chars.push({
                texture: charData.texture,
                line,
                charCode,
                position: new core.Point(pos.x + charData.xOffset, pos.y + charData.yOffset),
            });
            lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
            pos.x += charData.xAdvance;
            maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
            prevCharCode = charCode;
        }

        lineWidths.push(lastLineWidth);
        maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

        const lineAlignOffsets = [];

        for (let i = 0; i <= line; i++)
        {
            let alignOffset = 0;

            if (this._font.align === 'right')
            {
                alignOffset = maxLineWidth - lineWidths[i];
            }
            else if (this._font.align === 'center')
            {
                alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }

            lineAlignOffsets.push(alignOffset);
        }

        const lenChars = chars.length;
        const tint = this.tint;

        for (let i = 0; i < lenChars; i++)
        {
            let c = this._glyphs[i]; // get the next glyph sprite

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
        for (let i = lenChars; i < this._glyphs.length; ++i)
        {
            this.removeChild(this._glyphs[i]);
        }

        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + data.lineHeight) * scale;

        // apply anchor
        if (this.anchor.x !== 0 || this.anchor.y !== 0)
        {
            for (let i = 0; i < lenChars; i++)
            {
                this._glyphs[i].x -= this._textWidth * this.anchor.x;
                this._glyphs[i].y -= this._textHeight * this.anchor.y;
            }
        }
        this.maxLineHeight = maxLineHeight * scale;
    }

    /**
     * Updates the transform of this object
     *
     * @private
     */
    updateTransform()
    {
        this.validate();
        this.containerUpdateTransform();
    }

    /**
     * Validates text before calling parent's getLocalBounds
     *
     * @return {PIXI.Rectangle} The rectangular bounding area
     */
    getLocalBounds()
    {
        this.validate();

        return super.getLocalBounds();
    }

    /**
     * Updates text when needed
     *
     * @private
     */
    validate()
    {
        if (this.dirty)
        {
            this.updateText();
            this.dirty = false;
        }
    }

    /**
     * The tint of the BitmapText object
     *
     * @member {number}
     */
    get tint()
    {
        return this._font.tint;
    }

    set tint(value) // eslint-disable-line require-jsdoc
    {
        this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;

        this.dirty = true;
    }

    /**
     * The alignment of the BitmapText object
     *
     * @member {string}
     * @default 'left'
     */
    get align()
    {
        return this._font.align;
    }

    set align(value) // eslint-disable-line require-jsdoc
    {
        this._font.align = value || 'left';

        this.dirty = true;
    }

    /**
     * The anchor sets the origin point of the text.
     * The default is 0,0 this means the text's origin is the top left
     * Setting the anchor to 0.5,0.5 means the text's origin is centered
     * Setting the anchor to 1,1 would mean the text's origin point will be the bottom right corner
     *
     * @member {PIXI.Point | number}
     */
    get anchor()
    {
        return this._anchor;
    }

    set anchor(value) // eslint-disable-line require-jsdoc
    {
        if (typeof value === 'number')
        {
            this._anchor.set(value);
        }
        else
        {
            this._anchor.copy(value);
        }
    }

    /**
     * The font descriptor of the BitmapText object
     *
     * @member {string|object}
     */
    get font()
    {
        return this._font;
    }

    set font(value) // eslint-disable-line require-jsdoc
    {
        if (!value)
        {
            return;
        }

        if (typeof value === 'string')
        {
            value = value.split(' ');

            this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
            this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
        }
        else
        {
            this._font.name = value.name;
            this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
        }

        this.dirty = true;
    }

    /**
     * The text of the BitmapText object
     *
     * @member {string}
     */
    get text()
    {
        return this._text;
    }

    set text(value) // eslint-disable-line require-jsdoc
    {
        value = value.toString() || ' ';
        if (this._text === value)
        {
            return;
        }
        this._text = value;
        this.dirty = true;
    }

    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readonly
     */
    get textWidth()
    {
        this.validate();

        return this._textWidth;
    }

    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readonly
     */
    get textHeight()
    {
        this.validate();

        return this._textHeight;
    }

    /**
     * Register a bitmap font with data and a texture.
     *
     * @static
     * @param {XMLDocument} xml - The XML document data.
     * @param {PIXI.Texture} texture - Texture with all symbols.
     * @return {Object} Result font object with font, size, lineHeight and char fields.
     */
    static registerFont(xml, texture)
    {
        const data = {};
        const info = xml.getElementsByTagName('info')[0];
        const common = xml.getElementsByTagName('common')[0];

        data.font = info.getAttribute('face');
        data.size = parseInt(info.getAttribute('size'), 10);
        data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
        data.chars = {};

        // parse letters
        const letters = xml.getElementsByTagName('char');

        for (let i = 0; i < letters.length; i++)
        {
            const letter = letters[i];
            const charCode = parseInt(letter.getAttribute('id'), 10);

            const textureRect = new core.Rectangle(
                parseInt(letter.getAttribute('x'), 10) + texture.frame.x,
                parseInt(letter.getAttribute('y'), 10) + texture.frame.y,
                parseInt(letter.getAttribute('width'), 10),
                parseInt(letter.getAttribute('height'), 10)
            );

            data.chars[charCode] = {
                xOffset: parseInt(letter.getAttribute('xoffset'), 10),
                yOffset: parseInt(letter.getAttribute('yoffset'), 10),
                xAdvance: parseInt(letter.getAttribute('xadvance'), 10),
                kerning: {},
                texture: new core.Texture(texture.baseTexture, textureRect),

            };
        }

        // parse kernings
        const kernings = xml.getElementsByTagName('kerning');

        for (let i = 0; i < kernings.length; i++)
        {
            const kerning = kernings[i];
            const first = parseInt(kerning.getAttribute('first'), 10);
            const second = parseInt(kerning.getAttribute('second'), 10);
            const amount = parseInt(kerning.getAttribute('amount'), 10);

            if (data.chars[second])
            {
                data.chars[second].kerning[first] = amount;
            }
        }

        // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
        // but it's very likely to change
        BitmapText.fonts[data.font] = data;

        return data;
    }
}

BitmapText.fonts = {};
