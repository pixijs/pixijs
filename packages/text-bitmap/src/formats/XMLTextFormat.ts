import { BitmapFontData } from '../BitmapFontData';
import { XMLFormat } from './XMLFormat';

/**
 * BitmapFont format that's XML-based.
 *
 * @class
 * @private
 */
export class XMLTextFormat
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
        return typeof data === 'string' && data.indexOf('<font>\n  <info face=') === 0;
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
        const xml = new window.DOMParser().parseFromString(xmlTxt, 'text/xml');

        return XMLFormat.parse(xml);
    }
}
