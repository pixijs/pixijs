import { Matrix } from '../../../maths/matrix/Matrix';
import { Container } from '../../container/Container';
import { FillGradient } from '../../graphics/shared/fill/FillGradient';
import { type SplitOptions } from '../../text-split/SplitText';
import { type TextSplitOutput } from '../../text-split/types';
import { CanvasTextGenerator } from '../canvas/CanvasTextGenerator';
import { CanvasTextMetrics } from '../canvas/CanvasTextMetrics';
import { type TextStyleRun } from '../canvas/utils/parseTaggedText';
import { Text } from '../Text';
import { type TextStyle } from '../TextStyle';

interface GroupedSegment
{
    line: string;
    chars: string[];
}

function getAlignmentOffset(alignment: string, lineWidth: number, largestLine: number): number
{
    switch (alignment)
    {
        case 'center':
            return (largestLine - lineWidth) / 2;
        case 'right':
            return largestLine - lineWidth;
        case 'left':
        default:
            return 0;
    }
}

function isNewlineCharacter(char: string): boolean
{
    return char === '\r' || char === '\n' || char === '\r\n';
}

const whitespaceRegex = /^\s*$/;

/**
 * Groups text segments into lines based on measured text metrics
 * @param segments - Array of text segments to group
 * @param measuredText - The pre-measured text metrics
 * @param measuredText.lines
 * @returns Array of grouped segments containing line information
 */
function groupTextSegments(
    segments: string[],
    measuredText: { lines: string[] },
): GroupedSegment[]
{
    const groupedSegments: GroupedSegment[] = [];
    let currentLine = measuredText.lines[0];
    let matchedLine = '';
    let chars: string[] = [];
    let lineCount = 0;

    segments.forEach((segment) =>
    {
        const isWhitespace = whitespaceRegex.test(segment);
        const isNewline = isNewlineCharacter(segment);
        const isSpaceAtStart = matchedLine.length === 0 && isWhitespace;

        if (isWhitespace && !isNewline && isSpaceAtStart)
        {
            return;
        }

        if (!isNewline) matchedLine += segment;

        chars.push(segment);

        if (matchedLine.length >= currentLine.length)
        {
            groupedSegments.push({
                line: matchedLine,
                chars,
            });
            chars = [];
            matchedLine = '';
            lineCount++;
            currentLine = measuredText.lines[lineCount];
        }
    });

    return groupedSegments;
}

/**
 * Splits a Text object into segments based on the text's layout and style,
 * and adds these segments as individual Text objects to a specified container.
 *
 * This function handles word wrapping, alignment, and letter spacing,
 * ensuring that each segment is rendered correctly according to the original text's style.
 * It uses the CanvasTextMetrics to measure text dimensions and segment the text into lines.
 * @param options - Configuration options for the text split operation.
 * @returns An array of Text objects representing the split segments.
 * @internal
 */
