import {
    collapseNewlines,
    collapseSpaces,
    isBreakAfterChar,
    isBreakingSpace,
    isCollapsibleSpace,
} from '../../text/canvas/utils/textTokenization';

import type { TextStyle } from '../../text/TextStyle';
import type { AbstractBitmapFont } from '../AbstractBitmapFont';

/**
 * The layout data for a bitmap text.
 * This contains the width, height, scale, offsetY and lines of text.
 * Each line contains its width, character positions, characters, space width and spaces index.
 * @category text
 * @internal
 */
export interface BitmapTextLayoutData
{
    width: number;
    height: number;
    scale: number;
    offsetY: number;
    lines: {
        width: number
        charPositions: number[],
        chars: string[],
        // / spaces: number
        spaceWidth: number
        spacesIndex: number[]
    }[];
}

/**
 * @param chars
 * @param style
 * @param font
 * @param trimEnd
 * @internal
 */
export function getBitmapTextLayout(
    chars: string[],
    style: TextStyle,
    font: AbstractBitmapFont<any>,
    trimEnd: boolean
): BitmapTextLayoutData
{
    const layoutData: BitmapTextLayoutData = {
        width: 0,
        height: 0,
        offsetY: 0,
        scale: style.fontSize / font.baseMeasurementFontSize,
        lines: [{
            width: 0,
            charPositions: [] as number[],
            spaceWidth: 0,
            spacesIndex: [],
            chars: [],
        }]
    };

    layoutData.offsetY = font.baseLineOffset;

    let currentLine = layoutData.lines[0];

    let previousChar: string = null;
    let firstWord = true;
    //    let spaceCount = 0;

    const currentWord = {
        spaceWord: false,
        width: 0,
        start: 0,
        index: 0, // use index to not modify the array as we use it a lot!
        positions: [] as number[],
        chars: [] as string[],
    };

    const scale = font.baseMeasurementFontSize / style.fontSize;

    const adjustedLetterSpacing = style.letterSpacing * scale;
    const adjustedWordWrapWidth = style.wordWrapWidth * scale;
    const adjustedLineHeight = style.lineHeight ? style.lineHeight * scale : font.lineHeight;

    const breakWords = style.wordWrap && style.breakWords;

    const shouldCollapseSpaces = collapseSpaces(style.whiteSpace);
    const shouldCollapseNewlines = collapseNewlines(style.whiteSpace);

    if (shouldCollapseSpaces || shouldCollapseNewlines)
    {
        const processed: string[] = [];
        let prevWasBreakingSpace = shouldCollapseSpaces;

        for (let c = 0; c < chars.length; c++)
        {
            let char = chars[c];

            if (char === '\r' || char === '\n')
            {
                if (shouldCollapseNewlines)
                {
                    if (char === '\r' && chars[c + 1] === '\n') c++;
                    char = ' ';
                }
                else
                {
                    if (shouldCollapseSpaces) prevWasBreakingSpace = true;
                    processed.push(char);
                    continue;
                }
            }

            if (isBreakingSpace(char))
            {
                if (shouldCollapseSpaces && isCollapsibleSpace(char))
                {
                    if (prevWasBreakingSpace) continue;
                    prevWasBreakingSpace = true;
                    processed.push(' ');
                }
                else
                {
                    prevWasBreakingSpace = false;
                    processed.push(char);
                }
            }
            else
            {
                prevWasBreakingSpace = false;
                processed.push(char);
            }
        }

        chars = processed;
    }

    const nextWord = (word: typeof currentWord) =>
    {
        const start = currentLine.width;

        for (let j = 0; j < currentWord.index; j++)
        {
            const position = word.positions[j];

            currentLine.chars.push(word.chars[j]);
            currentLine.charPositions.push(position + start);
        }

        currentLine.width += word.width;

        if (currentWord.index > 0 || !shouldCollapseSpaces)
        {
            firstWord = false;
        }

        // reset the word..
        currentWord.width = 0;
        currentWord.index = 0;
        currentWord.chars.length = 0;

        // spaceCount = 0;
    };

    const nextLine = () =>
    {
        let index = currentLine.chars.length - 1;

        if (trimEnd)
        {
            let lastChar = currentLine.chars[index];

            while (isCollapsibleSpace(lastChar))
            {
                currentLine.width -= font.chars[lastChar].xAdvance;
                currentLine.spacesIndex.pop();
                lastChar = currentLine.chars[--index];
            }
        }

        layoutData.width = Math.max(layoutData.width, currentLine.width);

        currentLine = {
            width: 0,
            charPositions: [],
            chars: [],
            spaceWidth: 0,
            spacesIndex: [],
        };

        firstWord = true;
        layoutData.lines.push(currentLine);
        layoutData.height += adjustedLineHeight;
    };

    const checkIsOverflow = (lineWidth: number) =>
        lineWidth - adjustedLetterSpacing > adjustedWordWrapWidth;

    // loop an extra time to force a line break..
    for (let i = 0; i < chars.length + 1; i++)
    {
        let char: string;

        const isEnd = i === chars.length;

        if (!isEnd)
        {
            char = chars[i];
        }

        const charData = font.chars[char];

        const isSpace = (/(?:\s)/).test(char);
        const isWordBreak = isSpace || char === '\r' || char === '\n' || isEnd;

        // spaceCount++;
        // wasSpace = isSpace;

        if (isWordBreak)
        {
            const addWordToNextLine = !firstWord && style.wordWrap && checkIsOverflow(currentLine.width + currentWord.width);

            if (addWordToNextLine)
            {
                nextLine();

                nextWord(currentWord);

                if (!isEnd)
                {
                    currentLine.charPositions.push(0);
                }
            }
            else
            {
                currentWord.start = currentLine.width;

                nextWord(currentWord);

                if (!isEnd)
                {
                    currentLine.charPositions.push(0);
                }
            }

            if (char === '\r' || char === '\n')
            {
                nextLine();
            }
            else if (!isEnd && charData)
            {
                const spaceWidth = charData.xAdvance + (charData.kerning?.[previousChar] || 0) + adjustedLetterSpacing;

                currentLine.width += spaceWidth;

                currentLine.spaceWidth = spaceWidth;
                currentLine.spacesIndex.push(currentLine.charPositions.length);
                currentLine.chars.push(char);
            }
        }
        else if (charData)
        {
            const kerning = charData.kerning?.[previousChar] || 0;

            const nextCharWidth = charData.xAdvance + kerning + adjustedLetterSpacing;

            const wordExceedsWrapWidth = breakWords && checkIsOverflow(currentWord.width + nextCharWidth);

            if (wordExceedsWrapWidth)
            {
                if (!firstWord)
                {
                    nextLine();
                }

                nextWord(currentWord);
                nextLine();
            }

            currentWord.positions[currentWord.index++] = currentWord.width + kerning;
            currentWord.chars.push(char);

            currentWord.width += nextCharWidth;

            if (isBreakAfterChar(char))
            {
                const addWordToNextLine = !firstWord && style.wordWrap
                    && checkIsOverflow(currentLine.width + currentWord.width);

                if (addWordToNextLine)
                {
                    nextLine();
                }

                nextWord(currentWord);
            }
        }

        previousChar = char;
        // lastChar = char;
    }

    nextLine();

    if (style.align === 'center')
    {
        alignCenter(layoutData);
    }
    else if (style.align === 'right')
    {
        alignRight(layoutData);
    }
    else if (style.align === 'justify')
    {
        alignJustify(layoutData);
    }

    return layoutData;
}

