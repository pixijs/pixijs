export function splitTextToCharacters(text: string): string[]
{
    return Array.from ? Array.from(text) : text.split('');
}
