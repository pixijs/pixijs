import { bitmapFontTextParser } from '../bitmapFontTextParser';

const rawFontString = `
info face="sans-serif" size=36 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=1,1,1,1 spacing=1,1
common lineHeight=36 base=27 scaleW=256 scaleH=256 pages=1 packed=0
page id=0 file="sans-serif.png"
chars count=2
char id=32 x=0 y=0 width=0 height=0 xoffset=0 yoffset=0 xadvance=12 page=0 chnl=15
char id=33 x=244 y=107 width=8 height=30 xoffset=4 yoffset=0 xadvance=15 page=0 chnl=15
`;

describe('bitmapFontTextParser', () =>
{
    it('should parse text chars, if no letter or char property is present', async () =>
    {
        const parsedText = bitmapFontTextParser.parse(rawFontString);

        expect(parsedText.chars['!']).toEqual({
            id: 33,
            page: 0,
            x: 244,
            y: 107,
            width: 8,
            height: 30,
            xOffset: 4,
            yOffset: 0,
            xAdvance: 15,
            kerning: {}
        });
    });
});
