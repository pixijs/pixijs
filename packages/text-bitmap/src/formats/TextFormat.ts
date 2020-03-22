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
    public static test(data: any): boolean
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
    public static parse(txt: string): BitmapFontData
    {
        // Retrieve data item
        const items = txt.match(/^[a-z]+\s+.+$/gm);
        const data = new BitmapFontData();

        for (const itemKey in items)
        {
            // Extract item name
            const name = items[itemKey].match(/^[a-z]+/gm)[0] as keyof BitmapFontData;

            // Extract item attribute list as string ex.: "width=10"
            const attributeList = items[itemKey].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);

            // Convert attribute list into an object
            const itemData: any = {};

            for (const attributeKey in attributeList)
            {
                // Split key-value pairs
                const split = attributeList[attributeKey].split('=');
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
            info.size = this.parseValue(info.size);
        });

        data.common.forEach((common) =>
        {
            common.lineHeight = this.parseValue(common.lineHeight);
        });

        data.page.forEach((page) =>
        {
            page.id = this.parseValue(page.id);
        });

        data.char.forEach((char) =>
        {
            char.id = this.parseValue(char.id);
            char.page = this.parseValue(char.page);
            char.x = this.parseValue(char.x);
            char.y = this.parseValue(char.y);
            char.width = this.parseValue(char.width);
            char.height = this.parseValue(char.height);
            char.xoffset = this.parseValue(char.xoffset);
            char.yoffset = this.parseValue(char.yoffset);
            char.xadvance = this.parseValue(char.xadvance);
        });

        data.kerning.forEach((kerning) =>
        {
            kerning.first = this.parseValue(kerning.first);
            kerning.second = this.parseValue(kerning.second);
            kerning.amount = this.parseValue(kerning.amount);
        });

        return data;
    }

    private static parseValue(value: string|number): number
    {
        return typeof value === 'number' ? Math.floor(value) : parseInt(value, 10);
    }
}
