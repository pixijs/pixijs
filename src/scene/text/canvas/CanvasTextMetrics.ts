import { lru } from 'tiny-lru';
import { DOMAdapter } from '../../../environment/adapter';
import { measureTaggedText } from './utils/measureTaggedText';
import { hasTagMarkup, hasTagStyles, type TextStyleRun } from './utils/parseTaggedText';
import { isBreakingSpace as isBreakingSpaceUtil, NEWLINE_MATCH_REGEX } from './utils/textTokenization';
import { wordWrap } from './utils/wordWrap';

import type { ICanvas, ICanvasRenderingContext2DSettings } from '../../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../environment/canvas/ICanvasRenderingContext2D';
import type { TextStyle } from '../TextStyle';
import type { FontMetrics } from './utils/types';

// The type for Intl.Segmenter is only available since TypeScript 4.7.2, so let's make a polyfill for it.
interface ISegmentData
{
    segment: string;
}
interface ISegments
{
    [Symbol.iterator](): IterableIterator<ISegmentData>;
}
interface ISegmenter
{
    segment(input: string): ISegments;
}
interface IIntl
{
    Segmenter?: {
        prototype: ISegmenter;
        /**
         * Creates a new Intl.Segmenter object.
         * @returns A new Intl.Segmenter object.
         */
        new(): ISegmenter;
    };
}

// Default settings used for all getContext calls
const contextSettings: ICanvasRenderingContext2DSettings = {
    // TextMetrics requires getImageData readback for measuring fonts.
    willReadFrequently: true,
};

/**
 * The TextMetrics object represents the measurement of a block of text with a specified style.
 * @example
 * import { CanvasTextMetrics, TextStyle } from 'pixi.js';
 *
 * const style = new TextStyle({
 *     fontFamily: 'Arial',
 *     fontSize: 24,
 *     fill: 0xff1010,
 *     align: 'center',
 * });
 * const textMetrics = CanvasTextMetrics.measureText('Your text', style);
 * @category text
 * @advanced
 */
export class CanvasTextMetrics
{
    /** The text that was measured. */
    public text: string;

    /** The style that was measured. */
    public style: TextStyle;

    /** The measured width of the text. */
    public width: number;

    /** The measured height of the text. */
    public height: number;

    /** An array of lines of the text broken by new lines and wrapping is specified in style. */
    public lines: string[];

    /** An array of the line widths for each line matched to `lines`. */
    public lineWidths: number[];

    /** The measured line height for this style. */
    public lineHeight: number;

    /** The maximum line width for all measured lines. */
    public maxLineWidth: number;

    /** The font properties object from TextMetrics.measureFont. */
    public fontProperties: FontMetrics;

    /**
     * Per-line style runs for tagged text rendering.
     * Each element is an array of runs for that line.
     * Only populated when text contains tag markup.
     * @internal
     */
    public runsByLine?: TextStyleRun[][];

    /**
     * Per-line ascent values for tagged text with mixed fonts.
     * Represents the max ascent across all runs on each line.
     * Only populated when text contains tag markup.
     * @internal
     */
    public lineAscents?: number[];

    /**
     * Per-line descent values for tagged text with mixed fonts.
     * Represents the max descent across all runs on each line.
     * Only populated when text contains tag markup.
     * @internal
     */
    public lineDescents?: number[];

    /**
     * Per-line heights for tagged text with mixed fonts.
     * Each line may have different height based on the fonts used.
     * Only populated when text contains tag markup.
     * @internal
     */
    public lineHeights?: number[];

    /**
     * Whether any run in the tagged text has a drop shadow.
     * Cached during measurement to avoid per-render iteration.
     * Only populated when text contains tag markup.
     * @internal
     */
    public hasDropShadow?: boolean;

    /**
     * String used for calculate font metrics.
     * These characters are all tall to help calculate the height required for text.
     */
    public static METRICS_STRING = '|ÉqÅ';

    /** Baseline symbol for calculate font metrics. */
    public static BASELINE_SYMBOL = 'M';

    /** Baseline multiplier for calculate font metrics. */
    public static BASELINE_MULTIPLIER = 1.4;

