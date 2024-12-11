import { HTMLTextStyle } from '../HTMLTextStyle';
import { textStyleToCSS } from '../utils/textStyleToCSS';

function formatCSSString(cssString: string)
{
    return cssString
        .replace(/\s+/g, ' ') // Replace multiple white spaces with a single space
        .replace(/\s*;\s*/g, '; ') // Normalize spaces around semicolons
        .replace(/\s*:\s*/g, ': ') // Normalize spaces around colons
        .trim(); // Remove leading and trailing white spaces
}

describe('textStyleToCSS', () =>
{
    it('should extract css correctly', async () =>
    {
        const css = textStyleToCSS(new HTMLTextStyle({
            fontFamily: 'Arial',
            fontStyle: 'normal',
            fontWeight: 'normal',
        }));

        const expected = `div
            {
                color: #000000;
                font-size: 26px;
                font-family: Arial;
                font-weight: normal;
                font-style: normal;
                font-variant: normal;
                letter-spacing: 0px;
                text-align: left;padding: 0px;
                white-space: pre
            }`;

        expect(formatCSSString(css)).toBe(formatCSSString(expected));
    });

    it('should extract css correctly if there are tagStyles', async () =>
    {
        const css = textStyleToCSS(new HTMLTextStyle({
            fontFamily: 'Cargo',
            fontStyle: 'normal',
            fontWeight: 'normal',
            tagStyles: {
                comic: {
                    fontFamily: 'Comic Sans',
                    fontSize: 20,
                },
            }
        }));

        const expected = `div
            {
                color: #000000;
                font-size: 26px;
                font-family: Cargo;
                font-weight: normal;
                font-style: normal;
                font-variant: normal;
                letter-spacing: 0px;
                text-align: left;
                padding: 0px;
                white-space: pre
            }
            comic {
                font-family: Comic Sans;
                font-size: 20px
            }`;

        expect(formatCSSString(css)).toBe(formatCSSString(expected));
    });
});
