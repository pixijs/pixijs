import { parseTaggedText, type TextStyleRun } from './parseTaggedText';
import {
    collapseNewlines,
    collapseSpaces,
    getCharacterGroups,
    isBreakingSpace,
    isNewline,
    NEWLINE_SPLIT_REGEX,
    tokenize,
    trimRight,
} from './textTokenization';

import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';
import type { TextStyle } from '../../TextStyle';
import type {
    CanBreakCharsFn,
    FontMetrics,
    MeasureTextFn,
    WordWrapSplitFn,
} from './types';

/**
 * Function type for measuring font metrics.
 * @internal
 */
type MeasureFontFn = (font: string) => FontMetrics;

/**
 * Result of measuring tagged text.
 * @internal
 */
interface TaggedMeasurementResult
{
    /** Total width including stroke and shadow */
    width: number;
    /** Total height including shadow */
    height: number;
    /** Array of line text (for compatibility) */
    lines: string[];
    /** Per-line widths */
    lineWidths: number[];
    /** Base line height from style */
    lineHeight: number;
    /** Maximum line width */
    maxLineWidth: number;
    /** Font properties from base style */
    fontProperties: FontMetrics;
    /** Per-line style runs */
    runsByLine: TextStyleRun[][];
    /** Per-line ascent values */
    lineAscents: number[];
    /** Per-line descent values */
    lineDescents: number[];
    /** Per-line heights */
    lineHeights: number[];
    /** Whether any run has drop shadow */
    hasDropShadow: boolean;
}

/**
 * Styled token with continuation flag for word wrapping.
 * @internal
 */
interface StyledToken
{
    token: string;
    style: TextStyle;
    continuesFromPrevious: boolean;
}

/**
 * Regex to replace newlines with spaces.
 * @internal
 */
const NEWLINE_TO_SPACE_REGEX = /\r\n|\r|\n/g;

/**
 * Measures tagged text with multiple styles.
 * Handles per-run font measurement and per-line metrics.
 * @param text - The tagged text to measure
 * @param style - The base text style containing tagStyles
 * @param wordWrap - Whether to apply word wrapping
 * @param context - The canvas 2D context
 * @param measureTextFn - Function to measure text width
 * @param measureFontFn - Function to measure font metrics
 * @param canBreakCharsFn - Function to check if characters can be broken
 * @param wordWrapSplitFn - Function to split words into characters
 * @returns TaggedMeasurementResult with all measurement data
 * @internal
 */
