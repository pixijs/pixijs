/**
 * The TextMetrics object represents the measurement of a block of text with a specified style.
 *
 * @class
 * @memberOf PIXI
 */
export default class TextMetrics
{
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
    constructor(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties)
    {
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
    static measureText(text, style, wordWrap, canvas = TextMetrics._canvas)
    {
        wordWrap = wordWrap || style.wordWrap;
        const font = style.toFontString();
        const fontProperties = TextMetrics.measureFont(font);
        const context = canvas.getContext('2d');

        context.font = font;

        const outputText = wordWrap ? TextMetrics.wordWrap(text, style, canvas) : text;
        const lines = outputText.split(/(?:\r\n|\r|\n)/);
        const lineWidths = new Array(lines.length);
        let maxLineWidth = 0;

        for (let i = 0; i < lines.length; i++)
        {
            const lineWidth = context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);

            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }
        let width = maxLineWidth + style.strokeThickness;

        if (style.dropShadow)
        {
            width += style.dropShadowDistance;
        }

        const lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
        let height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness)
            + ((lines.length - 1) * (lineHeight + style.leading));

        if (style.dropShadow)
        {
            height += style.dropShadowDistance;
        }

        return new TextMetrics(
            text,
            style,
            width,
            height,
            lines,
            lineWidths,
            lineHeight + style.leading,
            maxLineWidth,
            fontProperties
        );
    }

    /**
     * Check whether a byte is an emoji character or not.
     *
     * @param {number} charCode - the byte to test.
     * @param {number} nextCharCode - the possible second byte of the emoji.
     * @return {number} 0 means not a emoji, 1 means single byte, 2 means double bytes.
     */
    static isEmojiChar(charCode, nextCharCode)
    {
        const hs = charCode;
        const nextCharValid = typeof nextCharCode === 'number' && !isNaN(nextCharCode) && nextCharCode > 0;

        if (0xd800 <= hs && 0xdbff >= hs)
        {
            if (nextCharValid)
            {
                const uc = ((hs - 0xd800) * 0x400) + (nextCharCode - 0xdc00) + 0x10000;

                if (0x1d000 <= uc && 0x1f77f >= uc)
                {
                    return 2;
                }
            }
        }
        else if (nextCharValid)
        {
            if (nextCharCode === 0x20e3)
            {
                return 2;
            }
        }
        else
        {
            if ((0x2100 <= hs && 0x27ff >= hs)
                || (0x2B05 <= hs && 0x2b07 >= hs)
                || (0x2934 <= hs && 0x2935 >= hs)
                || (0x3297 <= hs && 0x3299 >= hs)
                || hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030
                || hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b
                || hs === 0x2b50)
            {
                return 1;
            }
        }
        
        return 0;
    }

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
    static wordWrap(text, style, canvas = TextMetrics._canvas)
    {
        const context = canvas.getContext('2d');

        // Greedy wrapping algorithm that will wrap words as the line grows longer
        // than its horizontal bounds.
        let result = '';
        const firstChar = text.charAt(0);
        const lines = text.split('\n');
        const wordWrapWidth = style.wordWrapWidth;
        const characterCache = {};

        for (let i = 0; i < lines.length; i++)
        {
            let spaceLeft = wordWrapWidth;
            const words = lines[i].split(' ');

            for (let j = 0; j < words.length; j++)
            {
                const wordWidth = context.measureText(words[j]).width;

                if (style.breakWords && wordWidth > wordWrapWidth)
                {
                    // Word should be split in the middle
                    const characters = words[j].split('');

                    for (let c = 0; c < characters.length; c++)
                    {
                        let character = characters[c];
                        const nextChar = characters[c + 1];

                        const isEmoji = Text.isEmojiChar(character.charCodeAt(0), nextChar ? nextChar.charCodeAt(0) : 0);

                        if (isEmoji > 1)
                        {
                            c++;
                            character += nextChar;  // combine into 1 emoji
                        }

                        let characterWidth = characterCache[character];

                        if (characterWidth === undefined)
                        {
                            characterWidth = context.measureText(character).width;
                            characterCache[character] = characterWidth;
                        }

                        if (characterWidth > spaceLeft)
                        {
                            result += `\n${character}`;
                            spaceLeft = wordWrapWidth - characterWidth;
                        }
                        else
                        {
                            if (c === 0 && (j > 0 || firstChar === ' '))
                            {
                                result += ' ';
                            }

                            result += character;
                            spaceLeft -= characterWidth;
                        }
                    }
                }
                else
                {
                    const wordWidthWithSpace = wordWidth + context.measureText(' ').width;

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
                        result += ` ${words[j]}`;
                    }
                }
            }

            if (i < lines.length - 1)
            {
                result += '\n';
            }
        }

        return result;
    }

    /**
     * Calculates the ascent, descent and fontSize of a given font-style
     *
     * @static
     * @param {string} font - String representing the style of the font
     * @return {PIXI.TextMetrics~FontMetrics} Font properties object
     */
    static measureFont(font)
    {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (TextMetrics._fonts[font])
        {
            return TextMetrics._fonts[font];
        }

        const properties = {};

        const canvas = TextMetrics._canvas;
        const context = TextMetrics._context;

        context.font = font;

        const width = Math.ceil(context.measureText('|MÉq').width);
        let baseline = Math.ceil(context.measureText('M').width);
        const height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = font;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        const imagedata = context.getImageData(0, 0, width, height).data;
        const pixels = imagedata.length;
        const line = width * 4;

        let i = 0;
        let idx = 0;
        let stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; ++i)
        {
            for (let j = 0; j < line; j += 4)
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
        for (i = height; i > baseline; --i)
        {
            for (let j = 0; j < line; j += 4)
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

        TextMetrics._fonts[font] = properties;

        return properties;
    }
}

/**
 * Internal return object for {@link PIXI.TextMetrics.measureFont `TextMetrics.measureFont`}.
 * @class FontMetrics
 * @memberof PIXI.TextMetrics~
 * @property {number} ascent - The ascent distance
 * @property {number} descent - The descent distance
 * @property {number} fontSize - Font size from ascent to descent
 */

const canvas = document.createElement('canvas');

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
