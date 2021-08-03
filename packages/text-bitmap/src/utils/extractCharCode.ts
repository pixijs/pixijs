export function extractCharCode(str: string): number
{
    return str.codePointAt ? str.codePointAt(0) : str.charCodeAt(0);
}
