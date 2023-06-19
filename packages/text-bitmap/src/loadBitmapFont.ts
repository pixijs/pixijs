import { copySearchParams, LoaderParserPriority } from '@pixi/assets';
import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { BitmapFont } from './BitmapFont';
import { TextFormat, XMLStringFormat } from './formats';

import type { Loader, LoaderParser, ResolvedAsset } from '@pixi/assets';
import type { Texture } from '@pixi/core';
import type { BitmapFontData } from './BitmapFontData';

const validExtensions = ['.xml', '.fnt'];

/** simple loader plugin for loading in bitmap fonts! */
export const loadBitmapFont = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Normal,
    },

    name: 'loadBitmapFont',

    test(url: string): boolean
    {
        return validExtensions.includes(utils.path.extname(url).toLowerCase());
    },

    async testParse(data: string): Promise<boolean>
    {
        return TextFormat.test(data) || XMLStringFormat.test(data);
    },

    async parse(asset: string, data: ResolvedAsset, loader: Loader): Promise<BitmapFont>
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
            let imagePath = utils.path.join(utils.path.dirname(src), pageFile);

            imagePath = copySearchParams(imagePath, src);

            textureUrls.push(imagePath);
        }

        const loadedTextures = await loader.load<Texture>(textureUrls);
        const textures = textureUrls.map((url) => loadedTextures[url]);

        return BitmapFont.install(fontData, textures, true);
    },

    async load(url: string, _options: ResolvedAsset): Promise<string>
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
