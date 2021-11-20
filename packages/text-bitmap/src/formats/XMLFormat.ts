import { BitmapFontData } from '../BitmapFontData';

/**
 * BitmapFont format that's XML-based.
 *
 * @private
 */
export class XMLFormat
{
    /**
     * Check if resource refers to xml font data.
     *
     * @param data
     * @return - True if resource could be treated as font data, false otherwise.
     */
    static test(data: unknown): boolean
    {
        return data instanceof XMLDocument
            && data.getElementsByTagName('page').length
            && data.getElementsByTagName('info')[0].getAttribute('face') !== null;
    }

    /**
     * Convert the XML into BitmapFontData that we can use.
     *
     * @param xml
     * @return - Data to use for BitmapFont
     */
    static parse(xml: XMLDocument): BitmapFontData
    {
        const data = new BitmapFontData();
        const info = xml.getElementsByTagName('info');
        const common = xml.getElementsByTagName('common');
        const page = xml.getElementsByTagName('page');
        const char = xml.getElementsByTagName('char');
        const kerning = xml.getElementsByTagName('kerning');
        const distanceField = xml.getElementsByTagName('distanceField');

        for (let i = 0; i < info.length; i++)
        {
            data.info.push({
                face: info[i].getAttribute('face'),
                size: parseInt(info[i].getAttribute('size'), 10),
            });
        }

        for (let i = 0; i < common.length; i++)
        {
            data.common.push({
                lineHeight: parseInt(common[i].getAttribute('lineHeight'), 10),
            });
        }

        for (let i = 0; i < page.length; i++)
        {
            data.page.push({
                id: parseInt(page[i].getAttribute('id'), 10) || 0,
                file: page[i].getAttribute('file'),
            });
        }

        for (let i = 0; i < char.length; i++)
        {
            const letter = char[i];

            data.char.push({
                id: parseInt(letter.getAttribute('id'), 10),
                page: parseInt(letter.getAttribute('page'), 10) || 0,
                x: parseInt(letter.getAttribute('x'), 10),
                y: parseInt(letter.getAttribute('y'), 10),
                width: parseInt(letter.getAttribute('width'), 10),
                height: parseInt(letter.getAttribute('height'), 10),
                xoffset: parseInt(letter.getAttribute('xoffset'), 10),
                yoffset: parseInt(letter.getAttribute('yoffset'), 10),
                xadvance: parseInt(letter.getAttribute('xadvance'), 10),
            });
        }

        for (let i = 0; i < kerning.length; i++)
        {
            data.kerning.push({
                first: parseInt(kerning[i].getAttribute('first'), 10),
                second: parseInt(kerning[i].getAttribute('second'), 10),
                amount: parseInt(kerning[i].getAttribute('amount'), 10),
            });
        }

        for (let i = 0; i < distanceField.length; i++)
        {
            data.distanceField.push({
                fieldType: distanceField[i].getAttribute('fieldType'),
                distanceRange: parseInt(distanceField[i].getAttribute('distanceRange'), 10),
            });
        }

        return data;
    }
}
