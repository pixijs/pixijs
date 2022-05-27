import { dirname, extname, join } from 'path';
import type { Texture } from '@pixi/core';
import { BitmapFont } from '@pixi/text-bitmap';

import type { LoadAsset, Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';

function getImagePath(url: string): string
{
    const imagePath = url.replace('.xml', '.png');

    return imagePath;

    return null;
}

/**
 * simple loader plugin for loading in bitmap fonts!
 */
const loadBitmapFont = {
    test(url: string): boolean
    {
        return (extname(url).includes('.xml'));
    },

    async load(url: string, _options: LoadAsset, loader: Loader): Promise<BitmapFont>
    {
        const response = await fetch(url);

        const text = await response.text();

        const data = new window.DOMParser().parseFromString(text, 'text/xml');

        const pages = data.getElementsByTagName('page');

        const textureUrls = [];

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i].getAttribute('file');

            const imagePath = getImagePath(url) || join(dirname(url), pageFile);

            textureUrls.push(imagePath);
        }

        const textures: Texture[] = Object.values(await loader.load(textureUrls));

        return BitmapFont.install(data, textures, true);
    },
} as LoaderParser;

export { loadBitmapFont };

