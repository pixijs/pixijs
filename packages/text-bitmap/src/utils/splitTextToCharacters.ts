/**
 * Ponyfill for IE because it doesn't support `Array.from`
 * @param text
 * @private
 */
export function splitTextToCharacters(text: string): string[]
{
    return Array.from ? Array.from(text) : text.split('');
}
