/**
 * Ponyfill for IE because it doesn't support `codePointAt`
 * @param str
 * @private
 */
export function extractCharCode(str: string): number
{
    return str.codePointAt ? str.codePointAt(0) : str.charCodeAt(0);
}
