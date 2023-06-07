import type { TextStyle } from '../../TextStyle';

const genericFontFamilies = [
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
];

/**
 * Generates a font style string to use for `TextMetrics.measureFont()`.
 * @param style
 * @returns Font style string, for passing to `TextMetrics.measureFont()`
 */
export function fontStringFromTextStyle(style: TextStyle): string
{
    // build canvas api font setting from individual components. Convert a numeric style.fontSize to px
    const fontSizeString = (typeof style.fontSize === 'number') ? `${style.fontSize}px` : style.fontSize;

    // Clean-up fontFamily property by quoting each font name
    // this will support font names with spaces
    let fontFamilies: string | string[] = style.fontFamily;

    if (!Array.isArray(style.fontFamily))
    {
        fontFamilies = style.fontFamily.split(',');
    }

    for (let i = fontFamilies.length - 1; i >= 0; i--)
    {
        // Trim any extra white-space
        let fontFamily = fontFamilies[i].trim();

        // Check if font already contains strings
        if (!(/([\"\'])[^\'\"]+\1/).test(fontFamily) && !genericFontFamilies.includes(fontFamily))
        {
            fontFamily = `"${fontFamily}"`;
        }
        (fontFamilies as string[])[i] = fontFamily;
    }

    // eslint-disable-next-line max-len
    return `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${fontSizeString} ${(fontFamilies as string[]).join(',')}`;
}
