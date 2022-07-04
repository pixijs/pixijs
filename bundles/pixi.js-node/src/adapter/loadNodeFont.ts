import type { LoadAsset, LoaderParser, LoadFontData } from '@pixi/assets';
import { getFontFamilyName } from '@pixi/assets';
import { registerFont } from 'canvas';

const validWeights = [
    'normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900',
];
const validFonts = ['woff', 'woff2', 'ttf', 'otf'];

/** loads a font from a file */
export const loadNodeFont = {
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validFonts.includes(extension);
    },

    async load(url: string, options: LoadAsset<LoadFontData>): Promise<void>
    {
        const name = options.data?.family ?? getFontFamilyName(url);
        const weights = options.data?.weights?.filter((weight) => validWeights.includes(weight)) ?? ['normal'];
        const data = options.data ?? {} as LoadFontData;

        for (let i = 0; i < weights.length; i++)
        {
            const weight = weights[i];

            registerFont(url, {
                ...data,
                family: options.data?.family ?? name,
                weight,
            });
        }
    },
} as LoaderParser;
