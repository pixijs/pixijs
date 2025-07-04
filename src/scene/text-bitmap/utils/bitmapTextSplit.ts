import { Container } from '../../container/Container';
import { CanvasTextMetrics } from '../../text/canvas/CanvasTextMetrics';
import { type TextStyle } from '../../text/TextStyle';
import { type SplitOptions } from '../../text-split/SplitText';
import { type TextSplitOutput } from '../../text-split/types';
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
 * @returns An array of Text objects representing the split segments.
 * @internal
 */
export function bitmapTextSplit(
    options: Pick<SplitOptions, 'text' | 'style'> & { chars: BitmapText[] },
): TextSplitOutput<BitmapText>
{
    const { text, style, chars: existingChars } = options;
    const textStyle = style as TextStyle;
    const font = BitmapFontManager.getFont(text, textStyle);

    const segments = CanvasTextMetrics.graphemeSegmenter(text);
    const layout = getBitmapTextLayout(segments, textStyle, font, true);
    const scale = layout.scale;
    const chars: BitmapText[] = [];
    const words: Container[] = [];
    const lines: Container[] = [];

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

            let charInstance: BitmapText;

            if (existingChars.length > 0)
            {
                charInstance = existingChars.shift();
                charInstance.text = char;
                charInstance.style = textStyle;
                charInstance.label = `char-${char}`;
                charInstance.x = (line.charPositions[i]! * scale) - (line.charPositions[currentWordStartIndex]! * scale);
            }
            else
            {
                // Create a new BitmapText instance if no existing one is available
                charInstance = new BitmapText({
                    text: char,
                    style: textStyle,
                    label: `char-${char}`,
                    x: (line.charPositions[i]! * scale) - (line.charPositions[currentWordStartIndex]! * scale),
                });
            }

            if (!isSpace)
            {
                chars.push(charInstance);
                // Add to word container
                currentWordContainer.addChild(charInstance);
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
