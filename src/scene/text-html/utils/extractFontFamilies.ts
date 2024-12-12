import type { HTMLTextStyle } from '../HTMLTextStyle';

/**
 * Extracts font families from text. It will extract font families from the style, tagStyles and any font families
 * embedded in the text. It should also strip out duplicates as it goes.
 * @param  text - The text to extract font families from
 * @param style - The style to extract font families from
 * @returns {string[]} - The font families as an array of strings
 */
export function extractFontFamilies(text: string, style: HTMLTextStyle): string[]
{
    const fontFamily = style.fontFamily;
    const fontFamilies: string[] = [];
    const dedupe: Record<string, boolean> = {};

    // first ensure fonts are loaded inline..
    // find any font..
    const regex = /font-family:([^;"\s]+)/g;

    const matches = text.match(regex);

    function addFontFamily(fontFamily: string)
    {
        if (!dedupe[fontFamily])
        {
            fontFamilies.push(fontFamily);

            dedupe[fontFamily] = true;
        }
    }

    if (Array.isArray(fontFamily))
    {
        for (let i = 0; i < fontFamily.length; i++)
        {
            addFontFamily(fontFamily[i]);
        }
    }
    else
    {
        addFontFamily(fontFamily);
    }

    if (matches)
    {
        matches.forEach((match) =>
        {
            const fontFamily = match.split(':')[1].trim();

            addFontFamily(fontFamily);
        });
    }

    for (const i in style.tagStyles)
    {
        const fontFamily = style.tagStyles[i].fontFamily;

        addFontFamily(fontFamily as string);
    }

    return fontFamilies;
}
