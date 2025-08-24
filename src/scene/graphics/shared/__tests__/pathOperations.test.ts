import { GraphicsPath } from '../path/GraphicsPath';
import { appendSVGPath, calculatePathArea, extractSubpaths } from '../svg/utils/pathOperations';

describe('pathOperations', () =>
{
    describe('extractSubpaths', () =>
    {
        it('should split path data on Move commands', () =>
        {
            const pathData = 'M 10 10 L 20 20 M 30 30 L 40 40';
            const result = extractSubpaths(pathData);

            expect(result).toEqual([
                'M 10 10 L 20 20 ',
                'M 30 30 L 40 40'
            ]);
        });

        it('should handle mixed case Move commands', () =>
        {
            const pathData = 'M 10 10 L 20 20 m 5 5 L 15 15';
            const result = extractSubpaths(pathData);

            expect(result).toEqual([
                'M 10 10 L 20 20 ',
                'm 5 5 L 15 15'
            ]);
        });

        it('should filter out empty subpaths', () =>
        {
            const pathData = 'M 10 10 L 20 20   M 30 30 L 40 40';
            const result = extractSubpaths(pathData);

            expect(result).toHaveLength(2);
            expect(result.every((subpath) => subpath.trim().length > 0)).toBe(true);
        });

        it('should handle single subpath', () =>
        {
            const pathData = 'M 10 10 L 20 20 L 30 30 Z';
            const result = extractSubpaths(pathData);

            expect(result).toEqual(['M 10 10 L 20 20 L 30 30 Z']);
        });
    });

    describe('calculatePathArea', () =>
    {
        it('should calculate bounding box area correctly', () =>
        {
            const pathData = 'M 0 0 L 10 0 L 10 10 L 0 10 Z';
            const result = calculatePathArea(pathData);

            expect(result).toBe(100); // 10x10 square
        });

        it('should handle paths with decimal coordinates', () =>
        {
            const pathData = 'M 0.5 0.5 L 10.5 0.5 L 10.5 10.5 L 0.5 10.5 Z';
            const result = calculatePathArea(pathData);

            expect(result).toBe(100); // 10x10 square
        });

        it('should return 0 for insufficient coordinates', () =>
        {
            const pathData = 'M 0 0';
            const result = calculatePathArea(pathData);

            expect(result).toBe(0);
        });

        it('should return 0 for empty path data', () =>
        {
            const pathData = '';
            const result = calculatePathArea(pathData);

            expect(result).toBe(0);
        });

        it('should handle negative coordinates', () =>
        {
            const pathData = 'M -5 -5 L 5 -5 L 5 5 L -5 5 Z';
            const result = calculatePathArea(pathData);

            expect(result).toBe(100); // 10x10 square
        });
    });

    describe('appendSVGPath', () =>
    {
        it('should append instructions to existing GraphicsPath', () =>
        {
            const graphicsPath = new GraphicsPath();
            const pathData = 'M 10 10 L 20 20';

            const initialInstructionCount = graphicsPath.instructions.length;

            appendSVGPath(pathData, graphicsPath);

            expect(graphicsPath.instructions.length).toBeGreaterThan(initialInstructionCount);
        });

        it('should handle complex path data', () =>
        {
            const graphicsPath = new GraphicsPath();
            const pathData = 'M 0 0 Q 50 25 100 0 T 200 0';

            appendSVGPath(pathData, graphicsPath);

            expect(graphicsPath.instructions.length).toBeGreaterThan(0);
        });

        it('should preserve existing instructions when appending', () =>
        {
            const graphicsPath = new GraphicsPath();

            // Add some initial instructions
            graphicsPath.moveTo(0, 0);
            const initialCount = graphicsPath.instructions.length;

            // Parse and append new path
            const pathData = 'M 10 10 L 20 20';

            appendSVGPath(pathData, graphicsPath);

            expect(graphicsPath.instructions.length).toBeGreaterThan(initialCount);
        });
    });
});