    /** Height multiplier for setting height of canvas to calculate font metrics. */
    public static HEIGHT_MULTIPLIER = 2.0;

    /**
     * A Unicode "character", or "grapheme cluster", can be composed of multiple Unicode code points,
     * such as letters with diacritical marks (e.g. `'\u0065\u0301'`, letter e with acute)
     * or emojis with modifiers (e.g. `'\uD83E\uDDD1\u200D\uD83D\uDCBB'`, technologist).
     * The new `Intl.Segmenter` API in ES2022 can split the string into grapheme clusters correctly. If it is not available,
     * PixiJS will fallback to use the iterator of String, which can only spilt the string into code points.
     * If you want to get full functionality in environments that don't support `Intl.Segmenter` (such as Firefox),
     * you can use other libraries such as [grapheme-splitter]{@link https://www.npmjs.com/package/grapheme-splitter}
     * or [graphemer]{@link https://www.npmjs.com/package/graphemer} to create a polyfill. Since these libraries can be
     * relatively large in size to handle various Unicode grapheme clusters properly, PixiJS won't use them directly.
     */
    public static graphemeSegmenter: (s: string) => string[] = (() =>
    {
        if (typeof (Intl as IIntl)?.Segmenter === 'function')
        {
            const segmenter = new (Intl as IIntl).Segmenter();

            return (s: string) =>
            {
                const segments = segmenter.segment(s);
                const result = [];

                let i = 0;

                for (const segment of segments)
                {
                    result[i++] = (segment.segment);
                }

                return result;
            };
        }

        return (s: string) => [...s];
    })();

    public static _experimentalLetterSpacingSupported?: boolean;

    /**
     * Checking that we can use modern canvas 2D API.
     *
     * Note: This is an unstable API, Chrome < 94 use `textLetterSpacing`, later versions use `letterSpacing`.
     * @see CanvasTextMetrics.experimentalLetterSpacing
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ICanvasRenderingContext2D/letterSpacing
     * @see https://developer.chrome.com/origintrials/#/view_trial/3585991203293757441
     */
    public static get experimentalLetterSpacingSupported(): boolean
    {
        let result = CanvasTextMetrics._experimentalLetterSpacingSupported;

        if (result === undefined)
        {
            const proto = DOMAdapter.get().getCanvasRenderingContext2D().prototype;

            result
                = CanvasTextMetrics._experimentalLetterSpacingSupported
                = 'letterSpacing' in proto || 'textLetterSpacing' in proto;
        }

        return result;
    }

    /**
     * New rendering behavior for letter-spacing which uses Chrome's new native API. This will
     * lead to more accurate letter-spacing results because it does not try to manually draw
     * each character. However, this Chrome API is experimental and may not serve all cases yet.
     * @see CanvasTextMetrics.experimentalLetterSpacingSupported
     */
    public static experimentalLetterSpacing = false;

    /** Cache of {@link TextMetrics.FontMetrics} objects. */
    private static _fonts: Record<string, FontMetrics> = {};

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static __canvas: ICanvas;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static __context: ICanvasRenderingContext2D;

    /** Cache for measured text metrics */
    private static readonly _measurementCache = lru<CanvasTextMetrics>(1000);

    /**
     * @param text - the text that was measured
     * @param style - the style that was measured
     * @param width - the measured width of the text
     * @param height - the measured height of the text
     * @param lines - an array of the lines of text broken by new lines and wrapping if specified in style
     * @param lineWidths - an array of the line widths for each line matched to `lines`
     * @param lineHeight - the measured line height for this style
     * @param maxLineWidth - the maximum line width for all measured lines
     * @param fontProperties - the font properties object from TextMetrics.measureFont
     * @param taggedData - optional object containing tagged text specific data
     * @param taggedData.runsByLine - per-line style runs for tagged text
     * @param taggedData.lineAscents - per-line ascent values for tagged text
     * @param taggedData.lineDescents - per-line descent values for tagged text
     * @param taggedData.lineHeights - per-line height values for tagged text
     * @param taggedData.hasDropShadow - whether any run has a drop shadow
     */
    constructor(
        text: string,
        style: TextStyle,
        width: number,
        height: number,
        lines: string[],
        lineWidths: number[],
        lineHeight: number,
        maxLineWidth: number,
        fontProperties: FontMetrics,
        taggedData?: {
            runsByLine?: TextStyleRun[][],
            lineAscents?: number[],
            lineDescents?: number[],
            lineHeights?: number[],
            hasDropShadow?: boolean,
        },
    )
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

