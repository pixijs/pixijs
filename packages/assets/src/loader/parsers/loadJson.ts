import { extensions, ExtensionType, settings } from '@pixi/core';
import { checkDataUrl } from '../../utils/checkDataUrl';
import { checkExtension } from '../../utils/checkExtension';
import { LoaderParserPriority } from './LoaderParser';

import type { LoaderParser } from './LoaderParser';

const validJSONExtension = '.json';
const validJSONMIME = 'application/json';

/** simple loader plugin for loading json data */
export const loadJson = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    name: 'loadJson',

    test(url: string): boolean
    {
        return checkDataUrl(url, validJSONMIME) || checkExtension(url, validJSONExtension);
    },

    async load<T>(url: string): Promise<T>
    {
        const response = await settings.ADAPTER.fetch(url);

        const json = await response.json();

        return json as T;
    },
} as LoaderParser;

extensions.add(loadJson);
