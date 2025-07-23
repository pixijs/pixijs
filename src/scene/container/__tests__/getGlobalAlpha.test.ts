import { Container } from '../Container';

describe('getGlobalAlpha', () =>
{
    describe('with no arguments', () =>
    {
        it('should default to skipUpdate = false', () =>
        {
            const parent = new Container({ alpha: 0.5 });
            const container = new Container({ alpha: 0.5 });

            parent.addChild(container);

            expect(container.getGlobalAlpha()).toBe(0.25); // 0.5 * 0.5
        });
    });

    describe('with skipUpdateTransform = false', () =>
    {
        it('should return container alpha when no parent exists', () =>
        {
            const container = new Container({ alpha: 0.5 });

            expect(container.getGlobalAlpha(false)).toBe(0.5);
        });

        it('should multiply alpha with single parent', () =>
        {
            const parent = new Container({ alpha: 0.5 });
            const container = new Container({ alpha: 0.5, parent });

            expect(container.getGlobalAlpha(false)).toBe(0.25); // 0.5 * 0.5
        });

        it('should multiply alpha through multiple parents', () =>
        {
            const grandParent = new Container({ alpha: 0.5 });
            const parent = new Container({ alpha: 0.5, parent: grandParent });
            const container = new Container({ alpha: 0.5, parent });

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
            const parent = new Container({ alpha: 0.5 });
            const container = new Container({ alpha: 0.5 });

            parent.addChild(container);

            expect(container.getGlobalAlpha(true)).toBe(0.5); // 0.8 * 0.5
        });
    });

    describe('edge cases', () =>
    {
        it('should handle alpha value of 0', () =>
        {
            const container = new Container({ alpha: 0 });

            expect(container.getGlobalAlpha(false)).toBe(0);
        });

        it('should handle alpha value of 1', () =>
        {
            const container = new Container({ alpha: 1 });

            expect(container.getGlobalAlpha(false)).toBe(1);
        });

        it('should handle deeply nested containers', () =>
        {
            const container = new Container({ alpha: 0.9 });
            let current = new Container();

            // Create a chain of 10 containers
            for (let i = 0; i < 10; i++)
            {
                const parent = new Container({ alpha: 0.9 });

                current.addChild(parent);
                current = parent;
            }

            current.addChild(container);

            const expectedAlpha = Math.pow(0.9, 11);

            expect(container.getGlobalAlpha(false)).toBeCloseTo(expectedAlpha, 3);
        });
    });
});
