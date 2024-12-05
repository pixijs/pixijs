import { Container } from '../Container';
import { Matrix } from '~/maths';

describe('getGlobalTransform', () =>
{
    let outputMatrix: Matrix;

    beforeEach(() =>
    {
        outputMatrix = new Matrix();
    });

    describe('with skipUpdate = false', () =>
    {
        it('should return local transform when no parent exists', () =>
        {
            const container = new Container();

            container.x = 100;
            container.y = 100;

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result).toBe(outputMatrix);
            expect(result.tx).toBe(100);
            expect(result.ty).toBe(100);
        });

        it('should combine transforms with single parent', () =>
        {
            const parent = new Container();
            const container = new Container();

            parent.x = 100;
            container.x = 50;

            parent.addChild(container);

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result.tx).toBe(150); // 100 + 50
        });

        it('should combine transforms through multiple parents', () =>
        {
            const grandParent = new Container();
            const parent = new Container();
            const container = new Container();

            grandParent.x = 100;
            parent.x = 100;
            container.x = 100;

            parent.parent = grandParent;
            grandParent.addChild(parent);
            parent.addChild(container);

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result.tx).toBe(300); // 100 + 100 + 100
        });

        it('should handle rotation', () =>
        {
            const parent = new Container();
            const container = new Container();

            parent.rotation = Math.PI / 2; // 90 degrees
            container.x = 100;

            parent.addChild(container);

            const result = container.getGlobalTransform(outputMatrix, false);

            // After 90-degree rotation:
            // - The transform matrix should rotate 90 degrees counter-clockwise
            // - x=100 should become y=100 after 90-degree rotation
            expect(result.a).toBeCloseTo(0);
            expect(result.b).toBeCloseTo(1);
            expect(result.c).toBeCloseTo(-1);
            expect(result.d).toBeCloseTo(0);
            expect(result.tx).toBeCloseTo(0); // Changed from 100
            expect(result.ty).toBeCloseTo(100); // Changed from 0
        });

        it('should handle scale', () =>
        {
            const parent = new Container();
            const container = new Container();

            container.scale.x = 2;
            container.scale.y = 3;

            container.addChild(parent);

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result.a).toBe(2);
            expect(result.d).toBe(3);
        });
    });

    describe('with skipUpdate = true', () =>
    {
        it('should return worldTransform directly', () =>
        {
            const container = new Container();

            // Manually set worldTransform
            container.worldTransform.tx = 200;
            container.worldTransform.ty = 300;

            const result = container.getGlobalTransform(outputMatrix, true);

            expect(result.tx).toBe(200);
            expect(result.ty).toBe(300);
        });

        it('should copy to provided matrix', () =>
        {
            const container = new Container();
            const outMatrix = new Matrix();

            container.worldTransform.tx = 100;

            const result = container.getGlobalTransform(outMatrix, true);

            expect(result).toBe(outMatrix);
            expect(result.tx).toBe(100);
        });
    });

    describe('edge cases', () =>
    {
        it('should handle identity transforms', () =>
        {
            const container = new Container();

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result.a).toBe(1);
            expect(result.d).toBe(1);
            expect(result.tx).toBe(0);
            expect(result.ty).toBe(0);
        });

        it('should handle scale of 0', () =>
        {
            const container = new Container();

            container.scale.x = 0;
            container.scale.y = 0;

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result.a).toBe(0);
            expect(result.d).toBe(0);
        });

        it('should handle deeply nested containers', () =>
        {
            const container = new Container();
            let current = container;

            // Create a chain of 10 containers
            for (let i = 0; i < 10; i++)
            {
                const parent = new Container();

                parent.x = 10; // Each adds 10 to x
                parent.addChild(current);
                current = parent;
            }

            const result = container.getGlobalTransform(outputMatrix, false);

            expect(result.tx).toBe(100); // 10 * 10
        });
    });
});
