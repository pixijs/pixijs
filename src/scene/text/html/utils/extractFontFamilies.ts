/**
 * Extracts font families from text
 * @param  text - The text to extract font families from
 * @param  fontFamily - The default font family
 * @returns {string[]} - The font families
 */
export function extractFontFamilies(text: string, fontFamily: string): string[]
{
    // first ensure fonts are loaded inline..
    // find any font..
    const regex = /font-family:([^;"\s]+)/g;

    const matches = text.match(regex);

    const fontFamilies = [fontFamily as string];

    const dedupe: Record<string, boolean> = {};

    dedupe[fontFamily] = true;

    if (matches)
    {
        matches.forEach((match) =>
        {
            const fontFamily = match.split(':')[1].trim();

            if (!dedupe[fontFamily])
            {
                fontFamilies.push(fontFamily);

                dedupe[fontFamily] = true;
            }
        });
    }

    return fontFamilies;
}
