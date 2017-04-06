import Text from './Text';

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
     * @param {Object} fontProperties - the font properties object from Text.calculateFontProperties
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
     * Creates a clone of this instance
     *
     * @returns {PIXI.TextMetrics} a copy of this instance
     */
    clone()
    {
        return new TextMetrics(
            this.text,
            this.style,
            this.width,
            this.height,
            this.lines,
            this.lineWidths,
            this.lineHeight,
            this.maxLineWidth,
            this.fontProperties
        );
    }

    /**
     * Returns true if the given instance is equal to this instance
     *
     * @param {PIXI.TextMetrics} m - the instance to check
     * @returns {boolean} Whether the given instance is equal to this instance
     */
    equals(m)
    {
        return (m.text === this.text)
               && (m.style === this.style)
               && (m.width === this.width)
               && (m.height === this.height)
               && (m.lines === this.lines)
               && (m.lineWidths === this.lineWidths)
               && (m.lineHeight === this.lineHeight)
               && (m.maxLineWidth === this.maxLineWidth)
               && (m.fontProperties === this.fontProperties);
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
    static measure(text, style, wordWrap, canvas)
    {
        if (!canvas)
        {
            Text._canvas = Text._canvas || document.createElement('canvas');
            canvas = Text._canvas;
        }

        wordWrap = wordWrap || style.wordWrap;
        const font = Text.getFontStyle(style);
        const fontProperties = Text.calculateFontProperties(font);
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
            + ((lines.length - 1) * lineHeight);

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
            lineHeight,
            maxLineWidth,
            fontProperties
        );
    }

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     *
     * @param {string} text - String to apply word wrapping to
     * @param {TextStyle} style - the style to use when wrapping
     * @param {HTMLCanvasElement} canvas - optional specification of the canvas to use for measuring.
     * @return {string} New string with new lines applied where required
     */
    static wordWrap(text, style, canvas)
    {
        if (!canvas)
        {
            this.canvas = this.canvas || document.createElement('canvas');
            canvas = this.canvas;
        }
        const context = canvas.getContext('2d');

        // Greedy wrapping algorithm that will wrap words as the line grows longer
        // than its horizontal bounds.
        let result = '';
        const lines = text.split('\n');
        const wordWrapWidth = style.wordWrapWidth;

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
                        const characterWidth = context.measureText(characters[c]).width;

                        if (characterWidth > spaceLeft)
                        {
                            result += `\n${characters[c]}`;
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
}
