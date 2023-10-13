import { DOMAdapter } from '../../../../environment/adapter';
import { XMLFormat } from './xmlFormat';

import type { BitmapFontData } from '../AbstractBitmapFont';

export const XMLStringFormat = {
    test(data: string | XMLDocument | BitmapFontData): boolean
    {
        if (typeof data === 'string' && data.includes('<font>'))
        {
            return XMLFormat.test(DOMAdapter.get().parseXML(data));
        }

        return false;
    },

    parse(data: string): BitmapFontData
    {
        return XMLFormat.parse(DOMAdapter.get().parseXML(data));
    }
};
