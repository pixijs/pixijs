import { Container } from '../../../../scene/container/Container';
import { type ConvertedStrokeStyle } from '../../../../scene/graphics/shared/FillTypes';
import { CanvasTextMetrics } from '../../canvas/CanvasTextMetrics';
import { Text } from '../../Text';
import { TextStyle } from '../../TextStyle';
import {
    type InstancedTextSplitConfig,
    type RawTextSplitConfig,
    splitText,
    type TextSplitOutput,
    type TextSplitResult
} from './sharedTextSplit';

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
 * @param TextClass - The Text class to use for creating split text instances.
 * @returns An array of Text objects representing the split segments.
 * @internal
 */
export function canvasTextSplit(options: RawTextSplitConfig, TextClass: typeof Text): TextSplitOutput<Text>
{
    const { string, style, anchor } = options;
    const textStyle = new TextStyle(style);

    // measure the entire text to get the layout
    const measuredText = CanvasTextMetrics.measureText(string, textStyle);
    // split the text into segments
    const segments = CanvasTextMetrics.graphemeSegmenter(string);
    // now group the segments into lines based on measured lines
    const groupedSegments: GroupedSegment[] = groupTextSegments(segments, measuredText, textStyle);

    const alignment = textStyle.align;
    const largestLine = measuredText.lineWidths.reduce((max, line) => Math.max(max, line), 0);

    // now create Text objects for each segment and add them to the container
    const chars: Text[] = [];
    const lineContainers: Container[] = [];
    const wordContainers: Container[] = [];
    let yOffset = 0;
    const strokeWidth = (textStyle.stroke as ConvertedStrokeStyle)?.width || 0;
    const dropShadowDistance = textStyle.dropShadow?.distance || 0;

    // Normalize anchor to { x, y } object
    const normalizedAnchor = typeof anchor === 'number' ? { x: anchor, y: anchor } : { x: anchor.x, y: anchor.y };

    groupedSegments.forEach((group, i) =>
    {
        const lineContainer = new Container({ label: `line-${i}` });

        lineContainer.y = yOffset;
        lineContainers.push(lineContainer);

        const lineWidth = measuredText.lineWidths[i];
        let xOffset = getAlignmentOffset(alignment, lineWidth, largestLine);

        let currentWordContainer = new Container({ label: 'word' });

        currentWordContainer.x = xOffset;

        group.chars.forEach((segment, i) =>
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
                currentWordContainer.x = xOffset;
            }
            else
            {
                const newText = new TextClass({
                    text: segment.char,
                    style: textStyle,
                    x: xOffset - currentWordContainer.x - (dropShadowDistance * i),
                });

                if (normalizedAnchor)
                {
                    newText.anchor.set(normalizedAnchor.x, normalizedAnchor.y);
                    // Adjust position to compensate for anchor change
                    newText.x += newText.width * normalizedAnchor.x;
                    newText.y += newText.height * normalizedAnchor.y;
                }

                chars.push(newText);
                currentWordContainer.addChild(newText);
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

// eslint-disable-next-line func-names
Text.split = function (
    this: typeof Text,
    text: Text | InstancedTextSplitConfig<Text> | RawTextSplitConfig,
): TextSplitResult<Text>
{
    return splitText(text, this, canvasTextSplit);
};
