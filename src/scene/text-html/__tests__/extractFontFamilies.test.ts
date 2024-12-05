import { HTMLTextStyle } from '../HTMLTextStyle';
import { extractFontFamilies } from '../utils/extractFontFamilies';

describe('extractFontFamilies', () =>
{
    it('should extract font family correctly if embedded in the text string', async () =>
    {
        const families = extractFontFamilies(
            'Hello<br /><span style="font-family:Cabin">World<span>',
            new HTMLTextStyle({
                fontFamily: 'Arial',
            })
        );

        expect(families).toEqual(['Arial', 'Cabin']);
    });

    it('should extract multiple font families', async () =>
    {
        const families = extractFontFamilies(
            'Hello World',
            new HTMLTextStyle({
                fontFamily: ['Arial', 'Baskerville'],
            })
        );

        expect(families).toEqual(['Arial', 'Baskerville']);
    });

    it('should not return duplicate fonts', async () =>
    {
        const families = extractFontFamilies(
            'Hello<br /><span style="font-family:Cabin">World<span><span style="font-family:Cabin">Again</span>',
            new HTMLTextStyle({
                fontFamily: 'Arial',
            })
        );

        expect(families).toEqual(['Arial', 'Cabin']);
    });

    it('should extract font string correctly if embedded in the text string', async () =>
    {
        const families = extractFontFamilies(
            'Hello<br /><comic>World</comic>',
            new HTMLTextStyle({
                fontFamily: 'Arial',
                tagStyles: {
                    comic: {
                        fontFamily: 'Comic Sans',
                    },
                }
            })
        );

        expect(families).toEqual(['Arial', 'Comic Sans']);
    });

    it('should extract font string correctly if there is full house', async () =>
    {
        const families = extractFontFamilies(
            'Hello<br /><comic>World</comic><span style="font-family:Cabin">World<span>',
            new HTMLTextStyle({
                fontFamily: 'Arial',
                tagStyles: {
                    comic: {
                        fontFamily: 'Comic Sans',
                    },
                    bomb: {
                        fontFamily: 'Comic Sans',
                    },
                }
            })
        );

        expect(families).toEqual(['Arial', 'Cabin', 'Comic Sans']);
    });
});
