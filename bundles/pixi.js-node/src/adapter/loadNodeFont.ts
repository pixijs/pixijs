import canvasModule from 'canvas';
import { getFontFamilyName } from '@pixi/assets';
import { extensions, ExtensionType, utils } from '@pixi/core';

import type { LoadAsset, LoaderParser, LoadFontData } from '@pixi/assets';

const { registerFont } = canvasModule;
const validWeights = [
    'normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900',
];
const validFonts = ['.woff', '.woff2', '.ttf', '.otf'];

/** loads a font from a file */
export const loadNodeFont = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return validFonts.includes(utils.path.extname(url).toLowerCase());
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

extensions.add(loadNodeFont);
