import type { Texture } from '@pixi/core';
import { extensions, ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';
import type { BitmapFontData } from '@pixi/text-bitmap';
import { BitmapFont, TextFormat, XMLStringFormat } from '@pixi/text-bitmap';
import { path } from '@pixi/utils';

import type { Loader } from '../Loader';
import type { LoadAsset } from '../types';
import type { LoaderParser } from './LoaderParser';
import { LoaderParserPriority } from './LoaderParser';

const validExtensions = ['.xml', '.fnt'];

/** simple loader plugin for loading in bitmap fonts! */
export const loadBitmapFont = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Normal,
    },

    test(url: string): boolean
    {
        return validExtensions.includes(path.extname(url));
    },

    async testParse(data: string): Promise<boolean>
    {
        return TextFormat.test(data) || XMLStringFormat.test(data);
    },

    async parse(asset: string, data: LoadAsset, loader: Loader): Promise<BitmapFont>
    {
        const fontData: BitmapFontData = TextFormat.test(asset)
            ? TextFormat.parse(asset)
            : XMLStringFormat.parse(asset);

        const { src } = data;
        const { page: pages } = fontData;
        const textureUrls = [];

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i].file;
            const imagePath = path.join(path.dirname(src), pageFile);

            textureUrls.push(imagePath);
        }

        const textures: Texture[] = Object.values(await loader.load(textureUrls));

        return BitmapFont.install(fontData, textures, true);
    },

    async load(url: string, _options: LoadAsset): Promise<string>
    {
        const response = await settings.ADAPTER.fetch(url);

        return response.text();
    },

    unload(bitmapFont: BitmapFont): void
    {
        bitmapFont.destroy();
    }
} as LoaderParser<BitmapFont | string>;

extensions.add(loadBitmapFont);