function alignCenter(measurementData: BitmapTextLayoutData)
{
    for (let i = 0; i < measurementData.lines.length; i++)
    {
        const line = measurementData.lines[i];
        const offset = ((measurementData.width / 2) - (line.width / 2));

        for (let j = 0; j < line.charPositions.length; j++)
        {
            line.charPositions[j] += offset;
        }
    }
}

function alignRight(measurementData: BitmapTextLayoutData)
{
    for (let i = 0; i < measurementData.lines.length; i++)
    {
        const line = measurementData.lines[i];
        const offset = ((measurementData.width) - (line.width));

        for (let j = 0; j < line.charPositions.length; j++)
        {
            line.charPositions[j] += offset;
        }
    }
}

function alignJustify(measurementData: BitmapTextLayoutData)
{
    const width = measurementData.width;

    // Skip last content line (CSS justify behavior); -2 accounts for trailing empty line
    for (let i = 0; i < measurementData.lines.length - 2; i++)
    {
        const line = measurementData.lines[i];

        let indy = 0;
        let spaceIndex = line.spacesIndex[indy++];

        let offset = 0;

        const totalSpaces = line.spacesIndex.length;

        const newSpaceWidth = (width - line.width) / totalSpaces;

        const spaceWidth = newSpaceWidth;

        for (let j = 0; j < line.charPositions.length; j++)
        {
            if (j === spaceIndex)
            {
                spaceIndex = line.spacesIndex[indy++];

                offset += spaceWidth;
            }

            line.charPositions[j] += offset;
        }
    }
}
