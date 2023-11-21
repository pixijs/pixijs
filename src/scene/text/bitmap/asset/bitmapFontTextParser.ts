import type { BitmapFontData, RawCharData } from '../AbstractBitmapFont';

/**
 * Internal data format used to convert to BitmapFontData.
 * @private
 */
export interface BitmapFontRawData
{
    info: {
        face: string;
        size: string;
    }[];
    common: { lineHeight: string, base: string }[];
    page: {
        id: string;
        file: string;
    }[];
    chars: {
        count: number;
    }[];
    char: {
        id: string
        page: string
        xoffset: string
        yoffset: string
        xadvance: string,
        x: string
        y: string
        width: string
        height: string
        letter?: string
        char?: string
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
        fieldType: 'sdf' | 'msdf' | 'none';
        distanceRange: string;
    }[]
}

export const bitmapFontTextParser = {
    test(data: string | XMLDocument | BitmapFontData): boolean
    {
        return typeof data === 'string' && data.startsWith('info face=');
    },

    parse(txt: string): BitmapFontData
    {
        // Retrieve data item
        const items = txt.match(/^[a-z]+\s+.+$/gm);
        const rawData: BitmapFontRawData = {
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
            const name = items[i].match(/^[a-z]+/gm)[0] as keyof BitmapFontRawData;

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

        const font: BitmapFontData = {
            chars: {},
            pages: [],
            lineHeight: 0,
            fontSize: 0,
            fontFamily: '',
            distanceField: null,
            baseLineOffset: 0,
        };

        const [info] = rawData.info;
        const [common] = rawData.common;
        const [distanceField] = rawData.distanceField ?? [];

        if (distanceField)
        {
            font.distanceField = {
                range: parseInt(distanceField.distanceRange, 10),
                type: distanceField.fieldType
            };
        }

        font.fontSize = parseInt(info.size, 10);
        font.fontFamily = info.face;
        font.lineHeight = parseInt(common.lineHeight, 10);

        const page = rawData.page;

        for (let i = 0; i < page.length; i++)
        {
            font.pages.push({
                id: parseInt(page[i].id, 10) || 0,
                file: page[i].file,
            });
        }

        const map: Record<string, string> = {};

        font.baseLineOffset = font.lineHeight - parseInt(common.base, 10);

        const char = rawData.char;

        for (let i = 0; i < char.length; i++)
        {
            const charNode = char[i];
            const id = parseInt(charNode.id, 10);

            let letter = charNode.letter ?? charNode.char ?? String.fromCharCode(id);

            if (letter === 'space')letter = ' ';

            map[id] = letter;

            font.chars[letter] = {
                id,
                // texture deets..
                page: parseInt(charNode.page, 10) || 0,
                x: parseInt(charNode.x, 10),
                y: parseInt(charNode.y, 10),
                width: parseInt(charNode.width, 10),
                height: parseInt(charNode.height, 10),
                xOffset: parseInt(charNode.xoffset, 10),
                yOffset: parseInt(charNode.yoffset, 10),
                xAdvance: parseInt(charNode.xadvance, 10),
                kerning: {},
            } as RawCharData;
        }

        const kerning = rawData.kerning || [];

        for (let i = 0; i < kerning.length; i++)
        {
            const first = parseInt(kerning[i].first, 10);
            const second = parseInt(kerning[i].second, 10);
            const amount = parseInt(kerning[i].amount, 10);

            font.chars[map[second]].kerning[map[first]] = amount;
        }

        return font;
    }
};
