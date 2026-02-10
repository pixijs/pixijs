import { Container } from '../../../../scene/container/Container';
import { Graphics } from '../../../../scene/graphics/shared/Graphics';
import { ScissorMask } from '../ScissorMask';
import '../../../../rendering/init';

describe('ScissorMask', () =>
{
    describe('test', () =>
    {
        it('should return true for a simple rectangle fill Graphics', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(true);
        });

        it('should return true for a rectangle fill with position offset', () =>
        {
            const graphics = new Graphics()
                .rect(50, 25, 100, 100)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(true);
        });

        it('should return false for a circle Graphics', () =>
        {
            const graphics = new Graphics()
                .circle(50, 50, 50)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for a rounded rectangle Graphics', () =>
        {
            const graphics = new Graphics()
                .roundRect(0, 0, 100, 100, 10)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for a star Graphics', () =>
        {
            const graphics = new Graphics()
                .star(50, 50, 5, 50)
                .fill('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for a non-Graphics Container', () =>
        {
            const container = new Container();

            expect(ScissorMask.test(container)).toBe(false);
        });

        it('should return false for null', () =>
        {
            expect(ScissorMask.test(null)).toBe(false);
        });

        it('should return false for a number (color mask)', () =>
        {
            expect(ScissorMask.test(0xF)).toBe(false);
        });

        it('should return false for Graphics with multiple instructions', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red')
                .rect(50, 50, 100, 100)
                .fill('blue');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for Graphics with stroke only', () =>
        {
            const graphics = new Graphics()
                .rect(0, 0, 100, 100)
                .stroke('red');

            expect(ScissorMask.test(graphics)).toBe(false);
        });

        it('should return false for empty Graphics', () =>
        {
            const graphics = new Graphics();

            expect(ScissorMask.test(graphics)).toBe(false);
        });
    });

    describe('getLocalRect', () =>
    {
        it('should return the rectangle shape from a simple rect Graphics', () =>
        {
            const graphics = new Graphics()
                .rect(10, 20, 100, 200)
                .fill('red');

            const rect = ScissorMask.getLocalRect(graphics);

            expect(rect).not.toBeNull();
            expect(rect.x).toBe(10);
            expect(rect.y).toBe(20);
            expect(rect.width).toBe(100);
            expect(rect.height).toBe(200);
        });

        it('should return null for non-Graphics container', () =>
        {
            const container = new Container();

            expect(ScissorMask.getLocalRect(container)).toBeNull();
        });
    });

    describe('MaskEffect integration', () =>
    {
        it('should use ScissorMask for rectangular Graphics masks', () =>
        {
            const container = new Container();
            const mask = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            container.mask = mask;

            expect(container._maskEffect).toBeDefined();
            expect(container._maskEffect.pipe).toBe('scissorMask');
        });

        it('should use StencilMask for non-rectangular Graphics masks', () =>
        {
            const container = new Container();
            const mask = new Graphics()
                .circle(50, 50, 50)
                .fill('red');

            container.mask = mask;

            expect(container._maskEffect).toBeDefined();
            expect(container._maskEffect.pipe).toBe('stencilMask');
        });

        it('should handle setting mask to null and back', () =>
        {
            const container = new Container();
            const mask = new Graphics()
                .rect(0, 0, 100, 100)
                .fill('red');

            expect(() =>
            {
                container.mask = mask;
                container.mask = null;
                container.mask = mask;
            }).not.toThrow();

            expect(container._maskEffect.pipe).toBe('scissorMask');
        });
    });
});
