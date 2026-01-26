import { Matrix } from '../../../maths/matrix/Matrix';
import { Container } from '../../container/Container';
import { FillGradient } from '../../graphics/shared/fill/FillGradient';
import { type SplitOptions } from '../../text-split/SplitText';
import { type TextSplitOutput } from '../../text-split/types';
import { CanvasTextGenerator } from '../canvas/CanvasTextGenerator';
import { CanvasTextMetrics } from '../canvas/CanvasTextMetrics';
import { Text } from '../Text';
import { type TextStyle } from '../TextStyle';

interface Segment
{
    char: string;
    metric: CanvasTextMetrics;
}

interface GroupedSegment
{
    line: string;
    chars: Segment[];
    width: number;
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

/**
 * Groups text segments into lines based on measured text metrics
 * @param segments - Array of text segments to group
 * @param measuredText - The pre-measured text metrics
 * @param measuredText.lines
 * @param textStyle - The text style to use for measurements
 * @returns Array of grouped segments containing line information
 */
function groupTextSegments(
    segments: string[],
    measuredText: { lines: string[] },
    textStyle: TextStyle,
): GroupedSegment[]
{
    const groupedSegments: GroupedSegment[] = [];
    let currentLine = measuredText.lines[0];
    let matchedLine = '';
    let chars: Segment[] = [];
    let lineCount = 0;

    // Disable word wrap for individual character measurements
    textStyle.wordWrap = false;

    segments.forEach((segment) =>
    {
        const isWhitespace = (/^\s*$/).test(segment);
        const isNewline = isNewlineCharacter(segment);
        const isSpaceAtStart = matchedLine.length === 0 && isWhitespace;

        if (isWhitespace && !isNewline && isSpaceAtStart)
        {
            return;
        }

        if (!isNewline) matchedLine += segment;

        const metric = CanvasTextMetrics.measureText(segment, textStyle);

        chars.push({ char: segment, metric });

        if (matchedLine.length >= currentLine.length)
        {
            groupedSegments.push({
                line: matchedLine,
                chars,
                width: chars.reduce((acc, seg) => acc + seg.metric.width, 0),
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
    // split the text into segments
    const segments = CanvasTextMetrics.graphemeSegmenter(text);
    // now group the segments into lines based on measured lines
    const groupedSegments: GroupedSegment[] = groupTextSegments(segments, measuredText, textStyle.clone());

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
    const strokeWidth = textStyle._stroke?.width || 0;
    const dropShadowDistance = textStyle.dropShadow?.distance || 0;

    groupedSegments.forEach((group, lineIndex) =>
    {
        const lineContainer = new Container({ label: `line-${lineIndex}` });

        lineContainer.y = yOffset + trimOffsetY;
        lineContainers.push(lineContainer);

        const lineWidth = measuredText.lineWidths[lineIndex];
        let xOffset = getAlignmentOffset(alignment, lineWidth, alignWidth);

        let currentWordContainer = new Container({ label: 'word' });

        currentWordContainer.x = xOffset + trimOffsetX;

        group.chars.forEach((segment, charIndex) =>
        {
            if (segment.metric.width === 0)
            {
                return; // skip zero-width segments
            }

            if (isNewlineCharacter(segment.char))
            {
                xOffset += segment.metric.width - strokeWidth;

                return; // Skip newline characters
            }

            if (segment.char === ' ')
            {
                // Add current word container if it has content
                if (currentWordContainer.children.length > 0)
                {
                    wordContainers.push(currentWordContainer);
                    lineContainer.addChild(currentWordContainer);
                }

                // Start new word container
                xOffset += segment.metric.width + textStyle.letterSpacing - strokeWidth;
                currentWordContainer = new Container({ label: 'word' });
                currentWordContainer.x = xOffset + trimOffsetX;
            }
            else
            {
                // Create style for this character
                let charStyle = baseCharStyle;

                if (hasGradient)
                {
                    charStyle = baseCharStyle.clone();
                    // All gradients need offset to position correctly within split text
                    charStyle._gradientOffset = { x: -xOffset, y: -yOffset };
                    // Local gradients also need full text bounds for proper scaling
                    if (hasLocalGradient)
                    {
                        charStyle._gradientBounds = { width: fullTextWidth, height: fullTextHeight };
                    }
                }

                // if there are existing characters, reuse them
                let char: Text;

                if (existingChars.length > 0)
                {
                    char = existingChars.shift();

                    char.text = segment.char;
                    char.style = charStyle;
                    char.setFromMatrix(Matrix.IDENTITY);
                    char.x = xOffset - currentWordContainer.x + trimOffsetX - (dropShadowDistance * charIndex);
                }
                else
                {
                    char = new Text({
                        text: segment.char,
                        style: charStyle,
                        x: xOffset - currentWordContainer.x + trimOffsetX - (dropShadowDistance * charIndex),
                    });
                }

                chars.push(char);
                currentWordContainer.addChild(char);
                xOffset += segment.metric.width + textStyle.letterSpacing - strokeWidth;
            }
        });

        // Add the last word container of the line if it has children
        if (currentWordContainer.children.length > 0)
        {
            wordContainers.push(currentWordContainer);
            lineContainer.addChild(currentWordContainer);
        }

        yOffset += measuredText.lineHeight;
    });

    return { chars, lines: lineContainers, words: wordContainers };
}
