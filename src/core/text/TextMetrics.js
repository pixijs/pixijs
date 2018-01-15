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
                        const character = characters[c];
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

        const metricsString = TextMetrics._metricsString + TextMetrics._baselineSymbol;
        const width = Math.ceil(context.measureText(metricsString).width);
        let baseline = Math.ceil(context.measureText(TextMetrics._baselineSymbol).width);
        const height = 2 * baseline;

        baseline = baseline * TextMetrics._baselineMultiplier | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = font;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText(metricsString, 0, baseline);

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

    /**
     * Set custom params for calculate font metrics
     * If metricsString, baselineSymbol or baseline multiplier is not the same as a previous values
     * than font metrics cache will reset
     *
     * @static
     * @param {string} metricsString - Symbols with different metrics: the highest symbol, the lowest, ...
     * BaselineSymbol also add to metricsString in measureFont() so not necessary include baselineSymbol in metricsString
     * @param {string} baselineSymbol - The widest symbol in fonts
     * @param {number} baselineMultiplier - Use for create a bit more area for check font symbols bounds
     */
    static setMetricsParams(metricsString, baselineSymbol, baselineMultiplier)
    {
        let isChanged = false;

        if (TextMetrics._metricsString !== metricsString)
        {
            TextMetrics._metricsString = metricsString;
            isChanged = true;
        }

        if (TextMetrics._baselineSymbol !== baselineSymbol)
        {
            TextMetrics._baselineSymbol = baselineSymbol;
            isChanged = true;
        }

        if (TextMetrics._baselineMultiplier !== baselineMultiplier)
        {
            TextMetrics._baselineMultiplier = baselineMultiplier;
            isChanged = true;
        }

        if (isChanged)
        {
            TextMetrics.clearMetrics();
        }
    }

    /**
     * Clear font metrics in metrics cache.
     *
     * @static
     * @param {string} font - font name. If font name not set than clear cache for all fonts.
     */
    static clearMetrics(font = '')
    {
        if (font)
        {
            delete TextMetrics._fonts[font];
        }
        else
        {
            TextMetrics._fonts = {};
        }
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

/**
 * Default string for calculate font metrics.
 * @public
 * @static
 * @memberof PIXI.TextMetrics
 * @type {string}
 */
TextMetrics.DEFAULT_METRICS_STRING = '|Éq';

/**
 * Default baseline symbol for calculate font metrics.
 * @public
 * @static
 * @memberof PIXI.TextMetrics
 * @type {string}
 */
TextMetrics.DEFAULT_BASELINE_SYMBOL = 'M';

/**
 * Default baseline multiplier for calculate font metrics.
 * @public
 * @static
 * @memberof PIXI.TextMetrics
 * @type {number}
 */
TextMetrics.DEFAULT_BASELINE_MULTIPLIER = 1.4;

/**
 * Current string for calculate font metrics.
 * @private
 * @memberof PIXI.TextMetrics
 * @type {string}
 */
TextMetrics._metricsString = TextMetrics.DEFAULT_METRICS_STRING;

/**
 * Current baseline symbol for calculate font metrics.
 * @private
 * @memberof PIXI.TextMetrics
 * @type {string}
 */
TextMetrics._baselineSymbol = TextMetrics.DEFAULT_BASELINE_SYMBOL;

/**
 * Current baseline multiplier for calculate font metrics. Use for reserve a bit more space for draw metrics string.
 * @private
 * @memberof PIXI.TextMetrics
 * @type {number}
 */
TextMetrics._baselineMultiplier = TextMetrics.DEFAULT_BASELINE_MULTIPLIER;
