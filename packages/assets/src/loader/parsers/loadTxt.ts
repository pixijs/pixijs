import { settings, utils, extensions, ExtensionType } from '@pixi/core';
import { LoaderParserPriority } from './LoaderParser';

import type { LoaderParser } from './LoaderParser';

/** Simple loader plugin for loading text data */
export const loadTxt = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    test(url: string): boolean
    {
        return (utils.path.extname(url).includes('.txt'));
    },

    async load(url: string): Promise<string>
    {
        const response = await settings.ADAPTER.fetch(url);

        const txt = await response.text();

        return txt;
    },
} as LoaderParser;

extensions.add(loadTxt);
