import { Container } from '../../container/Container';
import { CanvasTextMetrics } from '../../text/canvas/CanvasTextMetrics';
import { TextStyle } from '../../text/TextStyle';
import {
    type InstancedTextSplitConfig,
    type RawTextSplitConfig,
    splitText,
    type TextSplitOutput,
    type TextSplitResult,
} from '../../text/utils/text-split/sharedTextSplit';
import { BitmapFontManager } from '../BitmapFontManager';
import { BitmapText } from '../BitmapText';
import { getBitmapTextLayout } from './getBitmapTextLayout';

/**
 * Splits a Text object into segments based on the text's layout and style,
 * and adds these segments as individual Text objects to a specified container.
 *
 * This function handles word wrapping, alignment, and letter spacing,
 * ensuring that each segment is rendered correctly according to the original text's style.
 * @param options - Configuration options for the text split operation.
 * @param TextClass - The Text class to use for creating split text instances.
 * @returns An array of Text objects representing the split segments.
 * @internal
 */
export function bitmapTextSplit(options: RawTextSplitConfig, TextClass: typeof BitmapText): TextSplitOutput<BitmapText>
{
    const { string, style, anchor } = options as RawTextSplitConfig;
    const textStyle = new TextStyle(style);
    const font = BitmapFontManager.getFont(string, textStyle);

    const segments = CanvasTextMetrics.graphemeSegmenter(string);
    const layout = getBitmapTextLayout(segments, textStyle, font, true);
    const scale = layout.scale;
    const chars: BitmapText[] = [];
    const words: Container[] = [];
    const lines: Container[] = [];
    // Normalize anchor to { x, y } object
    const normalizedAnchor = typeof anchor === 'number' ? { x: anchor, y: anchor } : { x: anchor!.x, y: anchor!.y };

    let yOffset = 0;

    for (const line of layout.lines)
    {
        // if the line is empty, skip it
        if (line.chars.length === 0) continue;

        const lineContainer = new Container({ label: 'line' });

        lineContainer.y = yOffset;
        lines.push(lineContainer);

        let currentWordContainer = new Container({ label: 'word' });
        let currentWordStartIndex = 0;

        for (let i = 0; i < line.chars.length; i++)
        {
            const char = line.chars[i];

            if (!char) continue;

            const charData = font.chars[char];

            if (!charData) continue;

            const isSpace = char === ' ';
            const isLastChar = i === line.chars.length - 1;

            // Create sprite for the character
            const bitmapText = new TextClass({
                text: char,
                style: textStyle,
                label: `char-${char}`,
                x: (line.charPositions[i]! * scale) - (line.charPositions[currentWordStartIndex]! * scale)
            });

            // Handle anchoring
            if (normalizedAnchor)
            {
                bitmapText.anchor.set(normalizedAnchor.x, normalizedAnchor.y);
                bitmapText.x += bitmapText.width * normalizedAnchor.x;
                bitmapText.y += bitmapText.height * normalizedAnchor.y;
            }

            if (!isSpace)
            {
                chars.push(bitmapText);
                // Add to word container
                currentWordContainer.addChild(bitmapText);
            }

            // Handle word breaks
            if (isSpace || isLastChar)
            {
                if (currentWordContainer.children.length > 0)
                {
                    currentWordContainer.x = line.charPositions[currentWordStartIndex]! * scale;
                    words.push(currentWordContainer);
                    lineContainer.addChild(currentWordContainer);

                    // Start new word container
                    currentWordContainer = new Container({ label: 'word' });
                    currentWordStartIndex = i + 1;
                }
            }
        }

        yOffset += font.lineHeight * scale;
    }

    return { chars, lines, words };
}

// eslint-disable-next-line func-names
BitmapText.split = function (
    this: typeof BitmapText,
    text: BitmapText | InstancedTextSplitConfig<BitmapText> | RawTextSplitConfig,
): TextSplitResult<BitmapText>
{
    const res = splitText<BitmapText, typeof this>(text, this, bitmapTextSplit);

    return res;
};
