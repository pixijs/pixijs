import { settings } from '../../../../settings/settings';
import { XMLFormat } from './xmlFormat';

import type { BitmapFontData } from '../BitmapFont';

export const XMLStringFormat = {
    test(data: unknown): boolean
    {
        if (typeof data === 'string' && data.includes('<font>'))
        {
            return XMLFormat.test(settings.ADAPTER.parseXML(data));
        }

        return false;
    },

    parse(data: string): BitmapFontData
    {
        return XMLFormat.parse(settings.ADAPTER.parseXML(data));
    }
};
