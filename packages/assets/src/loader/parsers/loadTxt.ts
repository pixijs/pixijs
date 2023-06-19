import { extensions, ExtensionType, settings } from '@pixi/core';
import { checkDataUrl } from '../../utils/checkDataUrl';
import { checkExtension } from '../../utils/checkExtension';
import { LoaderParserPriority } from './LoaderParser';

import type { LoaderParser } from './LoaderParser';

const validTXTExtension = '.txt';
const validTXTMIME = 'text/plain';

/** Simple loader plugin for loading text data */
export const loadTxt = {

    name: 'loadTxt',

    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    test(url: string): boolean
    {
        return checkDataUrl(url, validTXTMIME) || checkExtension(url, validTXTExtension);
    },

    async load(url: string): Promise<string>
    {
        const response = await settings.ADAPTER.fetch(url);

        const txt = await response.text();

        return txt;
    },
} as LoaderParser;

extensions.add(loadTxt);
