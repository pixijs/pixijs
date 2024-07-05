import { Cache } from '../../../assets/cache/Cache';
import { loadFontCSS } from './loadFontCSS';

import type { FontCSSStyleOptions } from './loadFontCSS';

export const FontStylePromiseCache = new Map<string, Promise<string>>();

/**
 * takes the font families and returns a css string that can be injected into a style tag
 * It will contain the font families and the font urls encoded as base64
 * @param fontFamilies - The font families to load
 * @param style - The FontCSSStyleOptions to load the font with (used for the first font family)
 * @param defaultOptions - The default options to load the font with (used for the rest of the font families)
 * @param defaultOptions.fontWeight - The default font weight
 * @param defaultOptions.fontStyle - The default font style
 * @returns - The css string
 */
export async function getFontCss(
    fontFamilies: string[],
    style: FontCSSStyleOptions,
    defaultOptions: {fontWeight: string, fontStyle: string}
)
{
    const fontPromises = fontFamilies
        .filter((fontFamily) => Cache.has(`${fontFamily}-and-url`))
        .map((fontFamily, i) =>
        {
            if (!FontStylePromiseCache.has(fontFamily))
            {
                const { url } = Cache.get(`${fontFamily}-and-url`);

                if (i === 0)
                {
                    FontStylePromiseCache.set(fontFamily, loadFontCSS({
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle,
                        fontFamily,
                    }, url));
                }

                else
                {
                    FontStylePromiseCache.set(fontFamily, loadFontCSS({
                        fontWeight: defaultOptions.fontWeight,
                        fontStyle: defaultOptions.fontStyle,
                        fontFamily,
                    }, url));
                }
            }

            return FontStylePromiseCache.get(fontFamily);
        });

    return (await Promise.all(fontPromises)).join('\n');
}
