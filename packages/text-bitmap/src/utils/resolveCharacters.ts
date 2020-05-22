/**
 * Processes the passed character set data and returns a flattened array of all the characters.
 *
 * Ignored because not directly exposed.
 *
 * @ignore
 * @param {string | string[] | string[][] } chars
 * @returns {string[]}
 */
export function resolveCharacters(chars: string | (string | string[])[]): string[]
{
    // Split the chars string into individual characters
    if (typeof chars === 'string')
    {
        chars = chars.split('');
    }
    // Handle an array of characters+ranges
    else if (chars.find((elem) => Array.isArray(elem)))
    {
        const flatChars = [];

        for (let i = 0, j = chars.length; i < j; i++)
        {
            const elem = chars[i];

            // Handle range delimited by start/end chars
            if (Array.isArray(elem))
            {
                if (elem.length !== 2)
                {
                    throw new Error(`[BitmapFont]: Invalid character range length, expecting 2 got ${elem.length}.`);
                }

                const startCode = elem[0].charCodeAt(0);
                const endCode = elem[1].charCodeAt(0);

                if (endCode < startCode)
                {
                    throw new Error('[BitmapFont]: Invalid character range.');
                }

                for (let i = startCode, j = endCode; i <= j; i++)
                {
                    flatChars.push(String.fromCharCode(i));
                }
            }
            // Handle a character set string
            else
            {
                flatChars.push(...elem.split(''));
            }
        }

        if (flatChars.length === 0)
        {
            throw new Error('[BitmapFont]: Empty set when resolving characters.');
        }

        chars = flatChars;
    }

    return chars as string[];
}
