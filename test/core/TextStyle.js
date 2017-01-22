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
});
