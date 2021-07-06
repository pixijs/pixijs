import { dirname, extname, join } from 'path';
import { BitmapFont, Texture } from 'pixi.js';

import { loadAssets } from '../Loader';
import { LoadPlugin } from './LoadPlugin';

/**
 * simple loader plugin for loading in bitmap fonts!
 */
const loadBitmapFont = {
    test(url: string): boolean
    {
        return (extname(url).includes('.xml'));
    },

    async load(url: string): Promise<void>
    {
        const response = await fetch(url);

        const text = await response.text();

        const data = new window.DOMParser().parseFromString(text, 'text/xml');

        const pages = data.getElementsByTagName('page');

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i].getAttribute('file');

            const imagePath = join(dirname(url), pageFile);

            const assets = await loadAssets([imagePath]);

            const texture = assets[imagePath] as Texture;

            BitmapFont.install(data, texture);
        }
    },
} as LoadPlugin;

export { loadBitmapFont };

