import { DOMAdapter } from '../../../environment/adapter';
import { ExtensionType } from '../../../extensions/Extensions';
import { warn } from '../../../utils/logging/warn';
import { path } from '../../../utils/path';
import { Cache } from '../../cache/Cache';
import { checkDataUrl } from '../../utils/checkDataUrl';
import { checkExtension } from '../../utils/checkExtension';
import { LoaderParserPriority } from './LoaderParser';

import type { ResolvedAsset } from '../../types';
import type { LoaderParser } from './LoaderParser';

const validWeights = [
    'normal', 'bold',
    '100', '200', '300', '400', '500', '600', '700', '800', '900',
];
const validFontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
const validFontMIMEs = [
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
];

/**
 * Data for loading a font
 * @memberof assets
 */
export type LoadFontData = {
    /** Font family name */
    family: string;
    /** A set of optional descriptors passed as an object. It can contain any of the descriptors available for @font-face: */
    display: string;
    /**
     * The featureSettings property of the FontFace interface retrieves or sets infrequently used
     * font features that are not available from a font's variant properties.
     */
    featureSettings: string;
    /** The stretch property of the FontFace interface retrieves or sets how the font stretches. */
    stretch: string;
    /** The style property of the FontFace interface retrieves or sets the font's style. */
    style: string;
    /**
     * The unicodeRange property of the FontFace interface retrieves or sets the range of
     * unicode code points encompassing the font.
     */
    unicodeRange: string;
    /** The variant property of the FontFace interface programmatically retrieves or sets font variant values. */
    variant: string;
    /** The weight property of the FontFace interface retrieves or sets the weight of the font. */
    weights: string[];
};

/**
 * RegExp for matching CSS <ident-token>. It doesn't consider escape and non-ASCII characters, but enough for us.
 * @see {@link https://www.w3.org/TR/css-syntax-3/#ident-token-diagram}
 */
const CSS_IDENT_TOKEN_REGEX = /^(--|-?[A-Z_])[0-9A-Z_-]*$/i;

/**
 * Return font face name from a file name
 * Ex.: 'fonts/titan-one.woff' turns into 'Titan One'
 * @param url - File url
 * @memberof assets
 */
export function getFontFamilyName(url: string): string
{
    const ext = path.extname(url);
    const name = path.basename(url, ext);

    // Replace dashes by white spaces
    const nameWithSpaces = name.replace(/(-|_)/g, ' ');

    // Upper case first character of each word
    const nameTokens = nameWithSpaces.toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    let valid = nameTokens.length > 0;

    for (const token of nameTokens)
    {
        if (!token.match(CSS_IDENT_TOKEN_REGEX))
        {
            valid = false;
            break;
        }
    }

    let fontFamilyName = nameTokens.join(' ');

    if (!valid)
    {
        fontFamilyName = `"${fontFamilyName.replace(/[\\"]/g, '\\$&')}"`;
    }

    return fontFamilyName;
}

// See RFC 3986 Chapter 2. Characters
const validURICharactersRegex = /^[0-9A-Za-z%:/?#\[\]@!\$&'()\*\+,;=\-._~]*$/;

/**
 * Encode URI only when it contains invalid characters.
 * @param uri - URI to encode.
 */
function encodeURIWhenNeeded(uri: string)
{
    if (validURICharactersRegex.test(uri))
    {
        return uri;
    }

    return encodeURI(uri);
}

/**
 * A loader plugin for handling web fonts
 * @example
 * import { Assets } from 'pixi.js';
 *
 * Assets.load({
 *   alias: 'font',
 *   src: 'fonts/titan-one.woff',
 *   data: {
 *     family: 'Titan One',
 *     weights: ['normal', 'bold'],
 *   }
 * })
 * @memberof assets
 */
export const loadWebFont = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    name: 'loadWebFont',

    test(url: string): boolean
    {
        return checkDataUrl(url, validFontMIMEs) || checkExtension(url, validFontExtensions);
    },

    async load(url: string, options?: ResolvedAsset<LoadFontData>): Promise<FontFace | FontFace[]>
    {
        const fonts = DOMAdapter.get().getFontFaceSet();

        if (fonts)
        {
            const fontFaces: FontFace[] = [];
            const name = options.data?.family ?? getFontFamilyName(url);
            const weights = options.data?.weights?.filter((weight) => validWeights.includes(weight)) ?? ['normal'];
            const data = options.data ?? {};

            for (let i = 0; i < weights.length; i++)
            {
                const weight = weights[i];

                const font = new FontFace(name, `url(${encodeURIWhenNeeded(url)})`, {
                    ...data,
                    weight,
                });

                await font.load();

                fonts.add(font);

                fontFaces.push(font);
            }

            Cache.set(`${name}-and-url`, {
                url,
                fontFaces,
            });

            return fontFaces.length === 1 ? fontFaces[0] : fontFaces;
        }

        // #if _DEBUG
        warn('[loadWebFont] FontFace API is not supported. Skipping loading font');
        // #endif

        return null;
    },

    unload(font: FontFace | FontFace[]): void
    {
        (Array.isArray(font) ? font : [font])
            .forEach((t) =>
            {
                Cache.remove(`${t.family}-and-url`);
                DOMAdapter.get().getFontFaceSet().delete(t);
            });
    }
} satisfies LoaderParser<FontFace | FontFace[]>;