export function measureTaggedText(
    text: string,
    style: TextStyle,
    wordWrap: boolean,
    context: ICanvasRenderingContext2D,
    measureTextFn: MeasureTextFn,
    measureFontFn: MeasureFontFn,
    canBreakCharsFn: CanBreakCharsFn,
    wordWrapSplitFn: WordWrapSplitFn,
): TaggedMeasurementResult
{
    // Parse text into runs
    const runs = parseTaggedText(text, style);

    // Collapse newlines to spaces in 'normal' mode (matching regular text behavior)
    const shouldCollapseNewlines = collapseNewlines(style.whiteSpace);

    if (shouldCollapseNewlines)
    {
        for (let i = 0; i < runs.length; i++)
        {
            const run = runs[i];

            runs[i] = { text: run.text.replace(NEWLINE_TO_SPACE_REGEX, ' '), style: run.style };
        }
    }

    // First, we need to handle newlines and word wrap
    // Split runs by newlines first
    const runsByLine: TextStyleRun[][] = [];
    let currentLineRuns: TextStyleRun[] = [];

    for (const run of runs)
    {
        // Split run text by newlines
        const parts = run.text.split(NEWLINE_SPLIT_REGEX);

        for (let i = 0; i < parts.length; i++)
        {
            const part = parts[i];

            if (part === '\r\n' || part === '\r' || part === '\n')
            {
                // Push current line and start a new one
                runsByLine.push(currentLineRuns);
                currentLineRuns = [];
            }
            else if (part.length > 0)
            {
                currentLineRuns.push({ text: part, style: run.style });
            }
        }
    }
    // Don't forget the last line
    if (currentLineRuns.length > 0 || runsByLine.length === 0)
    {
        runsByLine.push(currentLineRuns);
    }

    // Apply word wrap if enabled
    const wrappedRunsByLine = wordWrap
        ? wordWrapTaggedLines(
            runsByLine,
            style,
            context,
            measureTextFn,
            canBreakCharsFn,
            wordWrapSplitFn,
        )
        : runsByLine;

    // Measure each line
    const lineWidths: number[] = [];
    const lineAscents: number[] = [];
    const lineDescents: number[] = [];
    const lineHeightsArr: number[] = [];
    const lines: string[] = [];
    let maxLineWidth = 0;

    // Get base font properties for fallback
    const baseFont = style._fontString;
    const baseFontProps = measureFontFn(baseFont);

    // Fallback in case UA disallows canvas data extraction
    if (baseFontProps.fontSize === 0)
    {
        baseFontProps.fontSize = style.fontSize as number;
        baseFontProps.ascent = style.fontSize as number;
    }

    let lastFont = '';
    let hasDropShadow = !!style.dropShadow;

    for (const lineRuns of wrappedRunsByLine)
    {
        let lineWidth = 0;
        let lineAscent = baseFontProps.ascent;
        let lineDescent = baseFontProps.descent;
        let lineText = '';

        for (const run of lineRuns)
        {
            const runFont = run.style._fontString;
            const runFontProps = measureFontFn(runFont);

            if (runFont !== lastFont)
            {
                context.font = runFont;
                lastFont = runFont;
            }

            const runWidth = measureTextFn(run.text, run.style.letterSpacing, context);

            lineWidth += runWidth;
            lineAscent = Math.max(lineAscent, runFontProps.ascent);
            lineDescent = Math.max(lineDescent, runFontProps.descent);
            lineText += run.text;

            if (!hasDropShadow && run.style.dropShadow)
            {
                hasDropShadow = true;
            }
        }

        // Handle empty lines
        if (lineRuns.length === 0)
        {
            lineAscent = baseFontProps.ascent;
            lineDescent = baseFontProps.descent;
        }

        lineWidths.push(lineWidth);
        lineAscents.push(lineAscent);
        lineDescents.push(lineDescent);
        lines.push(lineText);

        // Calculate line height - use style.lineHeight if set, otherwise use measured metrics
        const computedLineHeight = style.lineHeight ?? (lineAscent + lineDescent);

        lineHeightsArr.push(computedLineHeight + style.leading);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    // Calculate total dimensions
    const strokeWidth = style._stroke?.width || 0;

    // Calculate base width - use wordWrapWidth for non-left alignment when wrapping
    const useWrapWidth = wordWrap && style.align !== 'left' && style.align !== 'justify';
    const alignWidth = useWrapWidth ? Math.max(maxLineWidth, style.wordWrapWidth) : maxLineWidth;
    const width = alignWidth + strokeWidth + (style.dropShadow ? style.dropShadow.distance : 0);

    // Calculate total height from per-line heights
    let baseHeight = 0;

    for (let i = 0; i < lineHeightsArr.length; i++)
    {
        baseHeight += lineHeightsArr[i];
    }

    // Add stroke width to height for first line (to match non-tagged behavior)
    baseHeight = Math.max(baseHeight, lineHeightsArr[0] + strokeWidth);
    const height = baseHeight + (style.dropShadow ? style.dropShadow.distance : 0);

    // Use the base style's line height for the lineHeight property (for backwards compat)
    const baseLineHeight = style.lineHeight ?? baseFontProps.fontSize;

    return {
        width,
        height,
        lines,
        lineWidths,
        lineHeight: baseLineHeight + style.leading,
        maxLineWidth,
        fontProperties: baseFontProps,
        runsByLine: wrappedRunsByLine,
        lineAscents,
        lineDescents,
        lineHeights: lineHeightsArr,
        hasDropShadow,
    };
}

/**
 * Applies word wrapping to tagged text lines.
 * Breaks runs at word boundaries while maintaining style information.
 * @param runsByLine - Array of run arrays, one per line
 * @param style - The base text style
 * @param context - The canvas 2D context
 * @param measureTextFn - Function to measure text width
 * @param canBreakCharsFn - Function to check if characters can be broken
 * @param wordWrapSplitFn - Function to split words into characters
 * @returns New runsByLine array with word wrap applied
 * @internal
 */
export function wordWrapTaggedLines(
    runsByLine: TextStyleRun[][],
    style: TextStyle,
    context: ICanvasRenderingContext2D,
    measureTextFn: MeasureTextFn,
    canBreakCharsFn: CanBreakCharsFn,
    wordWrapSplitFn: WordWrapSplitFn,
): TextStyleRun[][]
{
    const { letterSpacing, whiteSpace, wordWrapWidth, breakWords } = style;

    // How to handle whitespaces
    const shouldCollapseSpaces = collapseSpaces(whiteSpace);

    // Adjust for letterSpacing (see _wordWrap for explanation)
    const adjustedWrapWidth = wordWrapWidth + letterSpacing;

    // Cache for token width measurements and font tracking to avoid redundant work
    const tokenWidthCache: Record<string, number> = {};
    let lastFont = '';

    const measureTokenWidth = (token: string, tokenStyle: TextStyle): number =>
    {
        const cacheKey = `${token}|${tokenStyle.styleKey}`;
        let width = tokenWidthCache[cacheKey];

        if (width === undefined)
        {
            const font = tokenStyle._fontString;

            if (font !== lastFont)
            {
                context.font = font;
                lastFont = font;
            }
            width = measureTextFn(token, tokenStyle.letterSpacing, context)
                + tokenStyle.letterSpacing;
            tokenWidthCache[cacheKey] = width;
        }

        return width;
    };

    const result: TextStyleRun[][] = [];

    // Process each line from the input
    for (const lineRuns of runsByLine)
    {
        // Tokenize all runs on this line into styled tokens
        const styledTokens = tokenizeTaggedRuns(lineRuns);

        // Track if we pushed content directly to result (for word groups)
        const resultStartLength = result.length;

        // Helper to calculate the total width of a word group starting at index
        // A word group is a sequence of tokens where each subsequent token has continuesFromPrevious: true
        const getWordGroupWidth = (startIndex: number): number =>
        {
            let totalWidth = 0;
            let j = startIndex;

            do
            {
                const { token: groupToken, style: groupStyle } = styledTokens[j];

                totalWidth += measureTokenWidth(groupToken, groupStyle);
                j++;
            }
            while (j < styledTokens.length && styledTokens[j].continuesFromPrevious);

            return totalWidth;
        };

        // Helper to get all tokens in a word group
        const getWordGroupTokens = (startIndex: number): Array<{ token: string; style: TextStyle }> =>
        {
            const tokens: Array<{ token: string; style: TextStyle }> = [];
            let j = startIndex;

            do
            {
                tokens.push({ token: styledTokens[j].token, style: styledTokens[j].style });
                j++;
            }
            while (j < styledTokens.length && styledTokens[j].continuesFromPrevious);

            return tokens;
        };

        // Now apply word wrap logic to these tokens
        let currentLineRuns: TextStyleRun[] = [];
        let currentWidth = 0;
        let canPrependSpaces = !shouldCollapseSpaces;

        // Track the current "building" run (to merge adjacent tokens with same style)
        let buildingRun: TextStyleRun | null = null;

        const flushBuildingRun = (): void =>
        {
            if (buildingRun && buildingRun.text.length > 0)
            {
                currentLineRuns.push(buildingRun);
            }
            buildingRun = null;
        };

        const startNewLine = (): void =>
        {
            flushBuildingRun();
            // Trim trailing spaces from last run on line
            if (currentLineRuns.length > 0)
            {
                const lastRun = currentLineRuns[currentLineRuns.length - 1];

                lastRun.text = trimRight(lastRun.text);
                if (lastRun.text.length === 0)
                {
                    currentLineRuns.pop();
                }
            }
            result.push(currentLineRuns);
            currentLineRuns = [];
            currentWidth = 0;
            canPrependSpaces = false;
        };

        for (let i = 0; i < styledTokens.length; i++)
        {
            const { token, style: tokenStyle, continuesFromPrevious } = styledTokens[i];

            const tokenWidth = measureTokenWidth(token, tokenStyle);

            // Handle collapsing spaces
            if (shouldCollapseSpaces)
            {
                const currIsSpace = isBreakingSpace(token);
                const lastChar = buildingRun?.text[buildingRun.text.length - 1]
                    ?? currentLineRuns[currentLineRuns.length - 1]?.text.slice(-1)
                    ?? '';
                const lastIsSpace = lastChar ? isBreakingSpace(lastChar) : false;

                if (currIsSpace && lastIsSpace)
                {
                    continue;
                }
            }

            // Check if this token starts a word group (not a continuation)
            const startsWordGroup = !continuesFromPrevious;

            // Calculate word group width if this starts a new word group
            const wordGroupWidth = startsWordGroup ? getWordGroupWidth(i) : tokenWidth;

            // Word group is longer than the wrap width
            if (wordGroupWidth > adjustedWrapWidth && startsWordGroup)
            {
                // Flush any existing content to a new line
                if (currentWidth > 0)
                {
                    startNewLine();
                }

                // Break the long word group if allowed
                if (breakWords)
                {
                    // Get all tokens in this word group
                    const wordGroupTokens = getWordGroupTokens(i);

                    // Process each token in the word group
                    for (let g = 0; g < wordGroupTokens.length; g++)
                    {
                        const groupToken = wordGroupTokens[g].token;
                        const groupStyle = wordGroupTokens[g].style;
                        const charGroups = getCharacterGroups(
                            groupToken,
                            breakWords,
                            wordWrapSplitFn,
                            canBreakCharsFn,
                        );

                        for (const char of charGroups)
                        {
                            const charWidth = measureTokenWidth(char, groupStyle);

                            // eslint-disable-next-line max-depth
                            if (charWidth + currentWidth > adjustedWrapWidth)
                            {
                                startNewLine();
                            }

                            // Add char to building run
                            // eslint-disable-next-line max-depth
                            if (!buildingRun || buildingRun.style !== groupStyle)
                            {
                                flushBuildingRun();
                                buildingRun = { text: char, style: groupStyle };
                            }
                            else
                            {
                                buildingRun.text += char;
                            }
                            currentWidth += charWidth;
                        }
                    }

                    // Skip all the tokens we just processed
                    i += wordGroupTokens.length - 1;
                }
                else
                {
                    // Can't break - put whole word group on its own line
                    const wordGroupTokens = getWordGroupTokens(i);

                    flushBuildingRun();
                    result.push(wordGroupTokens.map((t) => ({ text: t.token, style: t.style })));
                    canPrependSpaces = false;

                    // Skip all the tokens we just processed
                    i += wordGroupTokens.length - 1;
                }
            }
            // Word group would exceed line width (but fits on its own line)
            else if (wordGroupWidth + currentWidth > adjustedWrapWidth && startsWordGroup)
            {
                // Don't start new line with just a space
                if (isBreakingSpace(token))
                {
                    canPrependSpaces = false;
                    continue;
                }

                startNewLine();

                // Start new building run with this token
                buildingRun = { text: token, style: tokenStyle };
                currentWidth = tokenWidth;
            }
            // Token is a continuation of a word group - always add it (don't wrap mid-word when breakWords: false)
            else if (continuesFromPrevious && !breakWords)
            {
                // Add to building run or start new one
                if (!buildingRun || buildingRun.style !== tokenStyle)
                {
                    flushBuildingRun();
                    buildingRun = { text: token, style: tokenStyle };
                }
                else
                {
                    buildingRun.text += token;
                }
                currentWidth += tokenWidth;
            }
            // Token fits on current line (or is a continuation with breakWords: true)
            else
            {
                const isSpace = isBreakingSpace(token);

                // Don't prepend spaces to line start unless allowed
                if (currentWidth === 0 && isSpace && !canPrependSpaces)
                {
                    continue;
                }

                // Add to building run or start new one
                if (!buildingRun || buildingRun.style !== tokenStyle)
                {
                    flushBuildingRun();
                    buildingRun = { text: token, style: tokenStyle };
                }
                else
                {
                    buildingRun.text += token;
                }
                currentWidth += tokenWidth;
            }
        }

        // Flush final content
        flushBuildingRun();
        if (currentLineRuns.length > 0)
        {
            // Trim trailing spaces
            const lastRun = currentLineRuns[currentLineRuns.length - 1];

            lastRun.text = trimRight(lastRun.text);
            if (lastRun.text.length === 0)
            {
                currentLineRuns.pop();
            }
        }

        // Push final line if it has content, or if we haven't pushed anything yet.
        // The second condition (result.length === resultStartLength) ensures we preserve
        // explicit blank lines from the input text. Without this, a line containing only
        // whitespace would be trimmed away entirely, collapsing consecutive newlines.
        if (currentLineRuns.length > 0 || result.length === resultStartLength)
        {
            result.push(currentLineRuns);
        }
    }

    return result;
}

/**
 * Tokenizes an array of TextStyleRuns into individual styled tokens.
 * Each token is a word, space, or newline with its associated style.
 * Tracks whether adjacent tokens across run boundaries form a continuous word.
 * @param runs - The runs to tokenize
 * @returns Array of styled tokens with continuation flags
 * @internal
 */
export function tokenizeTaggedRuns(
    runs: TextStyleRun[]
): StyledToken[]
{
    const styledTokens: StyledToken[] = [];
    let lastTokenWasWord = false;

    for (const run of runs)
    {
        const tokens = tokenize(run.text);
        let isFirstTokenInRun = true;

        for (const token of tokens)
        {
            const isSpace = isBreakingSpace(token) || isNewline(token);

            // Token continues from previous word if:
            // 1. It's the first token in this run
            // 2. The previous run's last token was a word (not space)
            // 3. This token is also a word (not space)
            const continuesFromPrevious = isFirstTokenInRun && lastTokenWasWord && !isSpace;

            styledTokens.push({ token, style: run.style, continuesFromPrevious });

            lastTokenWasWord = !isSpace;
            isFirstTokenInRun = false;
        }
    }

    return styledTokens;
}
