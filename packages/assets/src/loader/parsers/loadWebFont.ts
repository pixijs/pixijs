import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { checkDataUrl } from '../../utils/checkDataUrl';
import { checkExtension } from '../../utils/checkExtension';
import { LoaderParserPriority } from './LoaderParser';

import type { LoadAsset } from '../types';
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
    const nameTitleCase = nameWithSpaces.toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return nameTitleCase;
}

/** Web font loader plugin */
export const loadWebFont = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    test(url: string): boolean
    {
        return checkDataUrl(url, validFontMIMEs) || checkExtension(url, validFontExtensions);
    },

    async load(url: string, options?: LoadAsset<LoadFontData>): Promise<FontFace | FontFace[]>
    {
        // Prevent loading font if navigator is not online
        if (!globalThis.navigator.onLine)
        {
            throw new Error('[loadWebFont] Cannot load font - navigator is offline');
        }

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

                const font = new FontFace(name, `url(${url})`, {
                    ...data,
                    weight,
                });

                await font.load();

                fonts.add(font);

                fontFaces.push(font);
            }

            return fontFaces.length === 1 ? fontFaces[0] : fontFaces;
        }

        // #if _DEBUG
        console.warn('[loadWebFont] FontFace API is not supported. Skipping loading font');
        // #endif

        return null;
    },

    unload(font: FontFace | FontFace[]): void
    {
        (Array.isArray(font) ? font : [font])
            .forEach((t) => settings.ADAPTER.getFontFaceSet().delete(t));
    }
} as LoaderParser<FontFace | FontFace[]>;

extensions.add(loadWebFont);
