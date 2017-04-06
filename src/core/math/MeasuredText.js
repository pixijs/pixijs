/**
 * The MeasuredText object represents the measurement of a block of text with a specified style.
 *
 * @class
 * @memberOf PIXI
 */
export default class MeasuredText
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
    constructor(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties) {
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
     * @returns {PIXI.MeasuredText} a copy of this instance
     */
    clone()
    {
        return new MeasuredText(
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
     * @param {PIXI.MeasuredText} m - the instance to check
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
}
