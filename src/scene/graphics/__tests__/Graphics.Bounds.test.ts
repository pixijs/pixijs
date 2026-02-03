import { Graphics } from '../shared/Graphics';
import { Point } from '~/maths';

describe('Graphics Bounds', () =>
{
    describe('bounds', () =>
    {
        it('should give correct bounds without stroke', () =>
        {
            const graphics = new Graphics();

            graphics.rect(10, 20, 100, 200).fill(0);

            const { x, y, width, height } = graphics.context.bounds;

            expect(x).toEqual(10);
            expect(y).toEqual(20);
            expect(width).toEqual(100);
            expect(height).toEqual(200);
        });

        it('should give correct bounds with stroke, default alignment', () =>
        {
            const graphics = new Graphics();

            graphics
                .rect(10, 20, 100, 200)
                .fill(0)
                .stroke({ width: 4, color: 0xff0000 });

            const { x, y, width, height } = graphics.context.bounds;

            expect(x).toEqual(8);
            expect(y).toEqual(18);
            expect(width).toEqual(104);
            expect(height).toEqual(204);
        });

        it('should give correct bounds with stroke, alignment 1', () =>
        {
            const graphics = new Graphics();

            graphics
                .rect(10, 20, 100, 200)
                .fill(0)
                .stroke({ width: 4, color: 0xff0000, alignment: 1 });

            const { x, y, width, height } = graphics.context.bounds;

            expect(x).toEqual(10);
            expect(y).toEqual(20);
            expect(width).toEqual(100);
            expect(height).toEqual(200);
        });

        it('should give correct bounds with stroke, alignment 0', () =>
        {
            const graphics = new Graphics();

            graphics
                .rect(10, 20, 100, 200)
                .fill(0)
                .stroke({ width: 4, color: 0xff0000, alignment: 0 });

            const { x, y, width, height } = graphics.context.bounds;

            expect(x).toEqual(6);
            expect(y).toEqual(16);
            expect(width).toEqual(108);
            expect(height).toEqual(208);
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

    describe('containsPoint', () =>
    {
        it('should return true when point inside a standard shape', () =>
        {
            const point = new Point(1, 1);
            const graphics = new Graphics();

            graphics
                .rect(0, 0, 10, 10)
                .fill();

            expect(graphics.context.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside a standard shape', () =>
        {
            const point = new Point(20, 20);
            const graphics = new Graphics();

            graphics
                .rect(0, 0, 10, 10)
                .fill();

            expect(graphics.context.containsPoint(point)).toBe(false);
        });

        // note: ticket to fix these tests
        // Ticket for Mat - https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44798775
        // eslint-disable-next-line jest/no-disabled-tests
        it.skip('should return true when point inside just lines', () =>
        {
            const point = new Point(-1, -1);
            const graphics = new Graphics();

            graphics
                .moveTo(0, 0)
                .lineTo(0, 10)
                .lineTo(10, 10)
                .lineTo(10, 0)
                .lineTo(0, 0)
                .stroke({ width: 2 });

            expect(graphics.context.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside just lines', () =>
        {
            const point = new Point(5, 5);
            const graphics = new Graphics();

            graphics
                .moveTo(0, 0)
                .lineTo(0, 10)
                .lineTo(10, 10)
                .lineTo(10, 0)
                .lineTo(0, 0)
                .stroke();

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

        it('should return false with hole', () =>
        {
            const graphics = new Graphics();

            graphics
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .fill()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .cut();

            expect(graphics.context.containsPoint(new Point(1, 1))).toBe(true);
            expect(graphics.context.containsPoint(new Point(5, 5))).toBe(false);
        });

        // note: failing, needs investigation
        // eslint-disable-next-line jest/no-disabled-tests
        it.skip('should handle extra shapes in holes', () =>
        {
            const graphics = new Graphics();

            graphics
                .moveTo(3, 3)
                .lineTo(5, 3)
                .lineTo(5, 5)
                .lineTo(3, 5)
                .fill()
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                .fill()
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .cut();
            // .moveTo(5, 5)
            // .lineTo(7, 5)
            // .lineTo(7, 7)
            // .lineTo(5, 7)
            // .fill();

            expect(graphics.context.containsPoint(new Point(1, 1))).toBe(true);
            expect(graphics.context.containsPoint(new Point(4, 4))).toBe(true);
            expect(graphics.context.containsPoint(new Point(4, 6))).toBe(false);
            expect(graphics.context.containsPoint(new Point(6, 4))).toBe(false);
            expect(graphics.context.containsPoint(new Point(6, 6))).toBe(true);
        });

        it('should take a matrix into account', () =>
        {
            const g = new Graphics();

            g.context
                .translate(0, 100)
                .rect(0, 0, 10, 10)
                .resetTransform()
                .translate(200, 0)
                .rect(0, 0, 10, 10)
                .resetTransform()
                .rect(30, 40, 10, 10)
                .fill({ color: 0xff0000, alpha: 1.0 });

            expect(g.context.containsPoint(new Point(5, 5))).toBe(false);
            expect(g.context.containsPoint(new Point(5, 105))).toBe(true);
            expect(g.context.containsPoint(new Point(205, 5))).toBe(true);
            expect(g.context.containsPoint(new Point(35, 45))).toBe(true);
        });
    });
});
