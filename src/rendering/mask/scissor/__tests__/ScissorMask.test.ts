import { ScissorMask } from '../ScissorMask';
import { Container, Graphics, Sprite } from '~/scene';

describe('ScissorMask', () =>
{
    describe('test', () =>
    {
        it('should return true for a simple rectangle fill', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(true);
        });

        it('should return true for a positioned rectangle fill', () =>
        {
            const graphics = new Graphics()
                .rect(50, 50, 200, 150)
                .fill({ color: 0xFF0000, alpha: 0.5 });

            expect(ScissorMask.test(graphics)).toBe(true);
        });

        it('should return false for a non-Graphics Container', () =>
        {
            const container = new Container();

            expect(ScissorMask.test(container)).toBe(false);
        });

        it('should return false for a Sprite', () =>
        {
            const sprite = new Sprite();

            expect(ScissorMask.test(sprite)).toBe(false);
        });

        it('should return false for a circle shape', () =>
        {
            const graphics = new Graphics()
                .circle(50, 50, 50)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for a rounded rectangle', () =>
        {
            const graphics = new Graphics()
                .roundRect(0, 0, 100, 100, 10)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for multiple fill instructions', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red')
                .rect(200, 200, 100, 100)
                .fill('blue');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for a stroke-only rectangle', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .stroke('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for an ellipse shape', () =>
        {
            const graphics = new Graphics()
                .ellipse(50, 50, 80, 40)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for an empty Graphics context', () =>
        {
            const graphics = new Graphics();

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for a polygon shape', () =>
        {
            const graphics = new Graphics()
                .poly([0, 0, 100, 0, 50, 100])
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for null/undefined', () =>
        {
            expect(ScissorMask.test(null)).toBe(false);
            expect(ScissorMask.test(undefined)).toBe(false);
        });
    });

    describe('lifecycle', () =>
    {
        it('should properly init and reset', () =>
        {
            const mask = new ScissorMask();
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            mask.init(graphics);

            expect(mask.mask).toBe(graphics);
            expect(graphics.measurable).toBe(false);
            expect(graphics.includeInBuild).toBe(false);

            mask.reset();

            expect(mask.mask).toBeNull();
            expect(graphics.measurable).toBe(true);
            expect(graphics.includeInBuild).toBe(true);
        });

        it('should set pipe to scissorMask', () =>
        {
            const mask = new ScissorMask();

            expect(mask.pipe).toBe('scissorMask');
        });

        it('should handle constructor with options', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            const mask = new ScissorMask({ mask: graphics });

            expect(mask.mask).toBe(graphics);
        });

        it('should handle double reset gracefully', () =>
        {
            const mask = new ScissorMask();
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            mask.init(graphics);
            mask.reset();

            expect(() => mask.reset()).not.toThrow();
        });
    });
});
