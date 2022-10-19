import type { BitmapFontData } from '../BitmapFontData';
import { XMLFormat } from './XMLFormat';

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
    static test(data: unknown): boolean
    {
        if (typeof data === 'string' && data.includes('<font>'))
        {
            const xml = new globalThis.DOMParser().parseFromString(data, 'text/xml');

            return XMLFormat.test(xml);
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
        const xml = new globalThis.DOMParser().parseFromString(xmlTxt, 'text/xml');

        return XMLFormat.parse(xml);
    }
}
