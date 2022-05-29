import { basename, extname } from '../../utils/path';
import type { LoaderParser } from './LoaderParser';

// FontFaceSet alias
type FontFaceSet = any;

// Extend document type that might have FontFaceSet available in 'fonts'
declare global
{
    interface Document
    {
        fonts?: FontFaceSet;
    }
}

const validWeights = ['normal', 'bold',
    '100', '200', '300', '400', '500', '600', '700', '800', '900',
];

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
        return extname(url).split('?').shift().endsWith('woff2');
    },

    async load(url: string, options?: {data: {weights: string[]}}): Promise<void>
    {
        // Prevent loading font if navigator is not online
        if (!window.navigator.onLine)
        {
            throw new Error('[loadWebFont] Cannot load font - navigator is offline');
        }

        if ('FontFace' in window)
        {
            const name = getFontFamilyName(url);
            const weights = options.data?.weights?.filter((weight) =>
                validWeights.includes(weight)) ?? ['normal'];

            for (let i = 0; i < weights.length; i++)
            {
                const weight = weights[i];

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const font = new FontFace(name, `url(${url})`, {
                    weight,
                });

                await font.load();

                document.fonts.add(font);
            }
        }
        else
        {
            console.warn('[loadWebFont] FontFace API is not supported. Skipping loading font');
        }
    },
} as LoaderParser;
