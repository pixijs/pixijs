import { TextStyle } from '@pixi/text';

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
        const style = new TextStyle({ fontSize: 72 });
        const font = style.toFontString();

        expect(font).toBeString();
        expect(font).toContain(' 72px ');
    });

    it('should handle multiple fonts as array', () =>
    {
        const style = new TextStyle({
            fontFamily: ['Georgia', 'Arial', 'sans-serif'],
        });

        expect(style.toFontString()).toContain('"Georgia","Arial",sans-serif');
    });

    it('should handle multiple fonts as string', () =>
    {
        const style = new TextStyle({
            fontFamily: 'Georgia, "Arial", sans-serif',
        });

        expect(style.toFontString()).toContain('"Georgia","Arial",sans-serif');
    });

    it('should not shared array / object references between different instances', () =>
    {
        const defaultStyle = new TextStyle();
        const style = new TextStyle();

        expect(defaultStyle.fillGradientStops.length).toEqual(style.fillGradientStops.length);
        style.fillGradientStops.push(0);
        expect(defaultStyle.fillGradientStops.length).not.toEqual(style.fillGradientStops.length);
    });

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
            const style = new TextStyle({
                fontFamily: ['Georgia', 'Arial', genericFamily],
            });

            // Create regex from template substituting target family
            const regex = new RegExp(incorrectRegexTemplate.replace('FAMILY', genericFamily));
            const result = style.toFontString().match(regex);

            expect(result).toBeNull();
        }
    });
});
