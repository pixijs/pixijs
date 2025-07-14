import { loadFontAsBase64 } from './loadFontAsBase64';

/**
 * Options for the font CSS style
 * @category text
 * @internal
 */
export interface FontCSSStyleOptions
{
    /**
     * The font family to use in the CSS
     * @example
     * 'Arial' or ['Arial', 'Helvetica']
     */
    fontFamily: string | string[]
    /**
     * The font weight to use in the CSS
     * @example
     * 'normal', 'bold', '100', '200', etc.
     */
    fontWeight: string
    /**
     * The font style to use in the CSS
     * @example
     * 'normal', 'italic', 'oblique'
     */
    fontStyle: string
}

/**
 * This will take a font url and a style and return a css string that can be injected into a style tag
 * This will contain inlined base64 font and the font family information
 * @param style - the style to generate the css for
 * @param url - The url to load the font from
 * @returns - The css string
 * @internal
 */
export async function loadFontCSS(style: FontCSSStyleOptions, url: string): Promise<string>
{
    const dataSrc = await loadFontAsBase64(url);

    return `@font-face {
        font-family: "${style.fontFamily}";
        src: url('${dataSrc}');
        font-weight: ${style.fontWeight};
        font-style: ${style.fontStyle};
    }`;
}
