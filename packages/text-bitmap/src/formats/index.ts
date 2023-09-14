import { TextFormat } from './TextFormat';
import { XMLFormat } from './XMLFormat';
import { XMLStringFormat } from './XMLStringFormat';

import type { BitmapFontData } from '../BitmapFontData';

// Registered formats, maybe make this extensible in the future?
const formats = [
    TextFormat,
    XMLFormat,
    XMLStringFormat,
] as const;

/**
 * Auto-detect BitmapFont parsing format based on data.
 * @private
 * @param {any} data - Data to detect format
 * @returns {any} Format or null
 */
export function autoDetectFormat(data: string | XMLDocument | BitmapFontData): typeof formats[number] | null
{
    for (let i = 0; i < formats.length; i++)
    {
        if (formats[i].test(data))
        {
            return formats[i];
        }
    }

    return null;
}

export type { IBitmapFontRawData } from './TextFormat';
export { TextFormat, XMLFormat, XMLStringFormat };
