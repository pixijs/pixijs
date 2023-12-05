import { Cache } from '../../../assets/cache/Cache';
import { FontStylePromiseCache, HTMLTextSystem } from '../HTMLTextSystem';
import { loadFontCSS } from './loadFontCSS';

import type { HTMLTextStyle } from '../HtmlTextStyle';

/**
 * takes the font families and returns a css string that can be injected into a style tag
 * It will contain the font families and the font urls encoded as base64
 * @param fontFamilies - The font families to load
 * @param style - The style to load the font with (used for the first font family)
 * @returns - The css string
 */
export async function getFontCss(fontFamilies: string[], style: HTMLTextStyle)
{
    const fontPromises = fontFamilies
        .filter((fontFamily) => Cache.has(fontFamily))
        .map((fontFamily, i) =>
        {
            if (!FontStylePromiseCache.has(fontFamily))
            {
                const { url } = Cache.get(fontFamily);

                if (i === 0)
                {
                    FontStylePromiseCache.set(fontFamily, loadFontCSS(style, url));
                }

                else
                {
                    FontStylePromiseCache.set(fontFamily, loadFontCSS({
                        ...HTMLTextSystem.defaultFontOptions,
                        fontFamily,
                    }, url));
                }
            }

            return FontStylePromiseCache.get(fontFamily);
        });

    return (await Promise.all(fontPromises)).join('\n');
}
