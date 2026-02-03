import { Cache } from '../../../assets/cache/Cache';
import { type FontFaceCache } from '../../../assets/loader/parsers/loadWebFont';
import { loadFontCSS } from './loadFontCSS';

/** @internal */
export const FontStylePromiseCache = new Map<string, Promise<string>>();

/**
 * takes the font families and returns a css string that can be injected into a style tag
 * It will contain the font families and the font urls encoded as base64
 * @param fontFamilies - The font families to load
 * @returns - The css string
 * @internal
 */
export async function getFontCss(
    fontFamilies: string[],
)
{
    const fontPromises = fontFamilies
        .filter((fontFamily) => Cache.has(`${fontFamily}-and-url`))
        .map((fontFamily) =>
        {
            if (!FontStylePromiseCache.has(fontFamily))
            {
                const { entries } = Cache.get<FontFaceCache>(`${fontFamily}-and-url`);
                const promises: Promise<string>[] = [];

                entries.forEach((entry) =>
                {
                    const url = entry.url;
                    const faces = entry.faces;

                    const out = faces.map((face) => ({ weight: face.weight, style: face.style }));

                    // load each out font with the correct style
                    promises.push(
                        ...out.map((style) =>
                            loadFontCSS(
                                {
                                    fontWeight: style.weight,
                                    fontStyle: style.style,
                                    fontFamily,
                                },
                                url,
                            ),
                        ),
                    );
                });
                FontStylePromiseCache.set(
                    fontFamily,
                    Promise.all(promises).then((css) => css.join('\n')),
                );
            }

            return FontStylePromiseCache.get(fontFamily);
        });

    return (await Promise.all(fontPromises)).join('\n');
}
