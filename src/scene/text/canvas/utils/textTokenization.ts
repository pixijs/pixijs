import type { TextStyleWhiteSpace } from '../../TextStyle';

/**
 * Cache of new line character codes.
 * @internal
 */
export const NEWLINES: number[] = [
    0x000A, // line feed
    0x000D, // carriage return
];

/**
 * Set of new line character codes for fast lookup.
 * @internal
 */
export const NEWLINES_SET = new Set(NEWLINES);

/**
 * Cache of breaking space character codes.
 * @internal
 */
export const BREAKING_SPACES: number[] = [
    0x0009, // character tabulation
    0x0020, // space
    0x2000, // en quad
    0x2001, // em quad
    0x2002, // en space
    0x2003, // em space
    0x2004, // three-per-em space
    0x2005, // four-per-em space
    0x2006, // six-per-em space
    0x2008, // punctuation space
    0x2009, // thin space
    0x200A, // hair space
    0x205F, // medium mathematical space
    0x3000, // ideographic space
];

/**
 * Set of breaking space character codes for fast lookup.
 * @internal
 */
export const BREAKING_SPACES_SET = new Set(BREAKING_SPACES);

/**
 * Regex to split text while capturing newline sequences.
 * @internal
 */
export const NEWLINE_SPLIT_REGEX = /(\r\n|\r|\n)/;

/**
 * Regex to split text on newlines without capturing.
 * @internal
 */
export const NEWLINE_MATCH_REGEX = /(?:\r\n|\r|\n)/;

/**
 * Determines if char is a newline.
 * @param char - The character
 * @returns True if newline, False otherwise.
 * @internal
 */
export function isNewline(char: string): boolean
{
    if (typeof char !== 'string')
    {
        return false;
    }

    return NEWLINES_SET.has(char.charCodeAt(0));
}

/**
 * Determines if char is a breaking whitespace.
 *
 * It allows one to determine whether char should be a breaking whitespace
 * For example certain characters in CJK langs or numbers.
 * It must return a boolean.
 * @param char - The character
 * @param _nextChar - The next character (unused, for override compatibility)
 * @returns True if whitespace, False otherwise.
 * @internal
 */
export function isBreakingSpace(char: string, _nextChar?: string): boolean
{
    if (typeof char !== 'string')
    {
        return false;
    }

    return BREAKING_SPACES_SET.has(char.charCodeAt(0));
}

/**
 * Determines whether we should collapse breaking spaces.
 * @param whiteSpace - The TextStyle property whiteSpace
 * @returns Should collapse
 * @internal
 */
export function collapseSpaces(whiteSpace: TextStyleWhiteSpace): boolean
{
    return (whiteSpace === 'normal' || whiteSpace === 'pre-line');
}

/**
 * Determines whether we should collapse newLine chars.
 * @param whiteSpace - The white space
 * @returns should collapse
 * @internal
 */
export function collapseNewlines(whiteSpace: TextStyleWhiteSpace): boolean
{
    return (whiteSpace === 'normal');
}

/**
 * Trims breaking whitespaces from the right side of a string.
 * @param text - The text
 * @returns Trimmed string
 * @internal
 */
export function trimRight(text: string): string
{
    if (typeof text !== 'string')
    {
        return '';
    }

    let i = text.length - 1;

    while (i >= 0 && isBreakingSpace(text[i]))
    {
        i--;
    }

    // Only slice if we found trailing spaces
    return i < text.length - 1 ? text.slice(0, i + 1) : text;
}

/**
 * Splits a string into words, breaking-spaces and newLine characters
 * @param text - The text
 * @returns A tokenized array
 * @internal
 */
export function tokenize(text: string): string[]
{
    const tokens: string[] = [];
    const tokenChars: string[] = [];

    if (typeof text !== 'string')
    {
        return tokens;
    }

    for (let i = 0; i < text.length; i++)
    {
        const char = text[i];
        const nextChar = text[i + 1];

        if (isBreakingSpace(char, nextChar) || isNewline(char))
        {
            if (tokenChars.length > 0)
            {
                tokens.push(tokenChars.join(''));
                tokenChars.length = 0;
            }

            // treat \r\n as a single new line token
            if (char === '\r' && nextChar === '\n')
            {
                tokens.push('\r\n');
                i++;
            }
            else
            {
                tokens.push(char);
            }

            continue;
        }

        tokenChars.push(char);
    }

    if (tokenChars.length > 0)
    {
        tokens.push(tokenChars.join(''));
    }

    return tokens;
}

/**
 * Splits a token into character groups that should not be broken apart.
 * Adjacent characters that can't be broken are combined into single groups.
 * @param token - The token to split
 * @param breakWords - Whether word breaking is enabled
 * @param splitFn - Function to split token into characters (default: grapheme segmenter)
 * @param canBreakCharsFn - Function to check if chars can be broken
 * @returns Array of character groups
 * @internal
 */
export function getCharacterGroups(
    token: string,
    breakWords: boolean,
    splitFn: (s: string) => string[],
    canBreakCharsFn: (char: string, nextChar: string, token: string, index: number, breakWords: boolean) => boolean,
): string[]
{
    const characters = splitFn(token);
    const groups: string[] = [];

    for (let j = 0; j < characters.length; j++)
    {
        let char = characters[j];
        let lastChar = char;

        // Combine chars that shouldn't be split
        let k = 1;

        while (characters[j + k])
        {
            const nextChar = characters[j + k];

            if (!canBreakCharsFn(lastChar, nextChar, token, j, breakWords))
            {
                char += nextChar;
                lastChar = nextChar;
                k++;
            }
            else
            {
                break;
            }
        }
        j += k - 1;
        groups.push(char);
    }

    return groups;
}
