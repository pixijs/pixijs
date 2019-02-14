// const MockPointer = require('../interaction/MockPointer');
const { Renderer, BatchRenderer } = require('@pixi/core');
const { Graphics, GRAPHICS_CURVES } = require('../');
const { BLEND_MODES } = require('@pixi/constants');
const { Point } = require('@pixi/math');
const { skipHello } = require('@pixi/utils');

Renderer.registerPlugin('batch', BatchRenderer);

skipHello();

describe('PIXI.Graphics', function ()
{
    describe('constructor', function ()
    {
        it('should set defaults', function ()
        {
            const graphics = new Graphics();

            expect(graphics.fill.color).to.be.equals(0xFFFFFF);
            expect(graphics.fill.alpha).to.be.equals(1);
            expect(graphics.line.width).to.be.equals(0);
            expect(graphics.line.color).to.be.equals(0);
            expect(graphics.tint).to.be.equals(0xFFFFFF);
            expect(graphics.blendMode).to.be.equals(BLEND_MODES.NORMAL);
        });
    });

    describe('lineTo', function ()
    {
        it('should return correct bounds - north', function ()
        {
            const graphics = new Graphics();

            graphics.lineStyle(1);
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);

            expect(graphics.width).to.be.below(1.00001);
            expect(graphics.width).to.be.above(0.99999);
            expect(graphics.height).to.be.equals(10);
        });

        it('should return correct bounds - south', function ()
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(0, -10);

            expect(graphics.width).to.be.below(1.00001);
            expect(graphics.width).to.be.above(0.99999);
            expect(graphics.height).to.be.equals(10);
        });

        it('should return correct bounds - east', function ()
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(10, 0);

            expect(graphics.height).to.be.equals(1);
            expect(graphics.width).to.be.equals(10);
        });

        it('should return correct bounds - west', function ()
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(-10, 0);

            expect(graphics.height).to.be.above(0.9999);
            expect(graphics.height).to.be.below(1.0001);
            expect(graphics.width).to.be.equals(10);
        });

        it('should return correct bounds when stacked with circle', function ()
        {
            const graphics = new Graphics();

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

        it('should return correct bounds when square', function ()
        {
            const graphics = new Graphics();

            graphics.lineStyle(20, 0, 0.5);
            graphics.moveTo(0, 0);
            graphics.lineTo(50, 0);
            graphics.lineTo(50, 50);
            graphics.lineTo(0, 50);
            graphics.lineTo(0, 0);

            expect(graphics.width).to.be.equals(70);
            expect(graphics.height).to.be.equals(70);
        });

        it('should ignore duplicate calls', function ()
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(10, 0);

            expect(graphics.currentPath.points).to.deep.equal([0, 0, 10, 0]);
        });
    });

    describe('containsPoint', function ()
    {
        it('should return true when point inside', function ()
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return false when no fill', function ()
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return false with hole', function ()
        {
            const point1 = new Point(1, 1);
            const point2 = new Point(5, 5);
            const graphics = new Graphics();

            graphics.beginFill(0)
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .beginHole()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .endHole();

            expect(graphics.containsPoint(point1)).to.be.true;
            expect(graphics.containsPoint(point2)).to.be.false;
        });
    });

    describe('chaining', function ()
    {
        it('should chain draw commands', function ()
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            const graphics = new Graphics().beginFill(0xFF3300)
                .lineStyle(4, 0xffd900, 1)
                .moveTo(50, 50)
                .lineTo(250, 50)
                .endFill()
                .drawRoundedRect(150, 450, 300, 100, 15)
                .beginHole()
                .endHole()
                .quadraticCurveTo(1, 1, 1, 1)
                .bezierCurveTo(1, 1, 1, 1)
                .arcTo(1, 1, 1, 1, 1)
                .arc(1, 1, 1, 1, 1, false)
                .drawRect(1, 1, 1, 1)
                .drawRoundedRect(1, 1, 1, 1, 0.1)
                .drawCircle(1, 1, 20)
                .drawEllipse(1, 1, 1, 1)
                .drawPolygon([1, 1, 1, 1, 1, 1])
                .drawStar(1, 1, 1, 1, 1, 1)
                .clear();

            expect(graphics).to.be.not.null;
        });
    });

    describe('arc', function ()
    {
        it('should draw an arc', function ()
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            expect(() => graphics.arc(100, 30, 20, 0, Math.PI)).to.not.throw();

            expect(graphics.currentPath).to.be.not.null;
        });

        it('should not throw with other shapes', function ()
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            const graphics = new Graphics();

            // set a fill and line style
            graphics.beginFill(0xFF3300);
            graphics.lineStyle(4, 0xffd900, 1);

            // draw a shape
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);
            graphics.endFill();

            graphics.lineStyle(2, 0xFF00FF, 1);
            graphics.beginFill(0xFF00BB, 0.25);
            graphics.drawRoundedRect(150, 450, 300, 100, 15);
            graphics.endFill();

            graphics.beginFill();
            graphics.lineStyle(4, 0x00ff00, 1);

            expect(() => graphics.arc(300, 100, 20, 0, Math.PI)).to.not.throw();
        });

        it('should do nothing when startAngle and endAngle are equal', function ()
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.arc(0, 0, 10, 0, 0);

            expect(graphics.currentPath).to.be.null;
        });

        it('should do nothing if sweep equals zero', function ()
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.arc(0, 0, 10, 10, 10);

            expect(graphics.currentPath).to.be.null;
        });
    });

    describe('_calculateBounds', function ()
    {
        it('should only call updateLocalBounds once', function ()
        {
            const graphics = new Graphics();
            const spy = sinon.spy(graphics.geometry, 'calculateBounds');

            graphics._calculateBounds();

            expect(spy).to.have.been.calledOnce;

            graphics._calculateBounds();

            expect(spy).to.have.been.calledOnce;
        });
    });

    describe('drawCircle', function ()
    {
        it('should have no gaps in line border', function ()
        {
            const renderer = new Renderer(200, 200, {});

            try
            {
                const graphics = new Graphics();

                graphics.lineStyle(15, 0x8FC7E6);
                graphics.drawCircle(100, 100, 30);
                renderer.render(graphics);
                const points = graphics.geometry.graphicsData[0].points;

                const firstX = points[0];
                const firstY = points[1];

                const lastX = points[points.length - 2];
                const lastY = points[points.length - 1];

                expect(firstX).to.equals(lastX);
                expect(firstY).to.equals(lastY);
            }
            finally
            {
                renderer.destroy();
            }
        });
    });

    describe('startPoly', function ()
    {
        it('should fill two triangles', function ()
        {
            const graphics = new Graphics();

            graphics.beginFill(0xffffff, 1.0);
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);

            graphics.moveTo(250, 50);
            graphics.lineTo(450, 50);
            graphics.lineTo(300, 100);
            graphics.lineTo(250, 50);
            graphics.endFill();

            const data = graphics.geometry.graphicsData;

            expect(data.length).to.equals(2);
            expect(data[0].shape.points).to.eql([50, 50, 250, 50, 100, 100, 50, 50]);
            expect(data[1].shape.points).to.eql([250, 50, 450, 50, 300, 100, 250, 50]);
        });

        it('should honor lineStyle break', function ()
        {
            const graphics = new Graphics();

            graphics.lineStyle(1.0, 0xffffff);
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineStyle(2.0, 0xffffff);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);
            graphics.lineStyle(0.0);

            const data = graphics.geometry.graphicsData;

            expect(data.length).to.equals(2);
            expect(data[0].shape.points).to.eql([50, 50, 250, 50]);
            expect(data[1].shape.points).to.eql([250, 50, 100, 100, 50, 50]);
        });
    });

    describe('should support adaptive curves', function ()
    {
        const defMode = GRAPHICS_CURVES.adaptive;
        const defMaxLen = GRAPHICS_CURVES.maxLength;
        const myMaxLen = GRAPHICS_CURVES.maxLength = 1.0;
        const graphics = new Graphics();

        GRAPHICS_CURVES.adaptive = true;

        graphics.beginFill(0xffffff, 1.0);
        graphics.moveTo(610, 500);
        graphics.quadraticCurveTo(600, 510, 590, 500);
        graphics.endFill();

        const pointsLen = graphics.geometry.graphicsData[0].shape.points.length / 2;
        const arcLen = Math.PI / 2 * Math.sqrt(200);
        const estimate = Math.ceil(arcLen / myMaxLen) + 1;

        expect(pointsLen).to.be.closeTo(estimate, 2.0);

        GRAPHICS_CURVES.adaptive = defMode;
        GRAPHICS_CURVES.maxLength = defMaxLen;
    });
});
