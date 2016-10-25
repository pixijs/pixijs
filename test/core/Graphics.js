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
        it('should return correct bounds - north', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(0, 10);

            expect(graphics.width).to.be.below(1.00001);
            expect(graphics.width).to.be.above(0.99999);
            expect(graphics.height).to.be.equals(10);
        });

        it('should return correct bounds - south', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(0, -10);

            expect(graphics.width).to.be.below(1.00001);
            expect(graphics.width).to.be.above(0.99999);
            expect(graphics.height).to.be.equals(10);
        });

        it('should return correct bounds - east', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(10, 0);

            expect(graphics.height).to.be.equals(1);
            expect(graphics.width).to.be.equals(10);
        });

        it('should return correct bounds - west', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(-10, 0);

            expect(graphics.height).to.be.above(0.9999);
            expect(graphics.height).to.be.below(1.0001);
            expect(graphics.width).to.be.equals(10);
        });

        it('should return correct bounds when stacked with circle', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.beginFill(0xFF0000);
            graphics.drawCircle(50, 50, 50);
            graphics.endFill();

            expect(graphics.width).to.be.equals(100);
            expect(graphics.height).to.be.equals(100);

            graphics.lineStyle(20, 0);
            graphics.moveTo(25, 50);
            graphics.lineTo(75, 50);

            expect(graphics.width).to.be.equals(100);
            expect(graphics.height).to.be.equals(100);
        });

        it('should return correct bounds when square', () =>
        {
            const graphics = new PIXI.Graphics();

            graphics.lineStyle(20, 0, 0.5);
            graphics.moveTo(10, 10);
            graphics.lineTo(50, 10);
            graphics.lineTo(50, 50);
            graphics.lineTo(10, 50);
            graphics.lineTo(10, 10);

            expect(graphics.width).to.be.equals(50);
            expect(graphics.height).to.be.equals(50);
        });
    });
});
