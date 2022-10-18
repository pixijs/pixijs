import { BitmapFontData } from '../BitmapFontData';

/**
 * Internal data format used to convert to BitmapFontData.
 * @private
 */
export interface IBitmapFontRawData
{
    info: {
        face: string;
        size: string;
    }[];
    common: { lineHeight: string }[];
    page: {
        id: string;
        file: string;
    }[];
    chars: {
        count: number;
    }[];
    char: {
        id: string;
        page: string;
        x: string;
        y: string;
        width: string;
        height: string;
        xoffset: string;
        yoffset: string;
        xadvance: string;
    }[];
    kernings?: {
        count: number;
    }[];
    kerning?: {
        first: string;
        second: string;
        amount: string;
    }[];
    distanceField?: {
        fieldType: string;
        distanceRange: string;
    }[]
}

/**
 * BitmapFont format that's Text-based.
 * @private
 */
export class TextFormat
{
    /**
     * Check if resource refers to txt font data.
     * @param data
     * @returns - True if resource could be treated as font data, false otherwise.
     */
    static test(data: unknown): boolean
    {
        return typeof data === 'string' && data.startsWith('info face=');
    }

    /**
     * Convert text font data to a javascript object.
     * @param txt - Raw string data to be converted
     * @returns - Parsed font data
     */
    static parse(txt: string): BitmapFontData
    {
        // Retrieve data item
        const items = txt.match(/^[a-z]+\s+.+$/gm);
        const rawData: IBitmapFontRawData = {
            info: [],
            common: [],
            page: [],
            char: [],
            chars: [],
            kerning: [],
            kernings: [],
            distanceField: [],
        };

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
            rawData[name].push(itemData);
        }

        const font = new BitmapFontData();

        rawData.info.forEach((info) => font.info.push({
            face: info.face,
            size: parseInt(info.size, 10),
        }));

        rawData.common.forEach((common) => font.common.push({
            lineHeight: parseInt(common.lineHeight, 10),
        }));

        rawData.page.forEach((page) => font.page.push({
            id: parseInt(page.id, 10),
            file: page.file,
        }));

        rawData.char.forEach((char) => font.char.push({
            id: parseInt(char.id, 10),
            page: parseInt(char.page, 10),
            x: parseInt(char.x, 10),
            y: parseInt(char.y, 10),
            width: parseInt(char.width, 10),
            height: parseInt(char.height, 10),
            xoffset: parseInt(char.xoffset, 10),
            yoffset: parseInt(char.yoffset, 10),
            xadvance: parseInt(char.xadvance, 10),
        }));

        rawData.kerning.forEach((kerning) => font.kerning.push({
            first: parseInt(kerning.first, 10),
            second: parseInt(kerning.second, 10),
            amount: parseInt(kerning.amount, 10),
        }));

        rawData.distanceField.forEach((df) => font.distanceField.push({
            distanceRange: parseInt(df.distanceRange, 10),
            fieldType: df.fieldType,
        }));

        return font;
    }
}