export function canvasTextSplit(
    options: Pick<SplitOptions, 'text' | 'style'> & { chars: Text[] },
): TextSplitOutput<Text>
{
    const { text, style, chars: existingChars } = options;
    const textStyle = style as TextStyle;

    // measure the entire text to get the layout
    const measuredText = CanvasTextMetrics.measureText(text, textStyle);

    if (measuredText.runsByLine && measuredText.runsByLine.length > 0)
    {
        return canvasTaggedTextSplitFromRuns(measuredText, textStyle, existingChars, text);
    }

    // split the text into segments
    const segments = CanvasTextMetrics.graphemeSegmenter(text);
    // now group the segments into lines based on measured lines
    const groupedSegments: GroupedSegment[] = groupTextSegments(segments, measuredText);

    const alignment = textStyle.align;
    const maxLineWidth = measuredText.lineWidths.reduce((max, line) => Math.max(max, line), 0);
    const isSingleLine = measuredText.lines.length === 1;
    // For single-line text, alignment has no effect (nothing to align relative to)
    // Multi-line text uses wordWrapWidth when word wrap is enabled
    const useWordWrapWidth = !isSingleLine && textStyle.wordWrap;
    const alignWidth = useWordWrapWidth ? textStyle.wordWrapWidth : maxLineWidth;

    // Check if fill or stroke contains a gradient that needs offset/bounds
    const fillGradient = textStyle._fill?.fill;
    const strokeGradient = textStyle._stroke?.fill;

    const hasFillGradient = fillGradient instanceof FillGradient;
    const hasStrokeGradient = strokeGradient instanceof FillGradient;
    const hasGradient = hasFillGradient || hasStrokeGradient;
    const hasLocalGradient = (hasFillGradient && fillGradient.textureSpace === 'local')
        || (hasStrokeGradient && strokeGradient.textureSpace === 'local');

    // Store full text dimensions for gradient calculation
    const fullTextWidth = measuredText.width;
    const fullTextHeight = measuredText.height;

    // Clone style for individual characters with left alignment.
    // Container-level positioning handles alignment via getAlignmentOffset().
    // Without this, each character applies its own alignment offset within its measurement area.
    const baseCharStyle = textStyle.clone();

    baseCharStyle.align = 'left';

    // When trim is enabled on the style, calculate the trim offset for the whole text block once,
    // then disable trim on individual characters and offset all characters to compensate
    let trimOffsetX = 0;
    let trimOffsetY = 0;

    if (baseCharStyle.trim)
    {
        const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
            text,
            style: textStyle,
            resolution: 1,
        });

        CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);

        trimOffsetX = -frame.x;
        trimOffsetY = -frame.y;

        // Disable trim for individual characters; we'll use the whole-text trim offset instead
        baseCharStyle.trim = false;
    }

    // now create Text objects for each segment and add them to the container
    const chars: Text[] = [];
    const lineContainers: Container[] = [];
    const wordContainers: Container[] = [];
    let yOffset = 0;
    let existingCharIndex = 0;

    // Cache gradient bounds object; identical for every character
    const gradientBounds = hasLocalGradient ? { width: fullTextWidth, height: fullTextHeight } : null;

    groupedSegments.forEach((group, lineIndex) =>
    {
        const lineContainer = new Container({ label: `line-${lineIndex}` });

        lineContainer.y = yOffset + trimOffsetY;
        lineContainers.push(lineContainer);

        const lineWidth = measuredText.lineWidths[lineIndex];
        let xOffset = getAlignmentOffset(alignment, lineWidth, alignWidth);

        let currentWordContainer = new Container({ label: 'word' });

        currentWordContainer.x = xOffset + trimOffsetX;

        // Use remaining-width technique for kerning-aware character positioning
        const context = CanvasTextMetrics._context;

        context.font = baseCharStyle._fontString;
        if (CanvasTextMetrics.experimentalLetterSpacingSupported)
        {
            context.letterSpacing = '0px';
            context.textLetterSpacing = '0px';
        }

        let remainingLineText = group.line;
        let previousRemainingWidth = context.measureText(remainingLineText).width;

        group.chars.forEach((segment) =>
        {
            if (isNewlineCharacter(segment))
            {
                return;
            }

            remainingLineText = remainingLineText.slice(segment.length);
            const currentRemainingWidth = remainingLineText.length > 0
                ? context.measureText(remainingLineText).width : 0;
            const charAdvance = previousRemainingWidth - currentRemainingWidth;

            previousRemainingWidth = currentRemainingWidth;

            if (charAdvance === 0) return;

            if (segment === ' ')
            {
                if (currentWordContainer.children.length > 0)
                {
                    wordContainers.push(currentWordContainer);
                    lineContainer.addChild(currentWordContainer);
                }

                xOffset += charAdvance + textStyle.letterSpacing;
                currentWordContainer = new Container({ label: 'word' });
                currentWordContainer.x = xOffset + trimOffsetX;
            }
            else
            {
                let charStyle = baseCharStyle;

                if (hasGradient)
                {
                    charStyle = baseCharStyle.clone();
                    charStyle._gradientOffset = { x: -xOffset, y: -yOffset };
                    if (gradientBounds)
                    {
                        charStyle._gradientBounds = gradientBounds;
                    }
                }

                let char: Text;

                if (existingCharIndex < existingChars.length)
                {
                    char = existingChars[existingCharIndex++];

                    char.text = segment;
                    char.style = charStyle;
                    char.setFromMatrix(Matrix.IDENTITY);
                    char.x = xOffset - currentWordContainer.x + trimOffsetX;
                }
                else
                {
                    char = new Text({
                        text: segment,
                        style: charStyle,
                        x: xOffset - currentWordContainer.x + trimOffsetX,
                    });
                }

                chars.push(char);
                currentWordContainer.addChild(char);
                xOffset += charAdvance + textStyle.letterSpacing;
            }
        });

        // Add the last word container of the line if it has children
        if (currentWordContainer.children.length > 0)
        {
            wordContainers.push(currentWordContainer);
            lineContainer.addChild(currentWordContainer);
        }

        // Justify: distribute extra space among word gaps
        if (alignment === 'justify' && textStyle.wordWrap && lineIndex < groupedSegments.length - 1)
        {
            const lineWords = lineContainer.children;
            const wordGaps = lineWords.length - 1;

            if (wordGaps > 0)
            {
                const extraPerGap = (alignWidth - lineWidth) / wordGaps;

                for (let i = 1; i < lineWords.length; i++)
                {
                    lineWords[i].x += i * extraPerGap;
                }
            }
        }

        yOffset += measuredText.lineHeight;
    });

    return { chars, lines: lineContainers, words: wordContainers };
}

