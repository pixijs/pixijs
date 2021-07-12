const { TextStyle } = require('../');

describe('PIXI.TextStyle', function ()
{
    it('reset reverts style to default', function ()
    {
        const textStyle = new TextStyle();
        const defaultFontSize = textStyle.fontSize;

        textStyle.fontSize = 1000;

        expect(textStyle.fontSize).to.equal(1000);
        textStyle.reset();
        expect(textStyle.fontSize).to.equal(defaultFontSize);
    });

    it('should clone correctly', function ()
    {
        const textStyle = new TextStyle({ fontSize: 1000 });

        const clonedTextStyle = textStyle.clone();

        expect(textStyle.fontSize).to.equal(1000);
        expect(clonedTextStyle.fontSize).to.equal(textStyle.fontSize);
    });

    it('should assume pixel fonts', function ()
    {
        const style = new TextStyle({ fontSize: 72 });
        const font = style.toFontString();

        expect(font).to.be.a.string;
        expect(font).to.have.string(' 72px ');
    });

    it('should handle multiple fonts as array', function ()
    {
        const style = new TextStyle({
            fontFamily: ['Georgia', 'Arial', 'sans-serif'],
        });

        expect(style.toFontString()).to.have.string('"Georgia","Arial",sans-serif');
    });

    it('should handle multiple fonts as string', function ()
    {
        const style = new TextStyle({
            fontFamily: 'Georgia, "Arial", sans-serif',
        });

        expect(style.toFontString()).to.have.string('"Georgia","Arial",sans-serif');
    });

    it('should not shared array / object references between different instances', function ()
    {
        const defaultStyle = new TextStyle();
        const style = new TextStyle();

        expect(defaultStyle.fillGradientStops.length).to.equal(style.fillGradientStops.length);
        style.fillGradientStops.push(0);
        expect(defaultStyle.fillGradientStops.length).to.not.equal(style.fillGradientStops.length);
    });

    it('should not quote generic font families when calling toFontString', function ()
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

            expect(result).to.be.null;
        }
    });
});
