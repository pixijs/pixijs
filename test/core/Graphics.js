'use strict';

describe('PIXI.Graphics', () =>
{
    describe('constructor', () =>
    {
        it('should set defaults', () =>
        {
            const graphics = new PIXI.Graphics();

            expect(graphics.fillAlpha).to.be.equals(1);
            expect(graphics.lineWidth).to.be.equals(0);
            expect(graphics.lineColor).to.be.equals(0);
            expect(graphics.tint).to.be.equals(0xFFFFFF);
            expect(graphics.blendMode).to.be.equals(PIXI.BLEND_MODES.NORMAL);
        });
    });

    describe('lineTo', () =>
    {
        it('should return the correct bounds', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(0, 10);

            expect(graphics.width).to.be.equals(1);
            expect(graphics.height).to.be.equals(10);
        });
    });
});
