'use strict';

describe('PIXI.TextStyle', function ()
{
    it('reset reverts style to default', function ()
    {
        const textStyle = new PIXI.TextStyle();
        const defaultFontSize = textStyle.fontSize;

        textStyle.fontSize = 1000;

        expect(textStyle.fontSize).to.equal(1000);
        textStyle.reset();
        expect(textStyle.fontSize).to.equal(defaultFontSize);
    });

    it('should clone correctly', function ()
    {
        const textStyle = new PIXI.TextStyle({ fontSize: 1000 });

        const clonedTextStyle = textStyle.clone();

        expect(textStyle.fontSize).to.equal(1000);
        expect(clonedTextStyle.fontSize).to.equal(textStyle.fontSize);
    });

    it('should assume pixel fonts', function ()
    {
        const style = new PIXI.TextStyle({ fontSize: 72 });
        const font = style.toFontString();

        expect(font).to.be.a.string;
        expect(font).to.have.string(' 72px ');
    });

    it('should handle multiple fonts as array', function ()
    {
        const style = new PIXI.TextStyle({
            fontFamily: ['Georgia', 'Arial', 'sans-serif'],
        });

        expect(style.toFontString()).to.have.string('"Georgia","Arial","sans-serif"');
    });

    it('should handle multiple fonts as string', function ()
    {
        const style = new PIXI.TextStyle({
            fontFamily: 'Georgia, "Arial", sans-serif',
        });

        expect(style.toFontString()).to.have.string('"Georgia","Arial","sans-serif"');
    });
});
