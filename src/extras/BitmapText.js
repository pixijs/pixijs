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
         * The width of the overall text, different from fontSize,
         * which is defined in the style object
         *
         * @member {number}
         * @readonly
         */
        this.textWidth = 0;

        /**
         * The height of the overall text, different from fontSize,
         * which is defined in the style object
         *
         * @member {number}
         * @readonly
         */
        this.textHeight = 0;

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

        this.textWidth = maxLineWidth * scale;
        this.textHeight = (pos.y + data.lineHeight) * scale;

        // apply anchor
        if (this.anchor.x !== 0 || this.anchor.y !== 0)
        {
            for (let i = 0; i < lenChars; i++)
            {
                this._glyphs[i].x -= this.textWidth * this.anchor.x;
                this._glyphs[i].y -= this.textHeight * this.anchor.y;
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
     * @memberof PIXI.extras.BitmapText#
     */
    get tint()
    {
        return this._font.tint;
    }

    /**
     * Sets the tint.
     *
     * @param {number} value - The value to set to.
     */
    set tint(value)
    {
        this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;

        this.dirty = true;
    }

    /**
     * The alignment of the BitmapText object
     *
     * @member {string}
     * @default 'left'
     * @memberof PIXI.extras.BitmapText#
     */
    get align()
    {
        return this._font.align;
    }

    /**
     * Sets the alignment
     *
     * @param {string} value - The value to set to.
     */
    set align(value)
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
     * @memberof PIXI.extras.BitmapText#
     */
    get anchor()
    {
        return this._anchor;
    }

    /**
     * Sets the anchor.
     *
     * @param {PIXI.Point|number} value - The value to set to.
     */
    set anchor(value)
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
     * @memberof PIXI.extras.BitmapText#
     */
    get font()
    {
        return this._font;
    }

    /**
     * Sets the font.
     *
     * @param {string|object} value - The value to set to.
     */
    set font(value)
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
     * @memberof PIXI.extras.BitmapText#
     */
    get text()
    {
        return this._text;
    }

    /**
     * Sets the text.
     *
     * @param {string} value - The value to set to.
     */
    set text(value)
    {
        value = value.toString() || ' ';
        if (this._text === value)
        {
            return;
        }
        this._text = value;
        this.dirty = true;
    }
}

BitmapText.fonts = {};
