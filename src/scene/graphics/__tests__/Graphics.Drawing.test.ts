import { Bounds } from '../../container/bounds/Bounds';
import { getLocalBounds } from '../../container/bounds/getLocalBounds';
import { Graphics } from '../shared/Graphics';
import { GraphicsContext } from '../shared/GraphicsContext';
import { Matrix } from '~/maths';
import { Texture } from '~/rendering';

import type { FillInstruction } from '../shared/GraphicsContext';
import type { PointData } from '~/maths';

describe('Graphics Drawing', () =>
{
    describe('arc', () =>
    {
        it('should draw an arc', () =>
        {
            type ArcSignature = [number, number, number, number, number, boolean?];
            const data: ArcSignature = [100, 30, 20, 0, Math.PI, undefined];
            const graphics = new Graphics();

            graphics.beginPath();

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

            expect(() => graphics.beginPath().arc(300, 100, 20, 0, Math.PI).fill().closePath()).not.toThrow();
        });
    });

    it('should fill two triangles', () =>
    {
        const graphics = new Graphics();

        graphics
            .moveTo(50, 50)
            .lineTo(250, 50)
            .lineTo(100, 100)
            .lineTo(50, 50)
            .fill(0xffffff);

        graphics
            .moveTo(250, 50)
            .lineTo(450, 50)
            .lineTo(300, 100)
            .lineTo(250, 50)
            .fill(0xffffff);

        const data = graphics.context.instructions;
        const fill1 = data[0] as FillInstruction;
        const fill2 = data[1] as FillInstruction;
        const fill1Data = fill1.data.path.instructions.map((i) => i.data).flat();
        const fill2Data = fill2.data.path.instructions.map((i) => i.data).flat();

        expect(data).toHaveLength(2);
        expect(fill1Data).toEqual([50, 50, 250, 50, 100, 100, 50, 50]);
        expect(fill2Data).toEqual([250, 50, 450, 50, 300, 100, 250, 50]);
    });

    // note: unexpected values, bug? add ticket for Mat
    // ticket: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44800641
    it('should honour lineStyle break', () =>
    {
        const graphics = new Graphics();

        graphics
            .moveTo(50, 50)
            .lineTo(250, 50)
            .stroke({ width: 1.0, color: 0xffffff })
            .lineTo(100, 100)
            .lineTo(50, 50)
            .stroke({ width: 2.0, color: 0xffffff });

        const data = graphics.context.instructions;
        const fill1 = data[0] as FillInstruction;
        const fill2 = data[1] as FillInstruction;
        const fill1Data = fill1.data.path.instructions.map((i) => i.data).flat();
        const fill2Data = fill2.data.path.instructions.map((i) => i.data).flat();

        expect(data).toHaveLength(2);
        expect(fill1Data).toEqual([50, 50, 250, 50]);
        expect(fill2Data).toEqual([250, 50, 100, 100, 50, 50]);
    });

    describe('drawPolygon', () =>
    {
        let numbers: PointData[];

        beforeAll(() =>
        {
            numbers = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 20 }];
        });

        it('should draw a polygon', () =>
        {
            const graphics = new Graphics();

            graphics.poly(numbers).fill();

            expect(graphics.context.instructions).toHaveLength(1);

            const fill = graphics.context.instructions[0] as FillInstruction;
            const poly = fill.data.path.instructions[0];

            expect(poly.action).toBe('poly');
            expect(poly.data[0]).toEqual(numbers);
        });
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

    describe('Ellipse', () =>
    {
        it('should measure an ellipse correctly', async () =>
        {
            const g = new Graphics();

            g.context
                .ellipse(0, 0, 100, 50)
                .fill(0xFF0000);

            const bounds = getLocalBounds(g, new Bounds(), new Matrix());

            expect(bounds.rectangle.width).toBe(200);
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

            expect(graphics.strokeStyle.width).toEqual(1);
            expect(graphics.strokeStyle.color).toEqual(0xff0000);
            expect(graphics.strokeStyle.alignment).toEqual(1);
            expect(graphics.strokeStyle.alpha).toEqual(0.5);

            graphics.destroy();
        });

        it('should default color to black if texture not present and white is present', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { color: 0, width: 1 };
            expect(graphics.strokeStyle.color).toEqual(0);
            graphics.strokeStyle = { texture: Texture.WHITE, width: 1 };
            expect(graphics.strokeStyle.color).toEqual(0xFFFFFF);
            graphics.destroy();
        });

        it('should support object parameter', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = {
                width: 123,
                alpha: 0.25,
                color: 0xff0000,
                alignment: 2,
                cap: 'round',
                join: 'round',
                miterLimit: 20,
            };

            expect(graphics.strokeStyle).toEqual({
                ...GraphicsContext.defaultStrokeStyle,
                width: 123,
                alpha: 0.25,
                color: 0xff0000,
                alignment: 2,
                cap: 'round',
                join: 'round',
                miterLimit: 20,
            });

            // expect defaults from empty assignment
            graphics.strokeStyle = {};

            expect(graphics.strokeStyle).toEqual(GraphicsContext.defaultStrokeStyle);

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

        it('should accept other color sources with alpha', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = ({ color: '#ff000080', width: 1, alpha: 0.5 });

            expect(graphics.strokeStyle.color).toEqual(0xFF0000);
            expect(graphics.strokeStyle.alpha).toEqual(0.25);

            graphics.destroy();
        });

        it('should accept other color sources with alpha override', () =>
        {
            const graphics = new Graphics();

            graphics.strokeStyle = { color: '#ff000080', alpha: 1, width: 1 };

            expect(graphics.strokeStyle.color).toEqual(0xFF0000);
            expect(graphics.strokeStyle.alpha).toEqual(0.5);

            graphics.destroy();
        });
    });

    describe('lineTo', () =>
    {
        it('should return correct bounds - north', () =>
        {
            const graphics = new Graphics();

            graphics
                .moveTo(0, 0)
                .lineTo(0, 10)
                .stroke({ width: 1, cap: 'square' });

            expect(graphics.width).toBeCloseTo(1, 0.0001);
            expect(graphics.height).toBeCloseTo(11, 0.0001);
        });

        // note: width & height are zero?
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
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
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
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
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
        it.skip('should return correct bounds - west', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.strokeStyle = { width: 1, cap: 'square' };
            graphics.lineTo(-10, 0);

            expect(graphics.height).toBeCloseTo(1, 0.0001);
            expect(graphics.width).toBeCloseTo(11, 0.0001);
        });

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
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
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

        it('should generate correct instructions', () =>
        {
            const graphics = new Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 0);
            graphics.lineTo(10, 0);

            graphics.stroke();

            const instruction = graphics.context.instructions[0] as FillInstruction;
            const actions = instruction.data.path.instructions.map((i) => i.action);
            const data = instruction.data.path.instructions.map((i) => i.data);

            expect(graphics.context.instructions).toHaveLength(1);
            expect(actions).toEqual(['moveTo', 'lineTo', 'lineTo']);
            expect(data).toEqual([[0, 0], [0, 0], [10, 0]]);
        });

        // note: zero dimensions
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
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
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
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
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
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
});
