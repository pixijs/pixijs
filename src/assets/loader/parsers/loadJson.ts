import { DOMAdapter } from '../../../environment/adapter';
import { ExtensionType } from '../../../extensions/Extensions';
import { checkDataUrl } from '../../utils/checkDataUrl';
import { checkExtension } from '../../utils/checkExtension';
import { LoaderParserPriority } from './LoaderParser';

import type { LoaderParser } from './LoaderParser';

const validJSONExtension = '.json';
const validJSONMIME = 'application/json';

/**
 * A simple loader plugin for loading json data
 * @memberof assets
 */
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
        const response = await DOMAdapter.get().fetch(url);

        const json = await response.json();

        return json as T;
    },
} satisfies LoaderParser<string>;
