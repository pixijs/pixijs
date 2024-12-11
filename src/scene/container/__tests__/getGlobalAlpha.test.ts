import { Container } from '../Container';

describe('getGlobalAlpha', () =>
{
    describe('with skipUpdateTransform = false', () =>
    {
        it('should return container alpha when no parent exists', () =>
        {
            const container = new Container();

            container.alpha = 0.5;

            expect(container.getGlobalAlpha(false)).toBe(0.5);
        });

        it('should multiply alpha with single parent', () =>
        {
            const parent = new Container();
            const container = new Container();

            parent.alpha = 0.5;

            container.alpha = 0.5;
            container.parent = parent;

            expect(container.getGlobalAlpha(false)).toBe(0.25); // 0.5 * 0.5
        });

        it('should multiply alpha through multiple parents', () =>
        {
            const container = new Container();
            const grandParent = new Container();
            const parent = new Container();

            grandParent.alpha = 0.5;
            parent.alpha = 0.5;
            container.alpha = 0.5;

            parent.parent = grandParent;
            container.parent = parent;

            expect(container.getGlobalAlpha(false)).toBe(0.125); // 0.5 * 0.5 * 0.5
        });

        it('should return renderGroup worldAlpha when container has renderGroup', () =>
        {
            const container = new Container({
                alpha: 0.75,
                isRenderGroup: true
            });

            expect(container.getGlobalAlpha(false)).toBe(0.75);
        });
    });

    describe('with skipUpdateTransform = true', () =>
    {
        it('should multiply parentRenderGroup worldAlpha with container alpha', () =>
        {
            const parent = new Container();

            const container = new Container();

            container.alpha = 0.5;

            parent.addChild(container);

            parent.alpha = 0.5;

            expect(container.getGlobalAlpha(true)).toBe(0.5); // 0.8 * 0.5
        });
    });

    describe('edge cases', () =>
    {
        it('should handle alpha value of 0', () =>
        {
            const container = new Container();

            container.alpha = 0;

            expect(container.getGlobalAlpha(false)).toBe(0);
        });

        it('should handle alpha value of 1', () =>
        {
            const container = new Container();

            container.alpha = 1;

            expect(container.getGlobalAlpha(false)).toBe(1);
        });

        it('should handle deeply nested containers', () =>
        {
            const container = new Container();
            let current = new Container();

            // Create a chain of 10 containers
            for (let i = 0; i < 10; i++)
            {
                const parent = new Container();

                parent.alpha = 0.9;
                current.addChild(parent);
                current = parent;
            }

            container.alpha = 0.9;

            current.addChild(container);

            const expectedAlpha = Math.pow(0.9, 11);

            expect(container.getGlobalAlpha(false)).toBeCloseTo(expectedAlpha, 3);
        });
    });
});
