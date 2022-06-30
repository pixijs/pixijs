import { basename, extname } from '../../utils/path';
import { LoadAsset } from '../types';
import type { LoaderParser } from './LoaderParser';

const validWeights = ['normal', 'bold',
    '100', '200', '300', '400', '500', '600', '700', '800', '900',
];
const validFonts = ['woff', 'woff2', 'ttf', 'otf'];

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
    const ext = extname(url);
    const name = basename(url, ext);

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
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validFonts.includes(extension);
    },

    async load(url: string, options?: LoadAsset<LoadFontData>): Promise<FontFace>
    {
        // Prevent loading font if navigator is not online
        if (!window.navigator.onLine)
        {
            throw new Error('[loadWebFont] Cannot load font - navigator is offline');
        }

        if ('FontFace' in window)
        {
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

                document.fonts.add(font);

                return font;
            }
        }
        else
        {
            console.warn('[loadWebFont] FontFace API is not supported. Skipping loading font');
        }

        return null;
    },

    unload(font: FontFace): void
    {
        document.fonts.delete(font);
    }
} as LoaderParser<FontFace>;
