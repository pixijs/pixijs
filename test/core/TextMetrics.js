'use strict';

describe('PIXI.TextMetrics', function ()
{
    it('width should not be greater than wordWrapWidth with breakWords disabled', function ()
    {
        const width = 200;

        const style = new PIXI.TextStyle({
            align: 'center',
            breakWords: false,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
            fill: 0xFF66CC,
            fontFamily: 'Arial',
            fontSize: 20,
            fontStyle: 'italic',
            fontVariant: 'normal',
            fontWeight: 900,
            wordWrap: true,
            wordWrapWidth: width,
            letterSpacing: 4,
        });

        const text = `Pixi.js - The HTML5 Creation Engine.
        Create beautiful digital content with the fastest, most flexible 2D WebGL renderer.`;

        const metrics = PIXI.TextMetrics.measureText(text, style);

        expect(metrics.width).to.be.below(width);
    });

    it('width should not be greater than wordWrapWidth with breakWords enabled', function ()
    {
        const width = 200;

        const style = new PIXI.TextStyle({
            align: 'center',
            breakWords: true,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
            fill: 0xFF66CC,
            fontFamily: 'Arial',
            fontSize: 20,
            fontStyle: 'italic',
            fontVariant: 'normal',
            fontWeight: 900,
            wordWrap: true,
            wordWrapWidth: width,
            letterSpacing: 4,
        });

        const text = `Pixi.js - The HTML5 Creation Engine.
        Create beautiful digital content with the fastest, most flexible 2D WebGL renderer.`;

        const metrics = PIXI.TextMetrics.measureText(text, style);

        expect(metrics.width).to.be.below(width);
    });
});
