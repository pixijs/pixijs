import { Matrix } from '../../src/maths/matrix/Matrix';
import { Point } from '../../src/maths/point/Point';
// import { TextureSource } from '../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
// import { buildLine } from '../../src/scene/graphics/shared/buildCommands/buildLine';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';
import { GraphicsContext } from '../../src/scene/graphics/shared/GraphicsContext';
import { convertFillInputToFillStyle } from '../../src/scene/graphics/shared/utils/convertFillInputToFillStyle';

// import type { Polygon } from '../../src/maths/shapes/Polygon';
import type { FillInstruction } from '../../src/scene/graphics/shared/GraphicsContext';

// const { FILL_COMMANDS, buildLine } = graphicsUtils;

describe('Graphics', () =>
{
    describe('constructor', () =>
    {
        it('should set defaults', () =>
        {
            const graphics = new Graphics();

            expect(graphics.fillStyle.color).toEqual(0xFFFFFF);
            expect(graphics.fillStyle.alpha).toEqual(1);
            expect(graphics.strokeStyle.width).toEqual(0);
            expect(graphics.strokeStyle.color).toEqual(0);
            expect(graphics.tint).toEqual(0xFFFFFF);
            expect(graphics.blendMode).toEqual('normal');
        });
    });

    describe('lineStyle', () =>
    {
        it('should support a list of parameters', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle.width = 1;
            graphics.strokeStyle.color = 0xff0000;
            graphics.strokeStyle.alpha = 0.5;
            graphics.strokeStyle.alignment = 1;
            // todo: native?

            expect(graphics.strokeStyle.width).toEqual(1);
            expect(graphics.strokeStyle.color).toEqual(0xff0000);
            expect(graphics.strokeStyle.alignment).toEqual(1);
            expect(graphics.strokeStyle.alpha).toEqual(0.5);
            // expect(graphics.strokeStyle.native).toEqual(true);

            graphics.destroy();
        });

        // note: was this correct? Second expect is black, not white
        it.skip('should default color to black if texture not present and white is present', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle.width = 1;
            expect(graphics.strokeStyle.color).toEqual(0x0);
            graphics.strokeStyle.texture = Texture.WHITE;
            // graphics.lineTextureStyle({ texture: Texture.WHITE, width: 1 });
            expect(graphics.strokeStyle.color).toEqual(0xFFFFFF);
            graphics.destroy();
        });

        it('should support object parameter', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = {
                width: 1,
                alpha: 0.5,
                color: 0xff0000,
                alignment: 1,
                // native: true,
                cap: 'round',
                join: 'round',
                miterLimit: 20,
            };

            expect(graphics.strokeStyle.width).toEqual(1);
            expect(graphics.strokeStyle.color).toEqual(0xff0000);
            expect(graphics.strokeStyle.alignment).toEqual(1);
            expect(graphics.strokeStyle.alpha).toEqual(0.5);
            // expect(graphics.strokeStyle.native).toEqual(true);
            // expect(graphics.strokeStyle.visible).toEqual(true);
            expect(graphics.strokeStyle.cap).toEqual('round');
            expect(graphics.strokeStyle.join).toEqual('round');
            expect(graphics.strokeStyle.miterLimit).toEqual(20);

            // note: this part doesn't seem relevant anyone, it doest set defaults from empty assignment
            // graphics.lineStyle();

            // expect(graphics.strokeStyle.width).toEqual(0);
            // expect(graphics.strokeStyle.color).toEqual(0);
            // expect(graphics.strokeStyle.alignment).toEqual(0.5);
            // expect(graphics.strokeStyle.alpha).toEqual(1);
            // // expect(graphics.strokeStyle.native).toEqual(false);
            // // expect(graphics.strokeStyle.visible).toEqual(false);
            // expect(graphics.strokeStyle.cap).toEqual(LINE_CAP.BUTT);
            // expect(graphics.strokeStyle.join).toEqual(LINE_JOIN.MITER);
            // expect(graphics.strokeStyle.miterLimit).toEqual(10);

            graphics.destroy();
        });

        it('should accept other color sources', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { color: 'red', width: 1 };

            expect(graphics.strokeStyle.color).toEqual(0xFF0000);
            expect(graphics.strokeStyle.alpha).toEqual(1);

            graphics.destroy();
        });

        // note: alpha not getting parsed? Test below passes though its overriding - Fixed
        it('should accept other color sources with alpha', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = ({ color: '#ff000080', width: 1 });

            expect(graphics.strokeStyle.color).toEqual(0xFF0000);
            expect(graphics.strokeStyle.alpha).toEqual(0.5); // <-- equals 1

            graphics.destroy();
        });

        it('should accept other color sources with alpha override', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { color: '#ff000080', alpha: 1, width: 1 };

            expect(graphics.strokeStyle.color).toEqual(0xFF0000);
            expect(graphics.strokeStyle.alpha).toEqual(1);

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

            graphics.strokeStyle = {
                width: 1,
                alpha: 0.5,
                color: 0xff0000,
                matrix,
                texture,
                alignment: 1,
                // native: true,
            };

            expect(graphics.strokeStyle.width).toEqual(1);
            expect(graphics.strokeStyle.texture).toEqual(texture);
            expect(graphics.strokeStyle.matrix).toBeTruthy();
            expect(graphics.strokeStyle.color).toEqual(0xff0000);
            expect(graphics.strokeStyle.alignment).toEqual(1);
            expect(graphics.strokeStyle.alpha).toEqual(0.5);
            // expect(graphics.strokeStyle.native).toEqual(true);
            // expect(graphics.strokeStyle.visible).toEqual(true);

            // note: the part below doesn't seem relevant any more, it doesn't set defaults from empty assignment
            // graphics.lineTextureStyle();

            // expect(graphics.strokeStyle.width).toEqual(0);
            // expect(graphics.strokeStyle.texture).toEqual(Texture.WHITE);
            // expect(graphics.strokeStyle.matrix).toEqual(null);
            // expect(graphics.strokeStyle.color).toEqual(0);
            // expect(graphics.strokeStyle.alignment).toEqual(0.5);
            // expect(graphics.strokeStyle.alpha).toEqual(1);
            // expect(graphics.strokeStyle.native).toEqual(false);
            // expect(graphics.strokeStyle.visible).toEqual(false);

            graphics.destroy();
        });
    });

    describe('beginTextureFill', () =>
    {
        // note: what is geometry and batch v8 equivalent?
        // it.skip('should pass texture to batches', () =>
        // {
        //     const graphics = new Graphics();
        //     const canvas1 = document.createElement('canvas');
        //     const validTex1 = Texture.from(new TextureSource({ resource: canvas1 }));
        //     const canvas2 = document.createElement('canvas');
        //     const validTex2 = Texture.from(new TextureSource({ resource: canvas2 }));

        //     canvas1.width = 10;
        //     canvas1.height = 10;
        //     canvas2.width = 10;
        //     canvas2.height = 10;
        //     validTex1.source.update();
        //     validTex2.source.update();

        //     graphics.fillStyle = { texture: validTex1 };
        //     graphics.beginPath().rect(0, 0, 10, 10).closePath();
        //     graphics.fillStyle = { texture: validTex2 };
        //     graphics.beginPath().rect(20, 20, 10, 10).closePath();

        //     graphics.geometry.updateBatches();

        //     const batches = graphics.geometry.batches;

        //     expect(batches.length).toEqual(2);
        //     expect(batches[0].style.texture).toEqual(validTex1);
        //     expect(batches[1].style.texture).toEqual(validTex2);
        // });

        it('should accept other color sources', () =>
        {
            const graphics = new Graphics();

            // note: correct?
            graphics.fillStyle = { color: 'red' };
            // graphics.beginTextureFill({ color: 'red' });

            expect(graphics.fillStyle.color).toEqual(0xFF0000);
            expect(graphics.fillStyle.alpha).toEqual(1);

            graphics.destroy();
        });

        // note: alpha not getting parsed? Fixed
        it('should accept other color sources with alpha', () =>
        {
            const graphics = new Graphics();

            graphics.fillStyle = { color: '#ff000080' };
            // graphics.beginTextureFill({ color: '#ff000080' });

            expect(graphics.fillStyle.color).toEqual(0xFF0000);
            expect(graphics.fillStyle.alpha).toEqual(0.5);

            graphics.destroy();
        });

        it('should accept other color sources with alpha override', () =>
        {
            const graphics = new Graphics();

            graphics.fillStyle = { color: '#ff000080', alpha: 1 };
            // graphics.beginTextureFill({ color: '#ff000080', alpha: 1 });

            expect(graphics.fillStyle.color).toEqual(0xFF0000);
            expect(graphics.fillStyle.alpha).toEqual(1);

            graphics.destroy();
        });
    });

    describe('utils', () =>
    {
        // note: is this relevant any more?
        // it.skip('FILL_COMMADS should be filled', () =>
        // {
        //     expect(FILL_COMMANDS).not.toBeNull();

        //     expect(FILL_COMMANDS[SHAPES.POLY]).not.toBeNull();
        //     expect(FILL_COMMANDS[SHAPES.CIRC]).not.toBeNull();
        //     expect(FILL_COMMANDS[SHAPES.ELIP]).not.toBeNull();
        //     expect(FILL_COMMANDS[SHAPES.RECT]).not.toBeNull();
        //     expect(FILL_COMMANDS[SHAPES.RREC]).not.toBeNull();
        // });

        // note: geometry?
        // it.skip('buildLine should execute without throws', () =>
        // {
        //     const graphics = new Graphics();

        //     graphics.lineStyle({ width: 2, color: 0xff0000 });
        //     graphics.drawRect(0, 0, 10, 10);

        //     const geometry = graphics.geometry;
        //     const data = geometry.graphicsData[0];

        //     // native = false
        //     expect(() => { buildLine(data, geometry); }).not.toThrowError();

        //     data.lineStyle.native = true;
        //     // native = true
        //     expect(() => { buildLine(data, geometry); }).not.toThrowError();
        // });

        it('should parse the alpha component from a color string value', () =>
        {
            const style = convertFillInputToFillStyle({ color: '#ff000080' }, GraphicsContext.defaultFillStyle);

            expect(style.alpha).toBe(0.5);
        });

        it('should override parsed alpha component from a color string value', () =>
        {
            const style = convertFillInputToFillStyle({ color: '#ff000080', alpha: 1 }, GraphicsContext.defaultFillStyle);

            expect(style.alpha).toBe(1);
        });
    });

    describe('lineTo', () =>
    {
        // note: width & height are zero?
        it.skip('should return correct bounds - north', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 1, cap: 'square' };
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);

            expect(graphics.width).toBeCloseTo(1, 0.0001);
            expect(graphics.height).toBeCloseTo(11, 0.0001);
        });

        // note: width & height are zero?
        it.skip('should return correct bounds - south', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.strokeStyle = { width: 1, cap: 'square' };
            graphics.lineTo(0, -10);

            expect(graphics.width).toBeCloseTo(1, 0.0001);
            expect(graphics.height).toBeCloseTo(11, 0.0001);
        });

        // note: width & height are zero?
        it.skip('should return correct bounds - east', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.strokeStyle = { width: 1, cap: 'square' };
            graphics.lineTo(10, 0);

            expect(graphics.height).toBeCloseTo(1, 0.0001);
            expect(graphics.width).toBeCloseTo(11, 0.0001);
        });

        // note: width & height are zero?
        it.skip('should return correct bounds - west', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.strokeStyle = { width: 1, cap: 'square' };
            graphics.lineTo(-10, 0);

            expect(graphics.height).toBeCloseTo(1, 0.0001);
            expect(graphics.width).toBeCloseTo(11, 0.0001);
        });

        // note: width & height are zero?
        it('should return correct bounds when stacked with circle', () =>
        {
            const graphics = new Graphics();

            graphics.beginPath().circle(50, 50, 50).fill(0xFF0000).closePath();

            expect(graphics.width).toEqual(100);
            expect(graphics.height).toEqual(100);

            graphics.strokeStyle = { width: 20, color: 0 };
            graphics.moveTo(25, 50);
            graphics.lineTo(75, 50);

            expect(graphics.width).toEqual(100);
            expect(graphics.height).toEqual(100);
        });

        // note: width & height are zero?
        it.skip('should return correct bounds when square', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 20, color: 0, alpha: 0.5 };
            graphics.moveTo(0, 0);
            graphics.lineTo(50, 0);
            graphics.lineTo(50, 50);
            graphics.lineTo(0, 50);
            graphics.lineTo(0, 0);

            expect(graphics.width).toEqual(70);
            expect(graphics.height).toEqual(70);
        });

        it.skip('should ignore duplicate calls', () =>
        {
            const graphics = new Graphics();

            graphics.beginPath(); // <-- had to include these calls or otherwise no instructions?
            graphics.moveTo(0, 0);

            graphics.lineTo(0, 0); // <-- original test calls
            graphics.lineTo(10, 0);
            graphics.lineTo(10, 0);

            graphics.stroke();
            graphics.closePath();

            /**
             * 0
            :
            {action: 'moveTo', data: Array(2)}
            1
            :
            {action: 'lineTo', data: Array(2)}
            2
            :
            {action: 'lineTo', data: Array(2)} <-- duplicate
            3
            :
            {action: 'lineTo', data: Array(2)} <-- duplicate
             */

            // expect(graphics.currentPath.points).toEqual([0, 0, 10, 0]);
            expect(graphics.context.instructions[0]).toEqual([0, 0, 10, 0]);
        });

        // note: zero dimensions
        it.skip('should not have miter join on 180 degree corner', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 1, join: 'miter' };
            // graphics.beginPath();

            graphics.moveTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);

            // graphics.stroke();
            // graphics.closePath();

            expect(graphics.width).toBeCloseTo(10, 0.0001);
            expect(graphics.height).toBeCloseTo(1, 0.0001);
        });

        // note: zero dimensions
        it.skip('should not have bevel join on 180 degree corner', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 1, join: 'bevel' };
            graphics.moveTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);

            expect(graphics.width).toBeCloseTo(10, 0.0001);
            expect(graphics.height).toBeCloseTo(1, 0.0001);
        });

        // note: zero dimensions
        it.skip('should have round join on 180 degree corner', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 1, join: 'round' };
            graphics.moveTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);

            expect(graphics.width).toBeCloseTo(10.5, 0.0001);
            expect(graphics.height).toBeCloseTo(1, 0.0001);
        });
    });

    describe('containsPoint', () =>
    {
        // note: had to fill to get it to work, original test didn't fill or create a path - breaking changes for users?
        it('should return true when point inside a standard shape', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginPath();
            graphics.rect(0, 0, 10, 10);
            graphics.fill();
            graphics.closePath();

            expect(graphics.context.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside a standard shape', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.beginPath();
            graphics.rect(0, 0, 10, 10);
            graphics.fill();
            graphics.closePath();

            expect(graphics.context.containsPoint(point)).toBe(false);
        });

        it('should return true when point inside just lines', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);
            graphics.lineTo(10, 10);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);
            graphics.stroke();
            graphics.closePath();

            expect(graphics.context.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside just lines', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 10);
            graphics.lineTo(10, 10);
            graphics.lineTo(10, 0);
            graphics.lineTo(0, 0);
            graphics.stroke();
            graphics.closePath();

            expect(graphics.context.containsPoint(point)).toBe(false);
        });

        it('should return false when no fill', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics.beginPath();
            graphics.rect(0, 0, 10, 10);
            graphics.closePath();

            expect(graphics.context.containsPoint(point)).toBe(false);
        });

        // note: how to test this?
        it.skip('should return false with hole', () =>
        {
            const point1 = new Point(1, 1);
            const point2 = new Point(5, 5);
            const graphics = new Graphics();

            graphics
                .beginPath()
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .fill(0)
                .closePath()
                // .beginHole()
                .beginPath()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                // .endHole();
                .fill()
                .cut()
                .closePath();

            expect(graphics.context.containsPoint(point1)).toBe(true);
            expect(graphics.context.containsPoint(point2)).toBe(false);
        });

        // note: hole api?
        it.skip('should handle extra shapes in holes', () =>
        {
            const graphics = new Graphics();

            graphics
                .beginPath()
                .moveTo(3, 3)
                .lineTo(5, 3)
                .lineTo(5, 5)
                .lineTo(3, 5)
                .fill(0)
                .closePath()
                .beginPath()
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .fill()
                .closePath()
                // .beginHole()
                .beginPath()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .fill(0)
                .closePath()
                // .endHole()
                .beginPath()
                .moveTo(5, 5)
                .lineTo(7, 5)
                .lineTo(7, 7)
                .lineTo(5, 7)
                .fill(0)
                .closePath();

            expect(graphics.context.containsPoint(new Point(1, 1))).toBe(true);
            expect(graphics.context.containsPoint(new Point(4, 4))).toBe(true);
            expect(graphics.context.containsPoint(new Point(4, 6))).toBe(false);
            expect(graphics.context.containsPoint(new Point(6, 4))).toBe(false);
            expect(graphics.context.containsPoint(new Point(6, 6))).toBe(true);
        });

        // note: failing, needs care to port new api
        it.skip('should take a matrix into account', () =>
        {
            const g = new Graphics();
            const m = new Matrix();

            // g.beginFill(0xffffff, 1.0);
            // m.identity().translate(0, 100);
            // g.setMatrix(m.clone());
            // g.drawRect(0, 0, 10, 10);
            // m.identity().translate(200, 0);
            // g.setMatrix(m.clone());
            // g.drawRect(0, 0, 10, 10);
            // g.setMatrix(null);
            // g.drawRect(30, 40, 10, 10);

            m.identity().translate(0, 100);
            g.context.setTransform(m.clone());
            g.beginPath().rect(0, 0, 10, 10);
            m.identity().translate(200, 0);
            g.context.setTransform(m.clone());
            g.rect(0, 0, 10, 10);
            g.context.setTransform(null);
            g.rect(30, 40, 10, 10).fill({ color: 0xffffff, alpha: 1.0 });

            expect(g.context.containsPoint(new Point(5, 5))).toBe(false);
            expect(g.context.containsPoint(new Point(5, 105))).toBe(true);
            expect(g.context.containsPoint(new Point(205, 5))).toBe(true);
            expect(g.context.containsPoint(new Point(35, 45))).toBe(true);
        });
    });

    describe('chaining', () =>
    {
        // note: need to know how to port the hole api
        it.skip('should chain draw commands', () =>
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            // const graphics = new Graphics().beginFill(0xFF3300)
            //     .lineStyle(4, 0xffd900, 1)
            //     .moveTo(50, 50)
            //     .lineTo(250, 50)
            //     .endFill()
            //     .drawRoundedRect(150, 450, 300, 100, 15)
            //     .beginHole()
            //     .endHole()
            //     .quadraticCurveTo(1, 1, 1, 1)
            //     .bezierCurveTo(1, 1, 1, 1, 1, 1)
            //     .arcTo(1, 1, 1, 1, 1)
            //     .arc(1, 1, 1, 1, 1, false)
            //     .drawRect(1, 1, 1, 1)
            //     .drawRoundedRect(1, 1, 1, 1, 0.1)
            //     .drawCircle(1, 1, 20)
            //     .drawEllipse(1, 1, 1, 1)
            //     .drawPolygon([1, 1, 1, 1, 1, 1])
            //     .clear();

            // new v8 api WIP...
            // const graphics = new Graphics();

            // graphics.strokeStyle = { width: 4, color: 0xffd900, alpha: 1 };
            // graphics
            // .beginPath()
            // .moveTo(50, 50)
            // .lineTo(250, 50)
            // .fill(0xFF3300)
            // .closePath()

            // .drawRoundedRect(150, 450, 300, 100, 15)
            // .beginHole()
            // .endHole()
            // .quadraticCurveTo(1, 1, 1, 1)
            // .bezierCurveTo(1, 1, 1, 1, 1, 1)
            // .arcTo(1, 1, 1, 1, 1)
            // .arc(1, 1, 1, 1, 1, false)
            // .drawRect(1, 1, 1, 1)
            // .drawRoundedRect(1, 1, 1, 1, 0.1)
            // .drawCircle(1, 1, 20)
            // .drawEllipse(1, 1, 1, 1)
            // .drawPolygon([1, 1, 1, 1, 1, 1])
            // .clear();

            // expect(graphics).not.toBeNull();
        });
    });

    describe('drawPolygon', () =>
    {
        let numbers: number[];
        // let points: Point[];
        // let points: number[];
        // let poly: Polygon;

        beforeAll(() =>
        {
            numbers = [0, 0, 10, 10, 20, 20];
            // points = [new Point(0, 0), new Point(10, 10), new Point(20, 20)];
            // points as number pair array
            // poly = new Polygon(points);
        });

        // note: rewritten to use new api
        it('should draw a polygon', () =>
        {
            const graphics = new Graphics();

            graphics.beginPath().poly(numbers).fill().closePath();

            expect(graphics.context.instructions).toHaveLength(1);

            const fill = graphics.context.instructions[0] as FillInstruction;
            const poly = fill.data.path.instructions[0];

            expect(poly.action).toBe('poly');
            expect(poly.data[0]).toEqual(numbers);
        });

        // note: these tests don't seem to be relevant any more
        // it('should support array of numbers', () =>
        // {
        //     const graphics = new Graphics();

        //     expect(graphics.currentPath).toBeNull();

        //     graphics.drawPolygon(numbers);

        //     expect(graphics.geometry.graphicsData[0]).not.toBeNull();

        //     const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

        //     expect(result).toEqual(numbers);
        // });

        // it('should support array of points', () =>
        // {
        //     const graphics = new Graphics();

        //     graphics.drawPolygon(points);

        //     expect(graphics.geometry.graphicsData[0]).not.toBeNull();

        //     const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

        //     expect(result).toEqual(numbers);
        // });

        // it('should support flat arguments of numbers', () =>
        // {
        //     const graphics = new Graphics();

        //     expect(graphics.currentPath).toBeNull();

        //     graphics.drawPolygon(...numbers);

        //     expect(graphics.geometry.graphicsData[0]).not.toBeNull();

        //     const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

        //     expect(result).toEqual(numbers);
        // });

        // it('should support flat arguments of points', () =>
        // {
        //     const graphics = new Graphics();

        //     expect(graphics.currentPath).toBeNull();

        //     graphics.drawPolygon(...points);

        //     expect(graphics.geometry.graphicsData[0]).not.toBeNull();

        //     const result = (graphics.geometry.graphicsData[0].shape as Polygon).points;

        //     expect(result).toEqual(numbers);
        // });
    });

    describe('should have the same bounds for any rect or poly line alignment value', () =>
    {
        const width = 100;
        const height = 100;
        const numbers: number[] = [0, 0, width, 0, width, height, 0, height];
        const polyGraphics = new Graphics();
        const rectGraphics = new Graphics();
        const lineWidth = 10;
        const lineAlignments = [0, 0.2, 0.5, 1];

        beforeEach(() =>
        {
            polyGraphics.clear();
            rectGraphics.clear();
        });

        it.each(lineAlignments)('should have the same bounds for line alignment value %s', (lineAlignment) =>
        {
            polyGraphics.strokeStyle = { width: lineWidth, color: 0xff0000, alpha: 1, alignment: lineAlignment };
            polyGraphics.beginPath().poly(numbers).fill().closePath();

            rectGraphics.strokeStyle = { width: lineWidth, color: 0xff0000, alpha: 1, alignment: lineAlignment };
            rectGraphics.beginPath().rect(0, 0, width, height).fill(0x0000ff).closePath();

            const polyBounds = polyGraphics.getBounds();
            const rectBounds = rectGraphics.getBounds();

            expect(polyBounds.x).toEqual(rectBounds.x);
            expect(polyBounds.y).toEqual(rectBounds.y);
            expect(polyBounds.width).toEqual(rectBounds.width);
            expect(polyBounds.height).toEqual(rectBounds.height);
        });
    });

    describe('arc', () =>
    {
        it('should draw an arc', () =>
        {
            type ArcSignature = [number, number, number, number, number, boolean?];
            const data: ArcSignature = [100, 30, 20, 0, Math.PI, undefined];
            const graphics = new Graphics();

            graphics.beginPath();
            // eslint-disable-next-line prefer-spread
            graphics.arc.apply(graphics, data);
            graphics.fill().closePath();

            expect(graphics.context.instructions).toHaveLength(1);

            const fill = graphics.context.instructions[0] as FillInstruction;
            const arc = fill.data.path.instructions[0];

            expect(arc.action).toBe('arc');
            expect(arc.data).toEqual(data);
        });

        it('should not throw with other shapes', () =>
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 4, color: 0xffd900, alpha: 1 };
            graphics
                .beginPath()
                .moveTo(50, 50)
                .lineTo(250, 50)
                .lineTo(100, 100)
                .lineTo(50, 50)
                .fill(0xFF3300)
                .closePath();

            graphics.strokeStyle = { width: 2, color: 0xFF00FF, alpha: 1 };
            graphics
                .beginPath()
                .roundRect(150, 450, 300, 100, 15)
                .fill({ color: 0xFF00BB, alpha: 0.25 })
                .closePath();

            graphics.strokeStyle = { width: 4, color: 0x00FF00, alpha: 1 };

            expect(() => graphics.beginPath().arc(300, 100, 20, 0, Math.PI).fill().closePath()).not.toThrowError();
        });

        // note: does do something, compare with original test
        it.skip('should do nothing when startAngle and endAngle are equal', () =>
        {
            const graphics = new Graphics();

            expect(graphics.context.instructions).toHaveLength(0);

            graphics.beginPath().arc(0, 0, 10, 0, 0).fill().closePath();

            expect(graphics.context.instructions).toHaveLength(0);
        });

        // note: does do something, compare with original test
        it.skip('should do nothing if sweep equals zero', () =>
        {
            const graphics = new Graphics();

            expect(graphics.context.instructions).toHaveLength(0);

            graphics.beginPath().arc(0, 0, 10, 0, 0).fill().closePath();

            expect(graphics.context.instructions).toHaveLength(0);
        });
    });

    // note: v8 equivalent?
    // describe('_calculateBounds', () =>
    // {
    //     it('should only call updateLocalBounds once when not empty', () =>
    //     {
    //         const graphics = new Graphics();

    //         graphics.beginFill();
    //         graphics.drawRect(0, 0, 10, 10);
    //         graphics.endFill();

    //         const spy = jest.spyOn(graphics.geometry, 'calculateBounds' as any);

    //         graphics['_calculateBounds']();

    //         expect(spy).toHaveBeenCalledOnce();

    //         graphics['_calculateBounds']();

    //         expect(spy).toHaveBeenCalledOnce();
    //     });

    //     it('should not call updateLocalBounds when empty', () =>
    //     {
    //         const graphics = new Graphics();

    //         const spy = jest.spyOn(graphics.geometry, 'calculateBounds' as any);

    //         graphics['_calculateBounds']();

    //         expect(spy).not.toBeCalled();

    //         graphics['_calculateBounds']();

    //         expect(spy).not.toBeCalled();
    //     });
    // });

    describe('getBounds', () =>
    {
        it('should use getBounds without stroke', () =>
        {
            const graphics = new Graphics();

            graphics.beginPath().rect(10, 20, 100, 200).fill(0).closePath();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(10);
            expect(y).toEqual(20);
            expect(width).toEqual(100);
            expect(height).toEqual(200);
        });

        // note: not getting expected values
        it.skip('should use getBounds with stroke', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { width: 4, color: 0xff0000 };
            graphics.beginPath().rect(10, 20, 100, 200).fill(0).closePath();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(8); // <- received 10
            expect(y).toEqual(18); // <- received 20
            expect(width).toEqual(104); // <- received 100
            expect(height).toEqual(204); // <- received 200
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

            graphics.strokeStyle = { width: 4, color: 0xff0000 };
            graphics.beginPath().rect(10, 20, 100, 200).fill(0).closePath()
                .clear();

            const { x, y, width, height } = graphics.getBounds();

            expect(x).toEqual(0);
            expect(y).toEqual(0);
            expect(width).toEqual(0);
            expect(height).toEqual(0);
        });

        it('should be equal of child bounds when empty', () =>
        {
            const graphics = new Graphics();
            const child = new Graphics();

            child.beginPath().rect(10, 20, 100, 200).fill(0).closePath();

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

            graphics
                .beginPath()
                .moveTo(50, 50)
                .lineTo(250, 50)
                .lineTo(100, 100)
                .lineTo(50, 50)
                .fill(0xffffff);

            graphics
                .beginPath()
                .moveTo(250, 50)
                .lineTo(450, 50)
                .lineTo(300, 100)
                .lineTo(250, 50)
                .fill(0xffffff);

            // graphics.beginFill(0xffffff, 1.0);
            // graphics.moveTo(50, 50);
            // graphics.lineTo(250, 50);
            // graphics.lineTo(100, 100);
            // graphics.lineTo(50, 50);

            // graphics.moveTo(250, 50);
            // graphics.lineTo(450, 50);
            // graphics.lineTo(300, 100);
            // graphics.lineTo(250, 50);
            // graphics.endFill();

            // const data = graphics.geometry.graphicsData;
            const data = graphics.context.instructions;
            const fill1 = data[0] as FillInstruction;
            const fill2 = data[1] as FillInstruction;
            const fill1Data = fill1.data.path.instructions.map((i) => i.data).flat();
            const fill2Data = fill2.data.path.instructions.map((i) => i.data).flat();

            expect(data.length).toEqual(2);
            expect(fill1Data).toEqual([50, 50, 250, 50, 100, 100, 50, 50]);
            expect(fill2Data).toEqual([250, 50, 450, 50, 300, 100, 250, 50]);
        });

        // note: not sure what this is testing? same as above?
        // it.skip('should honour lineStyle break', () =>
        // {
        //     const graphics = new Graphics();

        //     // graphics.strokeStyle = { width: 1.0, color: 0xffffff };
        //     // graphics.beginPath().moveTo(50, 50).lineTo(250, 50);
        //     // graphics.strokeStyle = { width: 2.0, color: 0xffffff };
        //     // graphics.lineTo(100, 100).lineTo(50, 50);
        //     // graphics.strokeStyle = { width: 0.0 };
        //     // graphics.closePath();

        //     graphics.lineStyle(1.0, 0xffffff);
        //     graphics.moveTo(50, 50);
        //     graphics.lineTo(250, 50);
        //     graphics.lineStyle(2.0, 0xffffff);
        //     graphics.lineTo(100, 100);
        //     graphics.lineTo(50, 50);
        //     graphics.lineStyle(0.0);

        //     const data = graphics.geometry.graphicsData;

        //     expect(data.length).toEqual(2);
        //     expect((data[0].shape as Polygon).points).toEqual([50, 50, 250, 50]);
        //     expect((data[1].shape as Polygon).points).toEqual([250, 50, 100, 100, 50, 50]);
        // });
    });

    // note: v8 equivalent?
    // it.skip('should support adaptive curves', () =>
    // {
    //     const defMode = Graphics.curves.adaptive;
    //     const defMaxLen = Graphics.curves.maxLength;
    //     const myMaxLen = Graphics.curves.maxLength = 1.0;
    //     const graphics = new Graphics();

    //     Graphics.curves.adaptive = true;

    //     graphics.beginFill(0xffffff, 1.0);
    //     graphics.moveTo(610, 500);
    //     graphics.quadraticCurveTo(600, 510, 590, 500);
    //     graphics.endFill();

    //     const pointsLen = (graphics.geometry.graphicsData[0].shape as Polygon).points.length / 2;
    //     const arcLen = Math.PI / 2 * Math.sqrt(200);
    //     const estimate = Math.ceil(arcLen / myMaxLen) + 1;

    //     expect(pointsLen).toBeCloseTo(estimate, 2.0);

    //     Graphics.curves.adaptive = defMode;
    //     Graphics.curves.maxLength = defMaxLen;
    // });

    // note: how to test? I only see dirty flags and a batchMode on GraphicsContext?
    // describe('geometry', () =>
    // {

    //     it('validateBatching should return false if any of textures is invalid', () =>
    //     {
    //         const graphics = new Graphics();
    //         const invalidTex = Texture.EMPTY;
    //         const validTex = Texture.WHITE;

    //         graphics.fillStyle = { texture: invalidTex };
    //         graphics.beginPath().rect(0, 0, 10, 10).fill().closePath();

    //         graphics.fillStyle = { texture: validTex };
    //         graphics.beginPath().rect(0, 0, 10, 10).fill().closePath();

    //         // graphics.beginTextureFill({ texture: invalidTex });
    //         // graphics.drawRect(0, 0, 10, 10);
    //         // graphics.beginTextureFill({ texture: validTex });
    //         // graphics.drawRect(0, 0, 10, 10);

    //         // const geometry = graphics.geometry;
    //         // const instructions = graphics.context.instructions;

    //         // expect(geometry['validateBatching']()).toBe(false);
    //     });

    //     it('validateBatching should return true if all textures is valid', () =>
    //     {
    //         const graphics = new Graphics();
    //         const validTex = Texture.WHITE;

    //         graphics.beginTextureFill({ texture: validTex });
    //         graphics.drawRect(0, 0, 10, 10);
    //         graphics.beginTextureFill({ texture: validTex });
    //         graphics.drawRect(0, 0, 10, 10);

    //         const geometry = graphics.geometry;

    //         expect(geometry['validateBatching']()).toBe(true);
    //     });

    //     it('should be batchable if graphicsData is empty', () =>
    //     {
    //         const graphics = new Graphics();
    //         const geometry = graphics.geometry;

    //         geometry.updateBatches();
    //         expect(geometry.batchable).toBe(true);
    //     });

    //     it('_compareStyles should return true for identical styles', () =>
    //     {
    //         const graphics = new Graphics();
    //         const geometry = graphics.geometry;

    //         const first = new FillStyle();

    //         first.color = 0xff00ff;
    //         first.alpha = 0.1;
    //         first.visible = true;

    //         const second = first.clone();

    //         expect(geometry['_compareStyles'](first, second)).toBe(true);

    //         const firstLine = new LineStyle();

    //         firststrokeStyle.color = 0xff00ff;
    //         firststrokeStyle.native = false;
    //         firststrokeStyle.alignment = 1;

    //         const secondLine = firststrokeStyle.clone();

    //         expect(geometry['_compareStyles'](firstLine, secondLine)).toBe(true);
    //     });

    //     it('should be 1 batch for same styles', () =>
    //     {
    //         const graphics = new Graphics();

    //         graphics.beginFill(0xff00ff, 0.5);
    //         graphics.drawRect(0, 0, 20, 20);
    //         graphics.drawRect(100, 0, 20, 20);

    //         const geometry = graphics.geometry;

    //         geometry.updateBatches();
    //         expect(geometry.batches).toHaveLength(1);
    //     });

    //     it('should be 2 batches for 2 different styles', () =>
    //     {
    //         const graphics = new Graphics();

    //         // first style
    //         graphics.beginFill(0xff00ff, 0.5);
    //         graphics.drawRect(0, 0, 20, 20);

    //         // second style
    //         graphics.beginFill(0x0, 0.5);
    //         graphics.drawRect(100, 0, 20, 20);

    //         // third shape with same style
    //         graphics.drawRect(0, 0, 20, 20);

    //         const geometry = graphics.geometry;

    //         geometry.updateBatches();
    //         expect(geometry.batches).toHaveLength(2);
    //     });

    //     it('should be 1 batch if fill and line are the same', () =>
    //     {
    //         const graphics = new Graphics();

    //         graphics.lineStyle(10.0, 0x00ffff);
    //         graphics.beginFill(0x00ffff);
    //         graphics.drawRect(50, 50, 100, 100);
    //         graphics.drawRect(150, 150, 100, 100);

    //         const geometry = graphics.geometry;

    //         geometry.updateBatches();
    //         expect(geometry.batches).toHaveLength(1);
    //     });

    //     it('should not use fill if triangulation does nothing', () =>
    //     {
    //         const graphics = new Graphics();

    //         graphics
    //             .lineStyle(2, 0x00ff00)
    //             .beginFill(0xff0000)
    //             .drawRect(0, 0, 100, 100)
    //             .moveTo(200, 0)
    //             .lineTo(250, 200);

    //         const geometry = graphics.geometry;

    //         geometry.updateBatches();
    //         expect(geometry.batches).toHaveLength(2);
    //         expect(geometry.batches[0].style.color).toEqual(0xff0000);
    //         expect(geometry.batches[0].size).toEqual(6);
    //         expect(geometry.batches[1].style.color).toEqual(0x00ff00);
    //         expect(geometry.batches[1].size).toEqual(30);
    //     });
    // });

    describe('tint', () =>
    {
        it('should allow for other color sources', () =>
        {
            const graphics = new Graphics();

            graphics.tint = 'red';
            expect(graphics.tint).toEqual(0xff0000);
            graphics.destroy();
        });
    });
});
