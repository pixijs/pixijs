import type { Texture } from '@pixi/core';
import { ExtensionType } from '@pixi/core';
import type { BitmapFontData } from '@pixi/text-bitmap';
import { BitmapFont, TextFormat, XMLFormat, XMLStringFormat } from '@pixi/text-bitmap';
import { dirname, extname, join } from '../../utils/path';

import type { Loader } from '../Loader';
import type { LoadAsset } from '../types';
import type { LoaderParser } from './LoaderParser';

async function _loadBitmap(src: string, data: BitmapFontData, loader: Loader): Promise<BitmapFont>
{
    const pages = data.page;

    const textureUrls = [];

    for (let i = 0; i < pages.length; ++i)
    {
        const pageFile = pages[i].file;

        const imagePath = join(dirname(src), pageFile);

        textureUrls.push(imagePath);
    }

    const textures: Texture[] = Object.values(await loader.load(textureUrls));

    return BitmapFont.install(data, textures, true);
}
const validExtensions = ['.xml', '.fnt'];

/** simple loader plugin for loading in bitmap fonts! */
export const loadBitmapFont = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return validExtensions.includes(extname(url));
    },

    async testParse(data: string): Promise<boolean>
    {
        const isText = TextFormat.test(data);
        const isXMLText = XMLStringFormat.test(data);

        return isText || isXMLText;
    },

    async parse(asset: string, data: LoadAsset, loader: Loader): Promise<BitmapFont>
    {
        const isText = TextFormat.test(asset);

        if (isText)
        {
            const parsed = TextFormat.parse(asset);

            return await _loadBitmap(data.src, parsed, loader);
        }

        return await _loadBitmap(data.src, XMLStringFormat.parse(asset), loader);
    },

    async load(url: string, _options: LoadAsset, loader: Loader): Promise<BitmapFont>
    {
        const response = await fetch(url);

        const text = await response.text();

        const data = new window.DOMParser().parseFromString(text, 'text/xml');

        return await _loadBitmap(url, XMLFormat.parse(data), loader);
    },

    unload(bitmapFont: BitmapFont): void
    {
        bitmapFont.destroy();
    }
} as LoaderParser<BitmapFont | string>;
