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
     * @return {number} enumeration of supported language options for word wrap
     */
    static get CJKLanguage()
    {
        return {
            OTHER: 0,
            CHINESE: 1,
            JAPANESE: 2,
            KOREAN: 3,
        };
    }

    /**
     * @param {string} c character to tentatively begin the line
     * @param {number} language the language to check line-break rules against
     * @return {boolean}  whether the specified character can begin a line in the specified language
     */
    static canBeginLineCJK(c, language)
    {
        if (!c || !language || language === TextMetrics.CJKLanguage.OTHER)
        {
            return true;
        }

        let notPermittedToBeginLine;

        if (language === TextMetrics.CJKLanguage.CHINESE)
        {
            // Simplified Chinese
            // !%),.:;?]}¢°·’""†‡›℃∶、。〃〆〕〗〞﹚﹜！＂％＇），．：；？！］｝～
            // Traditional Chinese
            // !),.:;?]}¢·–— ’"•" 、。〆〞〕〉》」︰︱︲︳﹐﹑﹒﹓﹔﹕﹖﹘﹚﹜！），．：；？︶︸︺︼︾﹀﹂﹗］｜｝､
            // Merging the two rules into one since it's impossible to tell whether
            // the word is simplified or traditional via unicode
            notPermittedToBeginLine = '\u0021\u0025\u0029\u002c\u002e\u003a\u003b\u003f\u005d\u007d\u00a2'
            + '\u00b0\u00b7\u2019\u0022\u2020\u2021\u203a\u2103\u2236\u3001\u3002\u3003\u3006\u3015'
            + '\u3017\u301e\ufe5a\ufe5c\uff01\uff02\uff05\uff07\uff09\uff0c\uff0e\uff1a\uff1b\uff1f\uff01'
            + '\uff3d\uff5d\uff5e\u2014\u2022\u3009\u300b\u300d\ufe30\ufe31\ufe32\ufe33\ufe50\ufe51\ufe52\ufe53'
            + '\ufe54\ufe55\ufe56\ufe58\ufe36\ufe38\ufe3a\ufe3c\ufe3e\ufe40\ufe42\ufe57\uff5c\uff64';
        }
        else if (language === TextMetrics.CJKLanguage.JAPANESE)
        {
            // )]｝〕〉》」』】〙〗〟’"｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶ
            // ㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻‐゠–〜?!‼⁇⁈⁉・、:;,。.
            notPermittedToBeginLine = '\u0029\u005d\uff5d\u3015\u3009\u300b\u300d\u300f'
            + '\u3011\u3019\u3017\u301f\u2019\u0022\uff60\u00bb\u30fd\u30fe\u30fc\u30a1\u30a3'
            + '\u30a5\u30a7\u30a9\u30c3\u30e3\u30e5\u30e7\u30ee\u30f5\u30f6\u3041\u3043\u3045\u3047'
            + '\u3049\u3063\u3083\u3085\u3087\u308e\u3095\u3096\u31f0\u31f1\u31f2\u31f3\u31f4\u31f5'
            + '\u31f6\u31f7\u31f8\u31f9\u31fa\u31fb\u31fc\u31fd\u31fe\u31ff\u3005\u303b\u2010\u30a0'
            + '\u2013\u301c\u003f\u0021\u203c\u2047\u2048\u2049\u30fb\u3001\u003a\u003b\u002c\u3002\u002e';
        }
        else if (language === TextMetrics.CJKLanguage.KOREAN)
        {
            // !%),.:;?]}¢°’"†‡℃〆〈《「『〕！％），．：；？］｝
            notPermittedToBeginLine = '\u0021\u0025\u0029\u002c\u002e\u003a\u003b\u003f\u005d'
            + '\u007d\u00a2\u00b0\u2019\u0022\u2020\u2021\u2103\u3006\u3008\u300a\u300c\u300e'
            + '\u3015\uff01\uff05\uff09\uff0c\uff0e\uff1a\uff1b\uff1f\uff3d\uff5d';
        }

        return notPermittedToBeginLine.indexOf(c) === -1;
    }

    /**
     * @param {string} c character to tentatively end the line
     * @param {number} language the language to check line-break rules against
     * @return {boolean}  whether the specified character can end a line in the specified language
     */
    static canEndLineCJK(c, language)
    {
        if (!c || !language || language === TextMetrics.CJKLanguage.OTHER)
        {
            return true;
        }

        let notPermittedToEndLine;

        if (language === TextMetrics.CJKLanguage.CHINESE)
        {
            // Simplified Chinese
            // $(£¥·‘"〈《「『【〔〖〝﹙﹛＄（．［｛￡￥
            // Traditional Chinese
            // ([{£¥‘"‵〈《「『〔〝︴﹙﹛（｛︵︷︹︻︽︿﹁﹃﹏
            // Merging the two rules into one since it's impossible to tell whether the word is simplified
            // or traditional via unicode
            notPermittedToEndLine = '\u0024\u0028\u00a3\u00a5\u00b7\u2018\u0022\u3008\u300a\u300c'
            + '\u300e\u3010\u3014\u3016\u301d\ufe59\ufe5b\uff04\uff08\uff0e\uff3b\uff5b\uffe1\uffe5'
            + '\u005b\u007b\u2035\ufe34\ufe35\ufe37\ufe39\ufe3b\ufe3d\ufe3f\ufe41\ufe43\ufe4f';
        }
        else if (language === TextMetrics.CJKLanguage.JAPANESE)
        {
            // ([｛〔〈《「『【〘〖〝‘"｟«
            notPermittedToEndLine = '\u0028\u005b\uff5b\u3014\u3008\u300a\u300c\u300e'
            + '\u3010\u3018\u3016\u301d\u2018\u0022\uff5f\u00ab';
        }

        else if (language === TextMetrics.CJKLanguage.KOREAN)
        {
            // $([\{£¥‘"々〇〉》」〔＄（［｛｠￥￦ #
            notPermittedToEndLine = '\u0024\u0028\u005b\u005c\u007b\u00a3\u00a5\u2018\u0022'
            + '\u3005\u3007\u3009\u300b\u300d\u3014\uff04\uff08\uff3b\uff5b\uff60\uffe5\uffe6\u0023';
        }

        return notPermittedToEndLine.indexOf(c) === -1;
    }

    /**
     * @param {string} c1 the first character, to tentatively end this line
     * @param {number} c2 the second character, to tentatively begin the next line
     * @return {boolean} whether the two characters can be split between two lines according to
     * Japanese line-breaking conventions
     */
    static canBeSplitJapanese(c1, c2)
    {
        if (!c1 || !c2)
        {
            return true;
        }

        const doNotSplit = [['\u2014', '\u2026'], ['\u2025', '\u3033'], ['\u3034', '\u3035']];

        for (let i = 0; i < doNotSplit.length; i++)
        {
            const doNotSplitPair = doNotSplit[i];

            if (doNotSplitPair[0] === c1 && doNotSplitPair[1] === c2)
            {
                return false;
            }
        }

        // Ignoring grouped ruby characters --
        // we can't tell which ruby characters corresponds to which kanji.

        return isNaN(c1) || isNaN(c2);
    }

    /**
     * @param {string} word glean the language from this word
     * @return {number} Korean, Chinese, Japanese, or Other (for any other language)
     */
    static CJKTextLanguage(word)
    {
        // From https://unicode-table.com/en/ :
        // 1100 - 11FF Hangul Jamo (Korean)
        // 2E80 - 2EFF CJK Radicals Supplement (CJK)
        // 2F00 - 2FDF Kangxi Radicals (Chinese)
        // 3000 - 303F CJK Symbols and Punctuation (CJK)
        // 3040 - 309F Hiragana (Japanese)
        // 30A0 - 30FF Katakana (Japanese)
        // 3100 - 312F Bopomofo (Chinese)
        // 3130 - 318F Hangul Compatibility Jamo (Korean)
        // 3190 - 319F Kanbun (Chinese, Japanese)
        // 31A0 - 31BF Bopomofo Extended (Chinese)
        // 31C0 - 31EF CJK Strokes (Chinese)
        // 31F0 - 31FF Katakana phonetic extensions (Japanese)
        // 3200 - 32FF Enclosed CJK letters and Months (Chinese)
        // 3300 - 33FF CJK Compatibility (CJK)
        // 3400 - 4DBF CJK Unified Ideographs Extension A (CJK)
        // 4DC0 - 4DFF Yijing Hexagram Symbols (Chinese)
        // 4E00 - 9FAF CJK unified ideographs (CJK)
        // AC00 - D7AF Hangul Syllables (Korean)
        // A960 - A97F Hangul Jamo Extended A (Korean)
        // D7B0 - D7FF Hangul Jamo Extended B (Korean)
        // FE30 - FE4F CJK Compatibility forms (CJK)
        // FF00 - FF9F Halfwidth and fullwidth forms (CJK)
        // 20000 - 2A6DF CJK Unified Ideographs Extension B (CJK)
        // 2A700 - 2B73F CJK Unified Ideographs Extension C (CJK)
        // 2B740 - 2B81F CJK Unified Ideographs Extension D (CJK)
        // 2B820 - 2CEAF CJK Unified Ideographs Extension E (CJK)
        // 2CEB0 - 2EBEF CJK Unified Ideographs Extension F (CJK)
        // 2F800 - 2FA1F CJK Compatibility Ideographs Supplement (CJK)

        const jpnRegExp = new RegExp('[\\u3040-\\u309f\\u30a0-\\u30ff\\u31f0-\\u31ff]');
        const jpnExclusiveCharacters = word.match(jpnRegExp);

        if (jpnExclusiveCharacters)
        {
            return TextMetrics.CJKLanguage.JAPANESE;
        }

        const krnRegExp = new RegExp('[\\u1100-\\u11ff\\u3130-\\u318f\\uac00-\\ud7af'
            + '\\ua960-\\ua97f\\ud7b0-\\ud7ff]');
        const krnExclusiveCharacters = word.match(krnRegExp);

        if (krnExclusiveCharacters)
        {
            return TextMetrics.CJKLanguage.KOREAN;
        }

        const chnRegExp = new RegExp('[\\u2f00-\\u2fdf\\u3100-\\u312f\\u31a0-\\u31bf'
            + '\\u31c0-\\u31ef\\u3200-\\u32ff\\u4dc0-\\u4dff]');
        const chnExclusiveCharacters = word.match(chnRegExp);

        if (chnExclusiveCharacters)
        {
            return TextMetrics.CJKLanguage.CHINESE;
        }

        const cjkRegExp = new RegExp('[\\u2e80-\\u2eff\\u3000-\\u303f\\u3190-\\u319f'
        + '\\u3300-\\u33ff\\u3400-\\u4dbf\\u4e00-\\u9faf\\ufe30-\\ufe4f\\uff00-\\uff9f'
        + '\\u{20000}-\\u{2a6df}\\u{2a700}-\\u{2b73f}\\u{2b740}-\\u{2b81f}\\u{2b820}-\\u{2ceaf}'
        + '\\u{2ceb0}-\\u{2ebef}\\u{2f800}-\\u{2fa1f}]', 'u');

        const cjkCharacters = word.match(cjkRegExp);

        // assumption is that if we have no japan or korean exclusive characters
        // and we have CJK characters, that would be chinese text.
        if (cjkCharacters)
        {
            return TextMetrics.CJKLanguage.CHINESE;
        }

        return TextMetrics.CJKLanguage.OTHER;
    }

    /**
     * @param {string} character The character to get the width of
     * @param {string[]} characterCache A cache of pre-measured character widths
     * @param {function} measureText A function for determining character widths
     * @return {number} The width of the character according to cache / measureText
     */
    static getCharacterWidth(character, characterCache, measureText)
    {
        if (characterCache[character] === undefined)
        {
            characterCache[character] = measureText(character).width;
        }

        return characterCache[character];
    }

    /**
     *
     * @param {string} word The word which we are wrapping
     * @param {function} measureText The function used to measure character widths
     * @param {string[]} characterCache Mapping of characters to their widths already computed
     * @param {number} wordWrapWidth The maximum width a line can be
     * @return {string} The resulting CJK-word-wrapped string with line breaks
     */
    static CJKWordWrap(word, measureText, characterCache, wordWrapWidth)
    {
        const characters = word.split('');
        const wordLanguage = TextMetrics.CJKTextLanguage(word);
        let totalCharacterWidth = 0;
        let tooWideIndex = 0;
        let result = '';

        for (let startIndex = 0; startIndex < characters.length;)
        {
            for (tooWideIndex = startIndex; tooWideIndex < characters.length; tooWideIndex++)
            {
                totalCharacterWidth += TextMetrics.getCharacterWidth(characters[tooWideIndex],
                    characterCache, measureText);

                if (totalCharacterWidth > wordWrapWidth)
                {
                    break;
                }
            }

            // This can happen once we've already broken up the word and started re-counting the length
            if (tooWideIndex === characters.length)
            {
                // we couldn't find a spot that made it too long, just add all of it
                result += word.substring(startIndex);
                break;
            }

            let lineBreakIndex = 0;

            for (lineBreakIndex = tooWideIndex; lineBreakIndex > startIndex; lineBreakIndex--)
            {
                // find the latest point we can break cleanly
                // according to https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages

                const c1 = lineBreakIndex >= startIndex ? characters[lineBreakIndex - 1] : null;
                const c2 = characters[lineBreakIndex];

                if (TextMetrics.canBeginLineCJK(c2, wordLanguage)
                    && TextMetrics.canEndLineCJK(c1, wordLanguage)
                    && (wordLanguage !== TextMetrics.CJKLanguage.JAPANESE
                        || TextMetrics.canBeSplitJapanese(c1, c2)))
                {
                    break;
                }
            }
            if (lineBreakIndex === 0)
            {
                // couldn't find a suitable place to break, so use the latest point
                lineBreakIndex = tooWideIndex;
            }
            result += word.substring(startIndex, lineBreakIndex);
            result += `\n${characters[lineBreakIndex]}`;

            totalCharacterWidth = TextMetrics.getCharacterWidth(characters[lineBreakIndex],
                characterCache, measureText);

            startIndex = lineBreakIndex + 1;
        }

        return result;
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

                const wordLanguage = TextMetrics.CJKTextLanguage(words[j]);

                if (style.breakWords && wordWidth > wordWrapWidth)
                {
                    // Word should be split in the middle
                    const characters = words[j].split('');

                    if (wordLanguage === TextMetrics.CJKLanguage.OTHER)
                    {
                        for (let c = 0; c < characters.length; c++)
                        {
                            const character = characters[c];

                            const characterWidth = TextMetrics.getCharacterWidth(character, characterCache,
                                context.measureText.bind(context));

                            if (characterWidth > spaceLeft)
                            {
                                result += `\n${character}`;
                                spaceLeft = wordWrapWidth - characterWidth;
                            }
                            else
                            {
                                result += character;
                                spaceLeft -= characterWidth;
                            }
                        }
                    }
                    else
                    {
                        result += TextMetrics.CJKWordWrap(words[j], context.measureText.bind(context),
                            characterCache, wordWrapWidth);
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
