import { BitmapFontData } from '../BitmapFontData';
import { XMLFormat } from './XMLFormat';

/**
 * BitmapFont format that's XML-based.
 *
 * @class
 * @private
 */
export class XMLStringFormat
{
    /**
     * Check if resource refers to text xml font data.
     *
     * @static
     * @private
     * @param {any} data
     * @return {boolean} True if resource could be treated as font data, false otherwise.
     */
    static test(data: unknown): boolean
    {
        if (typeof data === 'string' && data.indexOf('<font>') > -1)
        {
            const xml = new self.DOMParser().parseFromString(data, 'text/xml');

            return XMLFormat.test(xml);
        }

        return false;
    }

    /**
     * Convert the text XML into BitmapFontData that we can use.
     *
     * @static
     * @private
     * @param {string} xmlTxt
     * @return {BitmapFontData} Data to use for BitmapFont
     */
    static parse(xmlTxt: string): BitmapFontData
    {
        const xml = new self.DOMParser().parseFromString(xmlTxt, 'text/xml');

        return XMLFormat.parse(xml);
    }
}
