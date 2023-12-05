import { DOMAdapter } from '../../../environment/adapter';
import { bitmapFontXMLParser } from './bitmapFontXMLParser';

import type { BitmapFontData } from '../AbstractBitmapFont';

export const bitmapFontXMLStringParser = {
    test(data: string | XMLDocument | BitmapFontData): boolean
    {
        if (typeof data === 'string' && data.includes('<font>'))
        {
            return bitmapFontXMLParser.test(DOMAdapter.get().parseXML(data));
        }

        return false;
    },

    parse(data: string): BitmapFontData
    {
        return bitmapFontXMLParser.parse(DOMAdapter.get().parseXML(data));
    }
};
