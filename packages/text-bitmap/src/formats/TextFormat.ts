import { BitmapFontData } from '../BitmapFontData';

/**
 * BitmapFont format that's Text-based.
 *
 * @class
 * @private
 */
export class TextFormat
{
    /**
     * Check if resource refers to txt font data.
     *
     * @static
     * @private
     * @param {any} data
     * @return {boolean} True if resource could be treated as font data, false otherwise.
     */
    static test(data: any): boolean
    {
        return typeof data === 'string' && data.indexOf('info face=') === 0;
    }

    /**
     * Convert text font data to a javascript object.
     *
     * @static
     * @private
     * @param {string} txt Raw string data to be converted
     * @return {PIXI.BitmapFontData} Parsed font data
     */
    static parse(txt: string): BitmapFontData
    {
        // Retrieve data item
        const items = txt.match(/^[a-z]+\s+.+$/gm);
        const data = new BitmapFontData();

        for (const i in items)
        {
            // Extract item name
            const name = items[i].match(/^[a-z]+/gm)[0] as keyof BitmapFontData;

            // Extract item attribute list as string ex.: "width=10"
            const attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);

            // Convert attribute list into an object
            const itemData: any = {};

            for (const i in attributeList)
            {
                // Split key-value pairs
                const split = attributeList[i].split('=');
                const key = split[0];

                // Remove eventual quotes from value
                const strValue = split[1].replace(/"/gm, '');

                // Try to convert value into float
                const floatValue = parseFloat(strValue);

                // Use string value case float value is NaN
                const value = isNaN(floatValue) ? strValue : floatValue;

                itemData[key] = value;
            }

            // Push current item to the resulting data
            if (!data[name])
            {
                data[name] = [];
            }

            data[name].push(itemData);
        }

        /* eslint-disable @typescript-eslint/ban-ts-ignore */

        data.info.forEach((info) =>
        {
            // @ts-ignore
            info.size = parseInt(info.size, 10);
        });

        data.common.forEach((common) =>
        {
            // @ts-ignore
            common.lineHeight = parseInt(common.lineHeight, 10);
        });

        data.page.forEach((page) =>
        {
            // @ts-ignore
            page.id = parseInt(page.id, 10);
        });

        data.char.forEach((char) =>
        {
            // @ts-ignore
            char.id = parseInt(char.id, 10);
            // @ts-ignore
            char.page = parseInt(char.page, 10);
            // @ts-ignore
            char.x = parseInt(char.x, 10);
            // @ts-ignore
            char.y = parseInt(char.y, 10);
            // @ts-ignore
            char.width = parseInt(char.width, 10);
            // @ts-ignore
            char.height = parseInt(char.height, 10);
            // @ts-ignore
            char.xoffset = parseInt(char.xoffset, 10);
            // @ts-ignore
            char.yoffset = parseInt(char.yoffset, 10);
            // @ts-ignore
            char.xadvance = parseInt(char.xadvance, 10);
        });

        data.kerning.forEach((kerning) =>
        {
            // @ts-ignore
            kerning.first = parseInt(kerning.first, 10);
            // @ts-ignore
            kerning.second = parseInt(kerning.second, 10);
            // @ts-ignore
            kerning.amount = parseInt(kerning.amount, 10);
        });

        /* eslint-enable @typescript-eslint/ban-ts-ignore */

        return data;
    }
}
