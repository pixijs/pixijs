import { settings } from '@pixi/core';
import { XMLFormat } from './XMLFormat';

import type { BitmapFontData } from '../BitmapFontData';

/**
 * BitmapFont format that's XML-based.
 * @private
 */
export class XMLStringFormat
{
    /**
     * Check if resource refers to text xml font data.
     * @param data
     * @returns - True if resource could be treated as font data, false otherwise.
     */
    static test(data: string | XMLDocument | BitmapFontData): boolean
    {
        if (typeof data === 'string' && data.includes('<font>'))
        {
            return XMLFormat.test(settings.ADAPTER.parseXML(data));
        }

        return false;
    }

    /**
     * Convert the text XML into BitmapFontData that we can use.
     * @param xmlTxt
     * @returns - Data to use for BitmapFont
     */
    static parse(xmlTxt: string): BitmapFontData
    {
        return XMLFormat.parse(settings.ADAPTER.parseXML(xmlTxt));
    }
}
