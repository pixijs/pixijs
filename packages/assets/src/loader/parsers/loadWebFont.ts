import { extensions, ExtensionType, settings, utils } from '@pixi/core';
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
 * Loader plugin for handling web fonts
 * @memberof PIXI
 */
export type LoadFontData = {
    family: string;
    display: string;
    featureSettings: string;
    stretch: string;
    style: string;
    unicodeRange: string;
    variant: string;
    weights: string[];
};

/**
 * RegExp for matching CSS <ident-token>. It doesn't consider escape and non-ASCII characters, but enough for us.
 * @see {@link https://www.w3.org/TR/css-syntax-3/#ident-token-diagram}
 */
const CSS_IDENT_TOKEN_REGEX = /^(--|-?[A-Z_])[0-9A-Z_-]*$/i;

/**
 * Return font face name from a file name
 * Ex.: 'fonts/tital-one.woff' turns into 'Titan One'
 * @param url - File url
 */
export function getFontFamilyName(url: string): string
{
    const ext = utils.path.extname(url);
    const name = utils.path.basename(url, ext);

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

/** Web font loader plugin */
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
        const fonts = settings.ADAPTER.getFontFaceSet();

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

            return fontFaces.length === 1 ? fontFaces[0] : fontFaces;
        }

        if (process.env.DEBUG)
        {
            console.warn('[loadWebFont] FontFace API is not supported. Skipping loading font');
        }

        return null;
    },

    unload(font: FontFace | FontFace[]): void
    {
        (Array.isArray(font) ? font : [font])
            .forEach((t) => settings.ADAPTER.getFontFaceSet().delete(t));
    }
} as LoaderParser<FontFace | FontFace[]>;

extensions.add(loadWebFont);