        if (taggedData)
        {
            this.runsByLine = taggedData.runsByLine;
            this.lineAscents = taggedData.lineAscents;
            this.lineDescents = taggedData.lineDescents;
            this.lineHeights = taggedData.lineHeights;
            this.hasDropShadow = taggedData.hasDropShadow;
        }
    }

    /**
     * Measures the supplied string of text and returns a Rectangle.
     * @param text - The text to measure.
     * @param style - The text style to use for measuring
     * @param canvas - optional specification of the canvas to use for measuring.
     * @param wordWrap
     * @returns Measured width and height of the text.
     */
    public static measureText(
        text = ' ',
        style: TextStyle,
        canvas: ICanvas = CanvasTextMetrics._canvas,
        wordWrap: boolean = style.wordWrap,
    ): CanvasTextMetrics
    {
        const textKey = `${text}-${style.styleKey}-wordWrap-${wordWrap}`;

        // check if we have already measured this text with the same style
        if (CanvasTextMetrics._measurementCache.has(textKey))
        {
            return CanvasTextMetrics._measurementCache.get(textKey);
        }

        // Check if we need to use tagged text measurement
        const isTagged = hasTagStyles(style) && hasTagMarkup(text);

        if (isTagged)
        {
            const result = measureTaggedText(
                text,
                style,
                wordWrap,
                CanvasTextMetrics._context,
                CanvasTextMetrics._measureText,
                CanvasTextMetrics.measureFont,
                CanvasTextMetrics.canBreakChars,
                CanvasTextMetrics.wordWrapSplit,
            );

            const measurements = new CanvasTextMetrics(
                text,
                style,
                result.width,
                result.height,
                result.lines,
                result.lineWidths,
                result.lineHeight,
                result.maxLineWidth,
                result.fontProperties,
                {
                    runsByLine: result.runsByLine,
                    lineAscents: result.lineAscents,
                    lineDescents: result.lineDescents,
                    lineHeights: result.lineHeights,
                    hasDropShadow: result.hasDropShadow,
                },
            );

            CanvasTextMetrics._measurementCache.set(textKey, measurements);

            return measurements;
        }

        const font = style._fontString;
        const fontProperties = CanvasTextMetrics.measureFont(font);

        // fallback in case UA disallow canvas data extraction
        if (fontProperties.fontSize === 0)
        {
            fontProperties.fontSize = style.fontSize as number;
            fontProperties.ascent = style.fontSize as number;
        }

        const context = CanvasTextMetrics._context;

        context.font = font;

        const outputText = wordWrap
            ? CanvasTextMetrics._wordWrap(text, style, canvas)
            : text;
        const lines = outputText.split(NEWLINE_MATCH_REGEX);
        const lineWidths = new Array<number>(lines.length);
        let maxLineWidth = 0;

        for (let i = 0; i < lines.length; i++)
        {
            const lineWidth = CanvasTextMetrics._measureText(lines[i], style.letterSpacing, context);

            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }

        const strokeWidth = style._stroke?.width ?? 0;
        const lineHeight = style.lineHeight || fontProperties.fontSize;

        // Calculate base width - use wordWrapWidth for non-left alignment when wrapping
        const baseWidth = CanvasTextMetrics._getAlignWidth(maxLineWidth, style, wordWrap);
        const width = CanvasTextMetrics._adjustWidthForStyle(baseWidth, style);

        // Calculate height
        const baseHeight = Math.max(lineHeight, fontProperties.fontSize + strokeWidth)
            + ((lines.length - 1) * (lineHeight + style.leading));
        const height = CanvasTextMetrics._adjustHeightForStyle(baseHeight, style);

        const measurements = new CanvasTextMetrics(
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

        // cache the measurements
        CanvasTextMetrics._measurementCache.set(textKey, measurements);

        return measurements;
    }

    /**
     * Adjusts the measured width to account for stroke and drop shadow.
     * @param baseWidth - The base content width
     * @param style - The text style
     * @returns The adjusted width
     */
    private static _adjustWidthForStyle(baseWidth: number, style: TextStyle): number
    {
        const strokeWidth = style._stroke?.width || 0;
        let width = baseWidth + strokeWidth;

        if (style.dropShadow)
        {
            width += style.dropShadow.distance;
        }

        return width;
    }

    /**
     * Adjusts the measured height to account for drop shadow.
     * @param baseHeight - The base content height
     * @param style - The text style
     * @returns The adjusted height
     */
    private static _adjustHeightForStyle(baseHeight: number, style: TextStyle): number
    {
        let height = baseHeight;

        if (style.dropShadow)
        {
            height += style.dropShadow.distance;
        }

        return height;
    }

    /**
     * Calculates the base width for alignment purposes.
     * When word wrap is enabled with center/right alignment, uses wordWrapWidth.
     * @param maxLineWidth - The maximum line width
     * @param style - The text style
     * @param wordWrapEnabled - Whether word wrap is enabled
     * @returns The width to use for alignment calculations
     */
    private static _getAlignWidth(maxLineWidth: number, style: TextStyle, wordWrapEnabled: boolean): number
    {
        const useWrapWidth = wordWrapEnabled && style.align !== 'left' && style.align !== 'justify';

        return useWrapWidth ? Math.max(maxLineWidth, style.wordWrapWidth) : maxLineWidth;
    }

    /**
     * Measures the rendered width of a string, accounting for letter spacing and using the provided context.
     * @param text - The text to measure
     * @param letterSpacing - Letter spacing in pixels
     * @param context - Canvas 2D context
     * @returns The measured width of the text with spacing
     * @internal
     */
    public static _measureText(
        text: string,
        letterSpacing: number,
        context: ICanvasRenderingContext2D
    ): number
    {
        let useExperimentalLetterSpacing = false;

        if (CanvasTextMetrics.experimentalLetterSpacingSupported)
        {
            if (CanvasTextMetrics.experimentalLetterSpacing)
            {
                context.letterSpacing = `${letterSpacing}px`;
                context.textLetterSpacing = `${letterSpacing}px`;
                useExperimentalLetterSpacing = true;
            }
            else
            {
                context.letterSpacing = '0px';
                context.textLetterSpacing = '0px';
            }
        }

        const metrics = context.measureText(text);
        let metricWidth = metrics.width;
        const actualBoundingBoxLeft = -metrics.actualBoundingBoxLeft;
        const actualBoundingBoxRight = metrics.actualBoundingBoxRight;
        let boundsWidth = actualBoundingBoxRight - actualBoundingBoxLeft;

        if (metricWidth > 0)
        {
            if (useExperimentalLetterSpacing)
            {
                metricWidth -= letterSpacing;
                boundsWidth -= letterSpacing;
            }
            else
            {
                const val = (CanvasTextMetrics.graphemeSegmenter(text).length - 1) * letterSpacing;

                metricWidth += val;
                boundsWidth += val;
            }
        }

        // NOTE: this is a bit of a hack as metrics.width and the bounding box width do not measure the same thing
        // We can't seem to exclusively use one or the other, so are taking the largest of the two
        return Math.max(metricWidth, boundsWidth);
    }

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     * @param text - String to apply word wrapping to
     * @param style - the style to use when wrapping
     * @param canvas - optional specification of the canvas to use for measuring.
     * @returns New string with new lines applied where required
     */
    private static _wordWrap(
        text: string,
        style: TextStyle,
        canvas: ICanvas = CanvasTextMetrics._canvas
    ): string
    {
        return wordWrap(
            text,
            style,
            canvas,
            CanvasTextMetrics._measureText,
            CanvasTextMetrics.canBreakWords,
            CanvasTextMetrics.canBreakChars,
            CanvasTextMetrics.wordWrapSplit,
        );
    }

    /**
     * Determines if char is a breaking whitespace.
     *
     * It allows one to determine whether char should be a breaking whitespace
     * For example certain characters in CJK langs or numbers.
     * It must return a boolean.
     * @param char - The character
     * @param [_nextChar] - The next character
     * @returns True if whitespace, False otherwise.
     */
    public static isBreakingSpace(char: string, _nextChar?: string): boolean
    {
        return isBreakingSpaceUtil(char, _nextChar);
    }

    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It allows one to customise which words should break
     * Examples are if the token is CJK or numbers.
     * It must return a boolean.
     * @param _token - The token
     * @param breakWords - The style attr break words
     * @returns Whether to break word or not
     */
    public static canBreakWords(_token: string, breakWords: boolean): boolean
    {
        return breakWords;
    }

    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It allows one to determine whether a pair of characters
     * should be broken by newlines
     * For example certain characters in CJK langs or numbers.
     * It must return a boolean.
     * @param _char - The character
     * @param _nextChar - The next character
     * @param _token - The token/word the characters are from
     * @param _index - The index in the token of the char
     * @param _breakWords - The style attr break words
     * @returns whether to break word or not
     */
    public static canBreakChars(_char: string, _nextChar: string, _token: string, _index: number,
        _breakWords: boolean): boolean
    {
        return true;
    }

    /**
     * Overridable helper method used internally by TextMetrics, exposed to allow customizing the class's behavior.
     *
     * It is called when a token (usually a word) has to be split into separate pieces
     * in order to determine the point to break a word.
     * It must return an array of characters.
     * @param token - The token to split
     * @returns The characters of the token
     * @see CanvasTextMetrics.graphemeSegmenter
     */
    public static wordWrapSplit(token: string): string[]
    {
        return CanvasTextMetrics.graphemeSegmenter(token);
    }

    /**
     * Calculates the ascent, descent and fontSize of a given font-style
     * @param font - String representing the style of the font
     * @returns Font properties object
     */
    public static measureFont(font: string): FontMetrics
    {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (CanvasTextMetrics._fonts[font])
        {
            return CanvasTextMetrics._fonts[font];
        }

        const context = CanvasTextMetrics._context;

        context.font = font;
        const metrics = context.measureText(CanvasTextMetrics.METRICS_STRING + CanvasTextMetrics.BASELINE_SYMBOL);

        const properties = {
            ascent: metrics.actualBoundingBoxAscent,
            descent: metrics.actualBoundingBoxDescent,
            fontSize: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        };

        CanvasTextMetrics._fonts[font] = properties;

        return properties;
    }

    /**
     * Clear font metrics in metrics cache.
     * @param {string} [font] - font name. If font name not set then clear cache for all fonts.
     */
    public static clearMetrics(font = ''): void
    {
        if (font)
        {
            delete CanvasTextMetrics._fonts[font];
        }
        else
        {
            CanvasTextMetrics._fonts = {};
        }
    }

    /**
     * Cached canvas element for measuring text
     * TODO: this should be private, but isn't because of backward compat, will fix later.
     * @ignore
     */
    public static get _canvas(): ICanvas
    {
        if (!CanvasTextMetrics.__canvas)
        {
            let canvas: ICanvas;

            try
            {
                // OffscreenCanvas2D measureText can be up to 40% faster.
                const c = new OffscreenCanvas(0, 0);
                const context = c.getContext('2d', contextSettings);

                if (context?.measureText)
                {
                    CanvasTextMetrics.__canvas = c as ICanvas;

                    return c as ICanvas;
                }

                canvas = DOMAdapter.get().createCanvas();
            }
            catch (_cx)
            {
                canvas = DOMAdapter.get().createCanvas();
            }
            canvas.width = canvas.height = 10;
            CanvasTextMetrics.__canvas = canvas;
        }

        return CanvasTextMetrics.__canvas;
    }

    /**
     * TODO: this should be private, but isn't because of backward compat, will fix later.
     * @ignore
     */
    public static get _context(): ICanvasRenderingContext2D
    {
        if (!CanvasTextMetrics.__context)
        {
            CanvasTextMetrics.__context = CanvasTextMetrics._canvas.getContext('2d', contextSettings);
        }

        return CanvasTextMetrics.__context;
    }
}
