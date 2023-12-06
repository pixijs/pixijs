/**
 * Processes the passed character set data and returns a flattened array of all the characters.
 *
 * Ignored because not directly exposed.
 * @ignore
 * @param {string | string[] | string[][] } chars
 * @returns {string[]} the flattened array of characters
 */

export function resolveCharacters(chars: string | (string | string[])[]): string[]
{
    // Skip unexpected 'empty set' check at end
    if (chars === '')
    {
        return [];
    }

    // Split the chars string into individual characters
    if (typeof chars === 'string')
    {
        chars = [chars];
    }

    // Handle an array of characters+ranges
    const result: string[] = [];

    for (let i = 0, j = chars.length; i < j; i++)
    {
        const item = chars[i];

        // Handle range delimited by start/end chars
        if (Array.isArray(item))
        {
            if (item.length !== 2)
            {
                throw new Error(`[BitmapFont]: Invalid character range length, expecting 2 got ${item.length}.`);
            }
            if (item[0].length === 0 || item[1].length === 0)
            {
                throw new Error('[BitmapFont]: Invalid character delimiter.');
            }

            const startCode = item[0].charCodeAt(0);
            const endCode = item[1].charCodeAt(0);

            if (endCode < startCode)
            {
                throw new Error('[BitmapFont]: Invalid character range.');
            }

            for (let i = startCode, j = endCode; i <= j; i++)
            {
                result.push(String.fromCharCode(i));
            }
        }
        else
        {
            result.push(...Array.from(item));
        }
    }

    if (result.length === 0)
    {
        throw new Error('[BitmapFont]: Empty set when resolving characters.');
    }

    return result;
}
