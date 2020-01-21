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
    static test(data)
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
    static parse(txt)
    {
        // Retrieve data item
        const items = txt.match(/^[a-z]+\s+.+$/gm);
        const data = new BitmapFontData();

        for (const i in items)
        {
            // Extract item name
            const name = items[i].match(/^[a-z]+/gm)[0];

            // Extract item attribute list as string ex.: "width=10"
            const attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);

            // Convert attribute list into an object
            const itemData = {};

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

        data.info.forEach((info) =>
        {
            info.size = parseInt(info.size, 10);
        });

        data.common.forEach((common) =>
        {
            common.lineHeight = parseInt(common.lineHeight, 10);
        });

        data.page.forEach((page) =>
        {
            page.id = parseInt(page.id, 10);
        });

        data.char.forEach((char) =>
        {
            char.id = parseInt(char.id, 10);
            char.page = parseInt(char.page, 10);
            char.x = parseInt(char.x, 10);
            char.y = parseInt(char.y, 10);
            char.width = parseInt(char.width, 10);
            char.height = parseInt(char.height, 10);
            char.xoffset = parseInt(char.xoffset, 10);
            char.yoffset = parseInt(char.yoffset, 10);
            char.xadvance = parseInt(char.xadvance, 10);
        });

        data.kerning.forEach((kerning) =>
        {
            kerning.first = parseInt(kerning.first, 10);
            kerning.second = parseInt(kerning.second, 10);
            kerning.amount = parseInt(kerning.amount, 10);
        });

        return data;
    }
}
