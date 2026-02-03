import { GraphicsContext } from '../GraphicsContext';
import { checkForNestedPattern, getFillInstructionData } from '../svg/utils/fillOperations';

describe('fillOperations', () =>
{
    describe('checkForNestedPattern', () =>
    {
        it('should return true for nested pattern (large outer, small inner)', () =>
        {
            const subpathsWithArea = [
                { path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z', area: 10000 },
                { path: 'M 25 25 L 75 25 L 75 75 L 25 75 Z', area: 2500 }
            ];

            const result = checkForNestedPattern(subpathsWithArea);

            expect(result).toBe(true);
        });

        it('should return true for 2 or fewer subpaths', () =>
        {
            const subpathsWithArea = [
                { path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z', area: 10000 }
            ];

            const result = checkForNestedPattern(subpathsWithArea);

            expect(result).toBe(true);
        });

        it('should return false for multiple holes pattern', () =>
        {
            // Large outer shape with multiple similar-sized holes
            const subpathsWithArea = [
                { path: 'outer', area: 10000 }, // Large outer
                { path: 'hole1', area: 500 }, // Small hole
                { path: 'hole2', area: 600 }, // Similar small hole
                { path: 'hole3', area: 550 } // Similar small hole
            ];

            const result = checkForNestedPattern(subpathsWithArea);

            expect(result).toBe(false);
        });

        it('should return true for nested pattern with varying sizes', () =>
        {
            const subpathsWithArea = [
                { path: 'outer', area: 10000 },
                { path: 'middle', area: 2000 },
                { path: 'inner', area: 200 }
            ];

            const result = checkForNestedPattern(subpathsWithArea);

            expect(result).toBe(true);
        });

        it('should handle edge case ratios correctly', () =>
        {
            // Edge case: exactly 3x ratio and 2x ratio
            const subpathsWithArea = [
                { path: 'large', area: 3000 },
                { path: 'medium', area: 1000 },
                { path: 'small', area: 500 }
            ];

            const result = checkForNestedPattern(subpathsWithArea);

            expect(result).toBe(true); // Should default to nested
        });
    });

    describe('getFillInstructionData', () =>
    {
        it('should return fill instruction data for valid fill instruction', () =>
        {
            const context = new GraphicsContext();

            // Add a fill instruction
            context.fill({ color: 0xff0000 });

            const result = getFillInstructionData(context, 0);

            expect(result).toBeDefined();
            expect(result.style).toBeDefined();
        });

        it('should use default index 0 when no index provided', () =>
        {
            const context = new GraphicsContext();

            context.fill({ color: 0x00ff00 });

            const result = getFillInstructionData(context);

            expect(result).toBeDefined();
        });

        it('should throw error for non-fill instruction', () =>
        {
            const context = new GraphicsContext();

            context.stroke({ color: 0x0000ff, width: 2 });

            expect(() => getFillInstructionData(context, 0))
                .toThrow('Expected fill instruction at index 0, got stroke');
        });

        it('should throw error for undefined instruction', () =>
        {
            const context = new GraphicsContext();

            expect(() => getFillInstructionData(context, 0))
                .toThrow('Expected fill instruction at index 0, got undefined');
        });

        it('should throw error for out of bounds index', () =>
        {
            const context = new GraphicsContext();

            context.fill({ color: 0xff0000 });

            expect(() => getFillInstructionData(context, 5))
                .toThrow('Expected fill instruction at index 5, got undefined');
        });

        it('should handle multiple instructions and get specific fill', () =>
        {
            const context = new GraphicsContext();

            context.stroke({ color: 0x000000, width: 1 });
            context.fill({ color: 0xff0000 });
            context.fill({ color: 0x00ff00 });

            const firstFill = getFillInstructionData(context, 1);
            const secondFill = getFillInstructionData(context, 2);

            expect(firstFill).toBeDefined();
            expect(secondFill).toBeDefined();
            expect(firstFill).not.toBe(secondFill);
        });
    });
});
