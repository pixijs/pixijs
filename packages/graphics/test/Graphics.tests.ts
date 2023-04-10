import { BLEND_MODES, Matrix, Point, Polygon, SHAPES, Texture } from '@pixi/core';
import { FillStyle, Graphics, graphicsUtils, LINE_CAP, LINE_JOIN, LineStyle } from '@pixi/graphics';

const { FILL_COMMANDS, buildLine } = graphicsUtils;

describe('Graphics', () =>
{
    describe('constructor', () =>
    {
        it('should set defaults', () =>
        {
            const graphics = new Graphics();

            expect(graphics.fill.color).toEqual(0xFFFFFF);
            expect(graphics.fill.alpha).toEqual(1);
            expect(graphics.line.width).toEqual(0);
            expect(graphics.line.color).toEqual(0);
            expect(graphics.tint).toEqual(0xFFFFFF);
            expect(graphics.blendMode).toEqual(BLEND_MODES.NORMAL);
        });
    });

    describe('lineStyle', () =>
    {
        it('should support a list of parameters', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(1, 0xff0000, 0.5, 1, true);

            expect(graphics.line.width).toEqual(1);
            expect(graphics.line.color).toEqual(0xff0000);
            expect(graphics.line.alignment).toEqual(1);
            expect(graphics.line.alpha).toEqual(0.5);
            expect(graphics.line.native).toEqual(true);

            graphics.destroy();
        });

        it('should default color to black if texture not present and white if present', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(1);
            expect(graphics.line.color).toEqual(0x0);
            graphics.lineTextureStyle({ texture: Texture.WHITE, width: 1 });
            expect(graphics.line.color).toEqual(0xFFFFFF);
            graphics.destroy();
        });

        it('should support object parameter', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({
                width: 1,
                alpha: 0.5,
                color: 0xff0000,
                alignment: 1,
                native: true,
                cap: LINE_CAP.ROUND,
                join: LINE_JOIN.ROUND,
                miterLimit: 20,
            });

            expect(graphics.line.width).toEqual(1);
            expect(graphics.line.color).toEqual(0xff0000);
            expect(graphics.line.alignment).toEqual(1);
            expect(graphics.line.alpha).toEqual(0.5);
            expect(graphics.line.native).toEqual(true);
            expect(graphics.line.visible).toEqual(true);
            expect(graphics.line.cap).toEqual(LINE_CAP.ROUND);
            expect(graphics.line.join).toEqual(LINE_JOIN.ROUND);
            expect(graphics.line.miterLimit).toEqual(20);

            graphics.lineStyle();

            expect(graphics.line.width).toEqual(0);
            expect(graphics.line.color).toEqual(0);
            expect(graphics.line.alignment).toEqual(0.5);
            expect(graphics.line.alpha).toEqual(1);
            expect(graphics.line.native).toEqual(false);
            expect(graphics.line.visible).toEqual(false);
            expect(graphics.line.cap).toEqual(LINE_CAP.BUTT);
            expect(graphics.line.join).toEqual(LINE_JOIN.MITER);
            expect(graphics.line.miterLimit).toEqual(10);

            graphics.destroy();
        });

        it('should accept other color sources', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ color: 'red', width: 1 });

            expect(graphics.line.color).toEqual(0xFF0000);
            expect(graphics.line.alpha).toEqual(1);

            graphics.destroy();
        });

        it('should accept other color sources with alpha', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ color: '#ff000080', width: 1 });

            expect(graphics.line.color).toEqual(0xFF0000);
            expect(graphics.line.alpha).toEqual(0.5);

            graphics.destroy();
        });

        it('should accept other color sources with alpha override', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ color: '#ff000080', alpha: 1, width: 1 });

            expect(graphics.line.color).toEqual(0xFF0000);
            expect(graphics.line.alpha).toEqual(1);

            graphics.destroy();
        });
    });

    describe('lineTextureStyle', () =>
    {
        it('should support object parameter', () =>
        {
            const graphics = new Graphics();
            const matrix = new Matrix();
            const texture = Texture.WHITE;

            graphics.lineTextureStyle({
                width: 1,
                alpha: 0.5,
                color: 0xff0000,
                matrix,
                texture,
                alignment: 1,
                native: true,
            });

            expect(graphics.line.width).toEqual(1);
            expect(graphics.line.texture).toEqual(texture);
            expect(graphics.line.matrix).toBeTruthy();
            expect(graphics.line.color).toEqual(0xff0000);
            expect(graphics.line.alignment).toEqual(1);
            expect(graphics.line.alpha).toEqual(0.5);
            expect(graphics.line.native).toEqual(true);
            expect(graphics.line.visible).toEqual(true);

            graphics.lineTextureStyle();

            expect(graphics.line.width).toEqual(0);
            expect(graphics.line.texture).toEqual(Texture.WHITE);
            expect(graphics.line.matrix).toEqual(null);
            expect(graphics.line.color).toEqual(0);
            expect(graphics.line.alignment).toEqual(0.5);
            expect(graphics.line.alpha).toEqual(1);
            expect(graphics.line.native).toEqual(false);
            expect(graphics.line.visible).toEqual(false);

            graphics.destroy();
        });
    });

    describe('beginTextureFill', () =>
    {
        it('should pass texture to batches', () =>
        {
            const graphics = new Graphics();
            const canvas1 = document.createElement('canvas');
            const validTex1 = Texture.from(canvas1);
            const canvas2 = document.createElement('canvas');
            const validTex2 = Texture.from(canvas2);

            canvas1.width = 10;
            canvas1.height = 10;
            canvas2.width = 10;
            canvas2.height = 10;
            validTex1.update();
            validTex2.update();

            graphics.beginTextureFill({ texture: validTex1 });
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture: validTex2 });
            graphics.drawRect(20, 20, 10, 10);

            graphics.geometry.updateBatches();

            const batches = graphics.geometry.batches;

            expect(batches.length).toEqual(2);
            expect(batches[0].style.texture).toEqual(validTex1);
            expect(batches[1].style.texture).toEqual(validTex2);
        });

        it('should accept other color sources', () =>
        {
            const graphics = new Graphics();

            graphics.beginTextureFill({ color: 'red' });

            expect(graphics.fill.color).toEqual(0xFF0000);
            expect(graphics.fill.alpha).toEqual(1);

            graphics.destroy();
        });

        it('should accept other color sources with alpha', () =>
        {
            const graphics = new Graphics();

            graphics.beginTextureFill({ color: '#ff000080' });

            expect(graphics.fill.color).toEqual(0xFF0000);
            expect(graphics.fill.alpha).toEqual(0.5);

            graphics.destroy();
        });

        it('should accept other color sources with alpha override', () =>
        {
            const graphics = new Graphics();

            graphics.beginTextureFill({ color: '#ff000080', alpha: 1 });

            expect(graphics.fill.color).toEqual(0xFF0000);
            expect(graphics.fill.alpha).toEqual(1);

            graphics.destroy();
        });
    });

    describe('utils', () =>
    {
        it('FILL_COMMADS should be filled', () =>
        {
            expect(FILL_COMMANDS).not.toBeNull();

            expect(FILL_COMMANDS[SHAPES.POLY]).not.toBeNull();
            expect(FILL_COMMANDS[SHAPES.CIRC]).not.toBeNull();
            expect(FILL_COMMANDS[SHAPES.ELIP]).not.toBeNull();
            expect(FILL_COMMANDS[SHAPES.RECT]).not.toBeNull();
            expect(FILL_COMMANDS[SHAPES.RREC]).not.toBeNull();
        });

        it('buildLine should execute without throws', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 2, color: 0xff0000 });
            graphics.drawRect(0, 0, 10, 10);

            const geometry = graphics.geometry;
            const data = geometry.graphicsData[0];

            // native = false
            expect(() => { buildLine(data, geometry); }).not.toThrowError();

            data.lineStyle.native = true;
            // native = true
            expect(() => { buildLine(data, geometry); }).not.toThrowError();
        });
    });

    describe('lineTo', () =>
    {
        it('should return correct bounds - north', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);

            expect(graphics.width).toBeCloseTo(1, 0.0001);
            expect(graphics.height).toBeCloseTo(11, 0.0001);
        });

        it('should return correct bounds - south', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.lineTo(0, -10);

            expect(graphics.width).toBeCloseTo(1, 0.0001);
            expect(graphics.height).toBeCloseTo(11, 0.0001);
        });

        it('should return correct bounds - east', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.lineTo(10, 0);

            expect(graphics.height).toBeCloseTo(1, 0.0001);
            expect(graphics.width).toBeCloseTo(11, 0.0001);
        });

        it('should return correct bounds - west', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle({ width: 1, cap: LINE_CAP.SQUARE });
            graphics.lineTo(-10, 0);

            expect(graphics.height).toBeCloseTo(1, 0.0001);
            expect(graphics.width).toBeCloseTo(11, 0.0001);
        });

        it('should return correct bounds when stacked with circle', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0xFF0000);
            graphics.drawCircle(50, 50, 50);
            graphics.endFill();

            expect(graphics.width).toEqual(100);
            expect(graphics.height).toEqual(100);

            graphics.lineStyle(20, 0);
            graphics.moveTo(25, 50);
            graphics.lineTo(75, 50);

            expect(graphics.width).toEqual(100);
            expect(graphics.height).toEqual(100);
        });

        it('should return correct bounds when square', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(20, 0, 0.5);
            graphics.moveTo(0, 0);
            graphics.lineTo(50, 0);
            graphics.lineTo(50, 50);
            graphics.lineTo(0, 50);
            graphics.lineTo(0, 0);

            expect(graphics.width).toEqual(70);
            expect(graphics.height).toEqual(70);
        });

        it('should ignore duplicate calls', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(10, 0);

            expect(graphics.currentPath.points).toEqual([0, 0, 10, 0]);
        });

        it('should not have miter join on 180 degree corner', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 1, join: LINE_JOIN.MITER });
            graphics.moveTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);

            expect(graphics.width).toBeCloseTo(10, 0.0001);
            expect(graphics.height).toBeCloseTo(1, 0.0001);
        });

        it('should not have bevel join on 180 degree corner', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 1, join: LINE_JOIN.BEVEL });
            graphics.moveTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);

            expect(graphics.width).toBeCloseTo(10, 0.0001);
            expect(graphics.height).toBeCloseTo(1, 0.0001);
        });

        it('should have round join on 180 degree corner', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle({ width: 1, join: LINE_JOIN.ROUND });
            graphics.moveTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);

            expect(graphics.width).toBeCloseTo(10.5, 0.0001);
            expect(graphics.height).toBeCloseTo(1, 0.0001);
        });
    });

    describe('containsPoint', () =>
    {
        it('should return true when point inside a standard shape', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside a standard shape', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).toBe(false);
        });

        it('should return true when point inside just lines', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginFill(0);
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);
            graphics.lineTo(10, 10);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);
            graphics.closePath();

            expect(graphics.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside just lines', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);
            graphics.lineTo(10, 10);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);
            graphics.closePath();

            expect(graphics.containsPoint(point)).toBe(false);
        });

        it('should return false when no fill', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).toBe(false);
        });

        it('should return false with hole', () =>
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

            expect(graphics.containsPoint(point1)).toBe(true);
            expect(graphics.containsPoint(point2)).toBe(false);
        });

        it('should handle extra shapes in holes', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0)
                .moveTo(3, 3)
                .lineTo(5, 3)
                .lineTo(5, 5)
                .lineTo(3, 5)
                .beginFill(0)
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .beginHole()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .endHole()
                .beginFill(0)
                .moveTo(5, 5)
                .lineTo(7, 5)
                .lineTo(7, 7)
                .lineTo(5, 7)
                .endFill();

            expect(graphics.containsPoint(new Point(1, 1))).toBe(true);
            expect(graphics.containsPoint(new Point(4, 4))).toBe(true);
            expect(graphics.containsPoint(new Point(4, 6))).toBe(false);
            expect(graphics.containsPoint(new Point(6, 4))).toBe(false);
            expect(graphics.containsPoint(new Point(6, 6))).toBe(true);
        });

        it('should take a matrix into account', () =>
        {
            const g = new Graphics();
            const m = new Matrix();

            g.beginFill(0xffffff, 1.0);
            m.identity().translate(0, 100);
            g.setMatrix(m.clone());
            g.drawRect(0, 0, 10, 10);
            m.identity().translate(200, 0);
            g.setMatrix(m.clone());
            g.drawRect(0, 0, 10, 10);
            g.setMatrix(null);
            g.drawRect(30, 40, 10, 10);

            expect(g.containsPoint(new Point(5, 5))).toBe(false);
            expect(g.containsPoint(new Point(5, 105))).toBe(true);
            expect(g.containsPoint(new Point(205, 5))).toBe(true);
            expect(g.containsPoint(new Point(35, 45))).toBe(true);
        });
    });

    describe('chaining', () =>
    {
        it('should chain draw commands', () =>
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
                .bezierCurveTo(1, 1, 1, 1, 1, 1)
                .arcTo(1, 1, 1, 1, 1)
                .arc(1, 1, 1, 1, 1, false)
                .drawRect(1, 1, 1, 1)
                .drawRoundedRect(1, 1, 1, 1, 0.1)
                .drawCircle(1, 1, 20)
                .drawEllipse(1, 1, 1, 1)
                .drawPolygon([1, 1, 1, 1, 1, 1])
                .clear();

            expect(graphics).not.toBeNull();
        });
    });

    describe('drawPolygon', () =>
    {
        let numbers: number[];
        let points: Point[];
        let poly: Polygon;

        beforeAll(() =>
        {
            numbers = [0, 0, 10, 10, 20, 20];
            points = [new Point(0, 0), new Point(10, 10), new Point(20, 20)];
            poly = new Polygon(points);
        });

        it('should support polygon argument', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            graphics.drawPolygon(poly);

            expect(graphics.geometry.graphicsData[0]).not.toBeNull();

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).toEqual(numbers);
        });

        it('should support array of numbers', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            graphics.drawPolygon(numbers);

            expect(graphics.geometry.graphicsData[0]).not.toBeNull();

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).toEqual(numbers);
        });

        it('should support array of points', () =>
        {
            const graphics = new Graphics();

            graphics.drawPolygon(points);

            expect(graphics.geometry.graphicsData[0]).not.toBeNull();

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).toEqual(numbers);
        });

        it('should support flat arguments of numbers', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            graphics.drawPolygon(...numbers);

            expect(graphics.geometry.graphicsData[0]).not.toBeNull();

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).toEqual(numbers);
        });

        it('should support flat arguments of points', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            graphics.drawPolygon(...points);

            expect(graphics.geometry.graphicsData[0]).not.toBeNull();

            const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

            expect(result).toEqual(numbers);
        });
    });

    describe('drawing same rectangle with drawPolygon and drawRect', () =>
    {
        let width: number;
        let height: number;
        let points: Point[];

        beforeAll(() =>
        {
            width = 100;
            height = 100;
            points = [
                new Point(0, 0),
                new Point(width, 0),
                new Point(width, height),
                new Point(0, height)
            ];
        });

        it('should have the same bounds for any line alignment value', () =>
        {
            const polyGraphics = new Graphics();
            const rectGraphics = new Graphics();

            const lineWidth = 10;
            const lineAlignments = [0, 0.2, 0.5, 1];

            lineAlignments.forEach((lineAlignment) =>
            {
                polyGraphics.clear();
                rectGraphics.clear();

                polyGraphics.beginFill(0x0000ff);
                polyGraphics.lineStyle(lineWidth, 0xff0000, 1, lineAlignment);
                polyGraphics.drawPolygon(points);
                polyGraphics.endFill();

                rectGraphics.beginFill(0x0000ff);
                rectGraphics.lineStyle(lineWidth, 0xff0000, 1, lineAlignment);
                rectGraphics.drawRect(0, 0, width, height);
                rectGraphics.endFill();

                const polyBounds = polyGraphics.getBounds();
                const rectBounds = rectGraphics.getBounds();

                expect(polyBounds.x).toEqual(rectBounds.x);
                expect(polyBounds.y).toEqual(rectBounds.y);
                expect(polyBounds.width).toEqual(rectBounds.width);
                expect(polyBounds.height).toEqual(rectBounds.height);
            });
        });
    });

    describe('arc', () =>
    {
        it('should draw an arc', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            expect(() => graphics.arc(100, 30, 20, 0, Math.PI)).not.toThrowError();

            expect(graphics.currentPath).not.toBeNull();
        });

        it('should not throw with other shapes', () =>
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

            expect(() => graphics.arc(300, 100, 20, 0, Math.PI)).not.toThrowError();
        });

        it('should do nothing when startAngle and endAngle are equal', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            graphics.arc(0, 0, 10, 0, 0);

            expect(graphics.currentPath).toBeNull();
        });

        it('should do nothing if sweep equals zero', () =>
        {
            const graphics = new Graphics();

            expect(graphics.currentPath).toBeNull();

            graphics.arc(0, 0, 10, 10, 10);

            expect(graphics.currentPath).toBeNull();
        });
    });

    describe('_calculateBounds', () =>
    {
        it('should only call updateLocalBounds once when not empty', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();

            const spy = jest.spyOn(graphics.geometry, 'calculateBounds' as any);

            graphics['_calculateBounds']();

            expect(spy).toHaveBeenCalledOnce();

            graphics['_calculateBounds']();

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should not call updateLocalBounds when empty', () =>
        {
            const graphics = new Graphics();

            const spy = jest.spyOn(graphics.geometry, 'calculateBounds' as any);

            graphics['_calculateBounds']();

            expect(spy).not.toBeCalled();

            graphics['_calculateBounds']();

            expect(spy).not.toBeCalled();
        });
    });

    describe('getBounds', () =>
    {
        it('should use getBounds without stroke', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0x0).drawRect(10, 20, 100, 200);

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(10);
            expect(y).toEqual(20);
            expect(width).toEqual(100);
            expect(height).toEqual(200);
        });

        it('should use getBounds with stroke', () =>
        {
            const graphics = new Graphics();

            graphics
                .lineStyle(4, 0xff0000)
                .beginFill(0x0)
                .drawRect(10, 20, 100, 200);

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(8);
            expect(y).toEqual(18);
            expect(width).toEqual(104);
            expect(height).toEqual(204);
        });

        it('should be zero for empty Graphics', () =>
        {
            const graphics = new Graphics();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(0);
            expect(y).toEqual(0);
            expect(width).toEqual(0);
            expect(height).toEqual(0);
        });

        it('should be zero after clear', () =>
        {
            const graphics = new Graphics();

            graphics
                .lineStyle(4, 0xff0000)
                .beginFill(0x0)
                .drawRect(10, 20, 100, 200)
                .clear();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(0);
            expect(y).toEqual(0);
            expect(width).toEqual(0);
            expect(height).toEqual(0);
        });

        it('should be equal of childs bounds when empty', () =>
        {
            const graphics = new Graphics();
            const child = new Graphics();

            child
                .beginFill(0x0)
                .drawRect(10, 20, 100, 200);

            graphics.addChild(child);

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(10);
            expect(y).toEqual(20);
            expect(width).toEqual(100);
            expect(height).toEqual(200);
        });
    });

    describe('startPoly', () =>
    {
        it('should fill two triangles', () =>
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

            expect(data.length).toEqual(2);
            expect((data[0].shape as Polygon).points).toEqual([50, 50, 250, 50, 100, 100, 50, 50]);
            expect((data[1].shape as Polygon).points).toEqual([250, 50, 450, 50, 300, 100, 250, 50]);
        });

        it('should honor lineStyle break', () =>
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

            expect(data.length).toEqual(2);
            expect((data[0].shape as Polygon).points).toEqual([50, 50, 250, 50]);
            expect((data[1].shape as Polygon).points).toEqual([250, 50, 100, 100, 50, 50]);
        });
    });

    describe('should support adaptive curves', () =>
    {
        const defMode = Graphics.curves.adaptive;
        const defMaxLen = Graphics.curves.maxLength;
        const myMaxLen = Graphics.curves.maxLength = 1.0;
        const graphics = new Graphics();

        Graphics.curves.adaptive = true;

        graphics.beginFill(0xffffff, 1.0);
        graphics.moveTo(610, 500);
        graphics.quadraticCurveTo(600, 510, 590, 500);
        graphics.endFill();

        const pointsLen = (graphics.geometry.graphicsData[0].shape as Polygon).points.length / 2;
        const arcLen = Math.PI / 2 * Math.sqrt(200);
        const estimate = Math.ceil(arcLen / myMaxLen) + 1;

        expect(pointsLen).toBeCloseTo(estimate, 2.0);

        Graphics.curves.adaptive = defMode;
        Graphics.curves.maxLength = defMaxLen;
    });

    describe('geometry', () =>
    {
        it('validateBatching should return false if any of textures is invalid', () =>
        {
            const graphics = new Graphics();
            const invalidTex = Texture.EMPTY;
            const validTex = Texture.WHITE;

            graphics.beginTextureFill({ texture: invalidTex });
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture: validTex });
            graphics.drawRect(0, 0, 10, 10);

            const geometry = graphics.geometry;

            expect(geometry['validateBatching']()).toBe(false);
        });

        it('validateBatching should return true if all textures is valid', () =>
        {
            const graphics = new Graphics();
            const validTex = Texture.WHITE;

            graphics.beginTextureFill({ texture: validTex });
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture: validTex });
            graphics.drawRect(0, 0, 10, 10);

            const geometry = graphics.geometry;

            expect(geometry['validateBatching']()).toBe(true);
        });

        it('should be batchable if graphicsData is empty', () =>
        {
            const graphics = new Graphics();
            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batchable).toBe(true);
        });

        it('_compareStyles should return true for identical styles', () =>
        {
            const graphics = new Graphics();
            const geometry = graphics.geometry;

            const first = new FillStyle();

            first.color = 0xff00ff;
            first.alpha = 0.1;
            first.visible = true;

            const second = first.clone();

            expect(geometry['_compareStyles'](first, second)).toBe(true);

            const firstLine = new LineStyle();

            firstLine.color = 0xff00ff;
            firstLine.native = false;
            firstLine.alignment = 1;

            const secondLine = firstLine.clone();

            expect(geometry['_compareStyles'](firstLine, secondLine)).toBe(true);
        });

        it('should be 1 batch for same styles', () =>
        {
            const graphics = new Graphics();

            graphics.beginFill(0xff00ff, 0.5);
            graphics.drawRect(0, 0, 20, 20);
            graphics.drawRect(100, 0, 20, 20);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).toHaveLength(1);
        });

        it('should be 2 batches for 2 different styles', () =>
        {
            const graphics = new Graphics();

            // first style
            graphics.beginFill(0xff00ff, 0.5);
            graphics.drawRect(0, 0, 20, 20);

            // second style
            graphics.beginFill(0x0, 0.5);
            graphics.drawRect(100, 0, 20, 20);

            // third shape with same style
            graphics.drawRect(0, 0, 20, 20);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).toHaveLength(2);
        });

        it('should be 1 batch if fill and line are the same', () =>
        {
            const graphics = new Graphics();

            graphics.lineStyle(10.0, 0x00ffff);
            graphics.beginFill(0x00ffff);
            graphics.drawRect(50, 50, 100, 100);
            graphics.drawRect(150, 150, 100, 100);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).toHaveLength(1);
        });

        it('should not use fill if triangulation does nothing', () =>
        {
            const graphics = new Graphics();

            graphics
                .lineStyle(2, 0x00ff00)
                .beginFill(0xff0000)
                .drawRect(0, 0, 100, 100)
                .moveTo(200, 0)
                .lineTo(250, 200);

            const geometry = graphics.geometry;

            geometry.updateBatches();
            expect(geometry.batches).toHaveLength(2);
            expect(geometry.batches[0].style.color).toEqual(0xff0000);
            expect(geometry.batches[0].size).toEqual(6);
            expect(geometry.batches[1].style.color).toEqual(0x00ff00);
            expect(geometry.batches[1].size).toEqual(30);
        });
    });

    describe('tint', () =>
    {
        it('should allow for other color sources', () =>
        {
            const graphics = new Graphics();

            graphics.tint = 'red';
            expect(graphics.tint).toEqual('red');
            graphics.destroy();
        });
    });
});
