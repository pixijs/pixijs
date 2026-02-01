import {
    collapseNewlines,
    collapseSpaces,
    getCharacterGroups,
    isBreakingSpace,
    isNewline,
    tokenize,
    trimRight,
} from './textTokenization';

import type { ICanvas, ICanvasRenderingContext2DSettings } from '../../../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';
import type { TextStyle } from '../../TextStyle';
import type { CanBreakCharsFn, MeasureTextFn, WordWrapSplitFn } from './types';

type CharacterWidthCache = Record<string, number>;
/**
 * Function type for checking if words can be broken.
 * @internal
 */
type CanBreakWordsFn = (token: string, breakWords: boolean) => boolean;

// Default settings used for all getContext calls
const contextSettings: ICanvasRenderingContext2DSettings = {
    // TextMetrics requires getImageData readback for measuring fonts.
    willReadFrequently: true,
};

/**
 * Gets & sets the widths of calculated characters in a cache object
 * @param key - The key
 * @param letterSpacing - The letter spacing
 * @param cache - The cache
 * @param context - The canvas context
 * @param measureTextFn - Function to measure text
 * @returns The cached or measured width.
 * @internal
 */
function getFromCache(
    key: string,
    letterSpacing: number,
    cache: CharacterWidthCache,
    context: ICanvasRenderingContext2D,
    measureTextFn: MeasureTextFn,
): number
{
    let width = cache[key];

    if (typeof width !== 'number')
    {
        width = measureTextFn(key, letterSpacing, context) + letterSpacing;
        cache[key] = width;
    }

    return width;
}

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 * @param text - String to apply word wrapping to
 * @param style - the style to use when wrapping
 * @param canvas - specification of the canvas to use for measuring.
 * @param measureTextFn - Function to measure text width
 * @param canBreakWordsFn - Function to check if words can be broken
 * @param canBreakCharsFn - Function to check if characters can be broken
 * @param wordWrapSplitFn - Function to split words into characters
 * @returns New string with new lines applied where required
 * @internal
 */
export function wordWrap(
    text: string,
    style: TextStyle,
    canvas: ICanvas,
    measureTextFn: MeasureTextFn,
    canBreakWordsFn: CanBreakWordsFn,
    canBreakCharsFn: CanBreakCharsFn,
    wordWrapSplitFn: WordWrapSplitFn,
): string
{
    const context = canvas.getContext('2d', contextSettings);

    context.font = style._fontString;

    let width = 0;
    let line = '';
    const linesArray: string[] = [];

    const cache: CharacterWidthCache = Object.create(null);
    const { letterSpacing, whiteSpace } = style;

    // How to handle whitespaces
    const shouldCollapseSpaces = collapseSpaces(whiteSpace);
    const shouldCollapseNewlines = collapseNewlines(whiteSpace);

    // whether or not spaces may be added to the beginning of lines
    let canPrependSpaces = !shouldCollapseSpaces;

    // There is letterSpacing after every char except the last one
    // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!
    // so for convenience the above needs to be compared to width + 1 extra letterSpace
    // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!_
    // ________________________________________________
    // And then the final space is simply no appended to each line
    const wordWrapWidth = style.wordWrapWidth + letterSpacing;

    // break text into words, spaces and newline chars
    const tokens = tokenize(text);

    for (let i = 0; i < tokens.length; i++)
    {
        // get the word, space or newlineChar
        let token = tokens[i];

        // if word is a new line
        if (isNewline(token))
        {
            // keep the new line
            if (!shouldCollapseNewlines)
            {
                linesArray.push(trimRight(line));
                canPrependSpaces = !shouldCollapseSpaces;
                line = '';
                width = 0;
                continue;
            }

            // if we should collapse new lines
            // we simply convert it into a space
            token = ' ';
        }

        // if we should collapse repeated whitespaces
        if (shouldCollapseSpaces)
        {
            // check both this and the last tokens for spaces
            const currIsBreakingSpace = isBreakingSpace(token);
            const lastIsBreakingSpace = isBreakingSpace(line[line.length - 1]);

            if (currIsBreakingSpace && lastIsBreakingSpace)
            {
                continue;
            }
        }

        // get word width from cache if possible
        const tokenWidth = getFromCache(token, letterSpacing, cache, context, measureTextFn);

        // word is longer than desired bounds
        if (tokenWidth > wordWrapWidth)
        {
            // if we are not already at the beginning of a line
            if (line !== '')
            {
                // start newlines for overflow words
                linesArray.push(trimRight(line));
                line = '';
                width = 0;
            }

            // break large word over multiple lines
            if (canBreakWordsFn(token, style.breakWords))
            {
                // break word into character groups that shouldn't be split
                const charGroups = getCharacterGroups(token, style.breakWords, wordWrapSplitFn, canBreakCharsFn);

                // loop the character groups
                for (const char of charGroups)
                {
                    const characterWidth = getFromCache(char, letterSpacing, cache, context, measureTextFn);

                    if (characterWidth + width > wordWrapWidth)
                    {
                        linesArray.push(trimRight(line));
                        canPrependSpaces = false;
                        line = '';
                        width = 0;
                    }

                    line += char;
                    width += characterWidth;
                }
            }

            // run word out of the bounds
            else
            {
                // if there are words in this line already
                // finish that line and start a new one
                if (line.length > 0)
                {
                    linesArray.push(trimRight(line));
                    line = '';
                    width = 0;
                }

                // give it its own line
                linesArray.push(trimRight(token));
                canPrependSpaces = false;
                line = '';
                width = 0;
            }
        }

        // word could fit
        else
        {
            // word won't fit because of existing words
            // start a new line
            if (tokenWidth + width > wordWrapWidth)
            {
                // if its a space we don't want it
                canPrependSpaces = false;

                // add a new line
                linesArray.push(trimRight(line));

                // start a new line
                line = '';
                width = 0;
            }

            // don't add spaces to the beginning of lines
            if (line.length > 0 || !isBreakingSpace(token) || canPrependSpaces)
            {
                // add the word to the current line
                line += token;

                // update width counter
                width += tokenWidth;
            }
        }
    }

    const trimmedLine = trimRight(line);

    if (trimmedLine.length > 0)
    {
        linesArray.push(trimmedLine);
    }

    return linesArray.join('\n');
}
