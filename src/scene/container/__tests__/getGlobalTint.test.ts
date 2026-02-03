import { Container } from '../Container';

describe('getGlobalTint', () =>
{
    describe('with skipUpdate = false', () =>
    {
        it('should return container tint when no parent exists', () =>
        {
            const container = new Container();

            container.tint = 0xFF0000; // Red

            expect(container.getGlobalTint(false)).toBe(0xFF0000);
        });

        it('should multiply tint with single parent', () =>
        {
            const parent = new Container();
            const container = new Container();

            parent.tint = 0xFF0000; // Red
            container.tint = 0x00FF00; // Green

            container.parent = parent;

            // Result should be black (0x000000) as multiplying different colors results in darkness
            expect(container.getGlobalTint(false)).toBe(0x000000);
        });

        it('should multiply tint through multiple parents', () =>
        {
            const container = new Container();
            const grandParent = new Container();
            const parent = new Container();

            grandParent.tint = 0xFFFFFF; // White
            parent.tint = 0x808080; // Gray
            container.tint = 0xFF0000; // Red

            parent.parent = grandParent;
            container.parent = parent;

            // Result should be darker red due to gray parent
            expect(container.getGlobalTint(false)).toBe(0x800000);
        });

        it('should return renderGroup worldColor when container has renderGroup', () =>
        {
            const container = new Container({
                tint: 0xFF0000,
                isRenderGroup: true
            });

            expect(container.getGlobalTint(false)).toBe(0xFF0000);
        });
    });

    describe('with skipUpdate = true', () =>
    {
        it('should return renderGroup worldColor when container has renderGroup', () =>
        {
            const container = new Container();

            container.renderGroup = {
                worldColor: 0x0000FF // BGR format
            } as any;

            expect(container.getGlobalTint(true)).toBe(0xFF0000); // RGB format
        });

        it('should multiply parentRenderGroup worldColor with container localColor', () =>
        {
            const container = new Container();

            container.tint = 0xFF0000; // Red
            container.parentRenderGroup = {
                worldColor: 0xFFFFFF // White in BGR
            } as any;

            expect(container.getGlobalTint(true)).toBe(0xFF0000);
        });

        it('should return container tint when no render groups exist', () =>
        {
            const container = new Container();

            container.tint = 0x00FF00; // Green

            expect(container.getGlobalTint(true)).toBe(0x00FF00);
        });
    });

    describe('edge cases', () =>
    {
        it('should handle black tint (0x000000)', () =>
        {
            const container = new Container();

            container.tint = 0x000000;

            expect(container.getGlobalTint(false)).toBe(0x000000);
        });

        it('should handle white tint (0xFFFFFF)', () =>
        {
            const container = new Container();

            container.tint = 0xFFFFFF;

            expect(container.getGlobalTint(false)).toBe(0xFFFFFF);
        });

        it('should handle deeply nested containers', () =>
        {
            const container = new Container();
            let current = new Container();

            // Create a chain of 10 containers
            for (let i = 0; i < 10; i++)
            {
                const parent = new Container();

                parent.tint = 0xFFFFFF; // White doesn't affect the chain
                current.addChild(parent);
                current = parent;
            }

            container.tint = 0xFF0000; // Red
            current.addChild(container);

            expect(container.getGlobalTint(false)).toBe(0xFF0000);
        });
    });
});
