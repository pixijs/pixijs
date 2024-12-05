/* eslint-disable max-len */
import { bitmapFontXMLStringParser } from '../bitmapFontXMLStringParser';

const rawFontString = `<?xml version="1.0"?>
<font>
  <info face="ERAMv1_1" size="12" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="0" aa="0" padding="0,0,0,0" spacing="0,0" outline="0"/>
  <common lineHeight="12" base="11" scaleW="1010" scaleH="12" pages="1" packed="0" alphaChnl="0" redChnl="4" greenChnl="4" blueChnl="4"/>
  <pages>
    <page id="0" file="eram-text-1.png" />
  </pages>
  <chars count="75">
    <char id="32" x="0" y="0" width="10" height="12" xoffset="0" yoffset="0" xadvance="9" page="0" chnl="15" />
    <char id="33" x="10" y="0" width="10" height="12" xoffset="0" yoffset="0" xadvance="9" page="0" chnl="15" />
  </chars>
</font>`;

describe('bitmapFontXMLStringParser', () =>
{
    it('should parse text chars, if no letter or char property is present', async () =>
    {
        const parsedText = bitmapFontXMLStringParser.parse(rawFontString);

        expect(parsedText.chars['!']).toEqual({
            id: 33,
            page: 0,
            x: 10,
            y: 0,
            width: 10,
            height: 12,
            xOffset: 0,
            yOffset: 0,
            xAdvance: 9,
            kerning: {}
        });
    });
});
