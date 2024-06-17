import { DOMAdapter } from '../../../environment/adapter';
import { ExtensionType } from '../../../extensions/Extensions';
import { checkDataUrl } from '../../utils/checkDataUrl';
import { checkExtension } from '../../utils/checkExtension';
import { LoaderParserPriority } from './LoaderParser';

import type { LoaderParser } from './LoaderParser';

const validTXTExtension = '.txt';
const validTXTMIME = 'text/plain';

/**
 * A simple loader plugin for loading text data
 * @memberof assets
 */
export const loadTxt = {

    name: 'loadTxt',

    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
        name: 'loadTxt',
    },

    test(url: string): boolean
    {
        return checkDataUrl(url, validTXTMIME) || checkExtension(url, validTXTExtension);
    },

    async load(url: string): Promise<string>
    {
        const response = await DOMAdapter.get().fetch(url);

        const txt = await response.text();

        return txt;
    },
} satisfies LoaderParser<string>;
