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

        const outputText = wordWrap ? Text.wordWrap(text, style, canvas) : text;
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
}
