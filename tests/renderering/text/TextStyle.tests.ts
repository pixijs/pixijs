/* eslint-disable jest/no-commented-out-tests */
import { TextStyle } from '../../../src/scene/text/TextStyle';
import { HTMLTextStyle } from '../../../src/scene/text-html/HtmlTextStyle';

describe('TextStyle', () =>
{
    it('reset reverts style to default', () =>
    {
        const textStyle = new TextStyle();
        const defaultFontSize = textStyle.fontSize;

        textStyle.fontSize = 1000;

        expect(textStyle.fontSize).toEqual(1000);
        textStyle.reset();
        expect(textStyle.fontSize).toEqual(defaultFontSize);
    });

    it('should clone correctly', () =>
    {
        const textStyle = new TextStyle({ fontSize: 1000 });

        const clonedTextStyle = textStyle.clone();

        expect(textStyle.fontSize).toEqual(1000);
        expect(clonedTextStyle.fontSize).toEqual(textStyle.fontSize);
    });

    it('should assume pixel fonts', () =>
    {
        // note: had to convert to HTMLTextStyle since textStyleToCSS only supports it
        const style = new HTMLTextStyle({ fontSize: 72 });
        const font = style.cssStyle;

        expect(font).toBeString();
        expect(font).toContain('font-size: 72px');
    });

    it('should handle multiple fonts as array', () =>
    {
        const fontFamily = ['Georgia', 'Arial', 'sans-serif'];
        const style = new HTMLTextStyle({
            fontFamily,
        });

        expect(style.cssStyle).toContain(fontFamily.join(','));
    });

    it('should handle multiple fonts as string', () =>
    {
        const style = new HTMLTextStyle({
            fontFamily: 'Georgia,"Arial",sans-serif',
        });

        expect(style.cssStyle).toContain(style.fontFamily);
    });

    // note: gradients?
    // it('should not shared array / object references between different instances', () =>
    // {
    //     const defaultStyle = new TextStyle();
    //     const style = new TextStyle();

    //     expect(defaultStyle.fillGradientStops.length).toEqual(style.fillGradientStops.length);
    //     style.fillGradientStops.push(0);
    //     expect(defaultStyle.fillGradientStops.length).not.toEqual(style.fillGradientStops.length);
    // });

    it('should not quote generic font families when calling toFontString', () =>
    {
        // Should match the list in TextStyle
        const genericFontFamilies = [
            'serif',
            'sans-serif',
            'monospace',
            'cursive',
            'fantasy',
            'system-ui',
        ];

        // Regex to find any of the generic families surrounded by either type of quote mark
        const incorrectRegexTemplate = '["\']FAMILY["\']';

        for (const genericFamily of genericFontFamilies)
        {
            const style = new HTMLTextStyle({
                fontFamily: ['Georgia', 'Arial', genericFamily],
            });

            // Create regex from template substituting target family
            const regex = new RegExp(incorrectRegexTemplate.replace('FAMILY', genericFamily));
            const result = style.cssStyle.match(regex);

            expect(result).toBeNull();
        }
    });
});
