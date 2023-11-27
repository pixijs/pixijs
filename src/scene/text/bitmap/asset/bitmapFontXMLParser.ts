import type { BitmapFontData, RawCharData } from '../AbstractBitmapFont';

export const bitmapFontXMLParser = {
    test(data: string | XMLDocument | BitmapFontData): boolean
    {
        const xml = data as Document;

        return typeof xml !== 'string'
            && 'getElementsByTagName' in xml
            && xml.getElementsByTagName('page').length
            && xml.getElementsByTagName('info')[0].getAttribute('face') !== null;
    },

    parse(xml: Document): BitmapFontData
    {
        const data: BitmapFontData = {
            chars: {},
            pages: [],
            lineHeight: 0,
            fontSize: 0,
            fontFamily: '',
            distanceField: null,
            baseLineOffset: 0,
        };

        const info = xml.getElementsByTagName('info')[0];
        const common = xml.getElementsByTagName('common')[0];
        const distanceField = xml.getElementsByTagName('distanceField')[0];

        if (distanceField)
        {
            data.distanceField = {
                type: distanceField.getAttribute('fieldType') as 'sdf' | 'msdf' | 'none',
                range: parseInt(distanceField.getAttribute('distanceRange'), 10),
            };
        }

        // pages and chars:
        const page = xml.getElementsByTagName('page');
        const char = xml.getElementsByTagName('char');
        const kerning = xml.getElementsByTagName('kerning');

        data.fontSize = parseInt(info.getAttribute('size'), 10);
        data.fontFamily = info.getAttribute('face');
        data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);

        for (let i = 0; i < page.length; i++)
        {
            data.pages.push({
                id: parseInt(page[i].getAttribute('id'), 10) || 0,
                file: page[i].getAttribute('file'),
            });
        }

        const map: Record<string, string> = {};

        data.baseLineOffset = data.lineHeight - parseInt(common.getAttribute('base'), 10);

        for (let i = 0; i < char.length; i++)
        {
            const charNode = char[i];
            const id = parseInt(charNode.getAttribute('id'), 10);

            let letter = charNode.getAttribute('letter') ?? charNode.getAttribute('char') ?? String.fromCharCode(id);

            if (letter === 'space')letter = ' ';

            map[id] = letter;

            data.chars[letter] = {
                id,
                // texture deets..
                page: parseInt(charNode.getAttribute('page'), 10) || 0,
                x: parseInt(charNode.getAttribute('x'), 10),
                y: parseInt(charNode.getAttribute('y'), 10),
                width: parseInt(charNode.getAttribute('width'), 10),
                height: parseInt(charNode.getAttribute('height'), 10),

                // render deets..
                xOffset: parseInt(charNode.getAttribute('xoffset'), 10),
                yOffset: parseInt(charNode.getAttribute('yoffset'), 10), // + baseLineOffset,
                xAdvance: parseInt(charNode.getAttribute('xadvance'), 10),
                kerning: {},
            } as RawCharData;
        }

        for (let i = 0; i < kerning.length; i++)
        {
            const first = parseInt(kerning[i].getAttribute('first'), 10);
            const second = parseInt(kerning[i].getAttribute('second'), 10);
            const amount = parseInt(kerning[i].getAttribute('amount'), 10);

            data.chars[map[second]].kerning[map[first]] = amount;// * 10000;
        }

        return data;
    }
};