function canvasTaggedTextSplitFromRuns(
    measuredText: CanvasTextMetrics,
    textStyle: TextStyle,
    existingChars: Text[],
    text: string,
): TextSplitOutput<Text>
{
    const { runsByLine } = measuredText;
    const alignment = textStyle.align;
    const maxLineWidth = measuredText.lineWidths.reduce((max, line) => Math.max(max, line), 0);
    const isSingleLine = measuredText.lines.length === 1;
    const useWordWrapWidth = !isSingleLine && textStyle.wordWrap;
    const alignWidth = useWordWrapWidth ? textStyle.wordWrapWidth : maxLineWidth;

    let trimOffsetX = 0;
    let trimOffsetY = 0;

    if (textStyle.trim)
    {
        const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
            text,
            style: textStyle,
            resolution: 1,
        });

        CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);
        trimOffsetX = -frame.x;
        trimOffsetY = -frame.y;
    }

    const chars: Text[] = [];
    const lineContainers: Container[] = [];
    const wordContainers: Container[] = [];
    let yOffset = 0;
    let existingCharIndex = 0;

    runsByLine.forEach((lineRuns: TextStyleRun[], lineIndex: number) =>
    {
        const lineContainer = new Container({ label: `line-${lineIndex}` });

        lineContainer.y = yOffset + trimOffsetY;
        lineContainers.push(lineContainer);

        const lineWidth = measuredText.lineWidths[lineIndex];
        let xOffset = getAlignmentOffset(alignment, lineWidth, alignWidth);

        let currentWordContainer = new Container({ label: 'word' });

        currentWordContainer.x = xOffset + trimOffsetX;

        for (const run of lineRuns)
        {
            const runStyle = run.style;

            const fillGradient = runStyle._fill?.fill;
            const strokeGradient = runStyle._stroke?.fill;
            const hasFillGradient = fillGradient instanceof FillGradient;
            const hasStrokeGradient = strokeGradient instanceof FillGradient;
            const hasGradient = hasFillGradient || hasStrokeGradient;
            const hasLocalGradient = (hasFillGradient && fillGradient.textureSpace === 'local')
                || (hasStrokeGradient && strokeGradient.textureSpace === 'local');

            const graphemes = CanvasTextMetrics.graphemeSegmenter(run.text);

            const baseRunStyle = runStyle.clone();

            baseRunStyle.align = 'left';
            baseRunStyle.wordWrap = false;
            if (baseRunStyle.trim) baseRunStyle.trim = false;
            baseRunStyle.tagStyles = undefined;

            // Use remaining-width technique for kerning-aware character positioning
            const context = CanvasTextMetrics._context;

            context.font = baseRunStyle._fontString;
            if (CanvasTextMetrics.experimentalLetterSpacingSupported)
            {
                context.letterSpacing = '0px';
                context.textLetterSpacing = '0px';
            }

            let remainingText = run.text;
            let previousRemainingWidth = context.measureText(remainingText).width;
            const runStartX = xOffset;
            const runTextWidth = previousRemainingWidth;
            const runFontProps = CanvasTextMetrics.measureFont(baseRunStyle._fontString);
            const runHeight = runStyle.lineHeight || runFontProps.fontSize;
            const runGradientBounds = hasLocalGradient
                ? { width: runTextWidth, height: runHeight } : null;

            for (const grapheme of graphemes)
            {
                remainingText = remainingText.slice(grapheme.length);
                const currentRemainingWidth = remainingText.length > 0
                    ? context.measureText(remainingText).width : 0;
                const charAdvance = previousRemainingWidth - currentRemainingWidth;

                previousRemainingWidth = currentRemainingWidth;

                if (isNewlineCharacter(grapheme)) continue;
                if (charAdvance === 0) continue;

                if (grapheme === ' ')
                {
                    if (currentWordContainer.children.length > 0)
                    {
                        wordContainers.push(currentWordContainer);
                        lineContainer.addChild(currentWordContainer);
                    }
                    xOffset += charAdvance + runStyle.letterSpacing;
                    currentWordContainer = new Container({ label: 'word' });
                    currentWordContainer.x = xOffset + trimOffsetX;
                }
                else
                {
                    let charStyle = baseRunStyle;

                    if (hasGradient)
                    {
                        charStyle = baseRunStyle.clone();
                        if (hasLocalGradient)
                        {
                            charStyle._gradientOffset = { x: -(xOffset - runStartX), y: 0 };
                            charStyle._gradientBounds = runGradientBounds;
                        }
                        else
                        {
                            charStyle._gradientOffset = { x: -(xOffset - runStartX), y: 0 };
                        }
                    }

                    let char: Text;

                    if (existingCharIndex < existingChars.length)
                    {
                        char = existingChars[existingCharIndex++];
                        char.text = grapheme;
                        char.style = charStyle;
                        char.setFromMatrix(Matrix.IDENTITY);
                        char.x = xOffset - currentWordContainer.x + trimOffsetX;
                    }
                    else
                    {
                        char = new Text({
                            text: grapheme,
                            style: charStyle,
                            x: xOffset - currentWordContainer.x + trimOffsetX,
                        });
                    }

                    chars.push(char);
                    currentWordContainer.addChild(char);
                    xOffset += charAdvance + runStyle.letterSpacing;
                }
            }
        }

        if (currentWordContainer.children.length > 0)
        {
            wordContainers.push(currentWordContainer);
            lineContainer.addChild(currentWordContainer);
        }

        // Justify: distribute extra space among word gaps
        if (alignment === 'justify' && textStyle.wordWrap && lineIndex < runsByLine.length - 1)
        {
            const lineWords = lineContainer.children;
            const wordGaps = lineWords.length - 1;

            if (wordGaps > 0)
            {
                const extraPerGap = (alignWidth - lineWidth) / wordGaps;

                for (let i = 1; i < lineWords.length; i++)
                {
                    lineWords[i].x += i * extraPerGap;
                }
            }
        }

        const lineHeight = measuredText.lineHeights?.[lineIndex] ?? measuredText.lineHeight;

        yOffset += lineHeight;
    });

    return { chars, lines: lineContainers, words: wordContainers };
}
