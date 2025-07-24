import { groupD8 } from '../matrix/groupD8';
import { Rectangle } from '../shapes/Rectangle';

describe('groupD8', () =>
{
    describe('transformRectCoords', () =>
    {
        const rect = { x: 10, y: 20, width: 30, height: 40 };
        const sourceFrame = { x: 5, y: 15, width: 100, height: 150 };

        it('should not transform coordinates for no rotation (E)', () =>
        {
            const out = new Rectangle();
            const result = groupD8.transformRectCoords(rect, sourceFrame, groupD8.E, out);

            expect(result).toBe(out); // Should return the same out rectangle
            expect(out.x).toBe(15); // 10 + 5 (frame offset)
            expect(out.y).toBe(35); // 20 + 15 (frame offset)
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });

        it('should correctly transform coordinates for 90° clockwise rotation (S)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.S, out);

            // x becomes frameWidth - y - height + frameX: 100 - 20 - 40 + 5 = 45
            // y becomes x + frameY: 10 + 15 = 25
            // width and height swap
            expect(out.x).toBe(45);
            expect(out.y).toBe(25);
            expect(out.width).toBe(40);
            expect(out.height).toBe(30);
        });

        it('should correctly transform coordinates for 180° rotation (W)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.W, out);

            // x becomes frameWidth - x - width + frameX: 100 - 10 - 30 + 5 = 65
            // y becomes frameHeight - y - height + frameY: 150 - 20 - 40 + 15 = 105
            // width and height stay the same
            expect(out.x).toBe(65);
            expect(out.y).toBe(105);
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });

        it('should correctly transform coordinates for 270° clockwise rotation (N)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.N, out);

            // x becomes y + frameX: 20 + 5 = 25
            // y becomes frameHeight - x - width + frameY: 150 - 10 - 30 + 15 = 125
            // width and height swap
            expect(out.x).toBe(25);
            expect(out.y).toBe(125);
            expect(out.width).toBe(40);
            expect(out.height).toBe(30);
        });

        it('should fallback to no rotation for diagonal rotations (SE)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.SE, out);

            expect(out.x).toBe(15); // 10 + 5
            expect(out.y).toBe(35); // 20 + 15
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });

        it('should fallback to no rotation for diagonal rotations (SW)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.SW, out);

            expect(out.x).toBe(15); // 10 + 5
            expect(out.y).toBe(35); // 20 + 15
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });

        it('should fallback to no rotation for diagonal rotations (NE)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.NE, out);

            expect(out.x).toBe(15); // 10 + 5
            expect(out.y).toBe(35); // 20 + 15
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });

        it('should fallback to no rotation for diagonal rotations (NW)', () =>
        {
            const out = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.NW, out);

            expect(out.x).toBe(15); // 10 + 5
            expect(out.y).toBe(35); // 20 + 15
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });

        it('should fallback to no rotation for reflection transformations', () =>
        {
            const outVertical = new Rectangle();
            const outHorizontal = new Rectangle();
            const outMainDiagonal = new Rectangle();
            const outReverseDiagonal = new Rectangle();

            groupD8.transformRectCoords(rect, sourceFrame, groupD8.MIRROR_VERTICAL, outVertical);
            groupD8.transformRectCoords(rect, sourceFrame, groupD8.MIRROR_HORIZONTAL, outHorizontal);
            groupD8.transformRectCoords(rect, sourceFrame, groupD8.MAIN_DIAGONAL, outMainDiagonal);
            groupD8.transformRectCoords(rect, sourceFrame, groupD8.REVERSE_DIAGONAL, outReverseDiagonal);

            [outVertical, outHorizontal, outMainDiagonal, outReverseDiagonal].forEach((out) =>
            {
                expect(out.x).toBe(15); // rect.x + sourceFrame.x
                expect(out.y).toBe(35); // rect.y + sourceFrame.y
                expect(out.width).toBe(rect.width);
                expect(out.height).toBe(rect.height);
            });
        });

        it('should handle edge case with zero coordinates', () =>
        {
            const zeroRect = { x: 0, y: 0, width: 10, height: 10 };
            const container = { x: 5, y: 10, width: 50, height: 50 };

            const outS = new Rectangle();

            groupD8.transformRectCoords(zeroRect, container, groupD8.S, outS);
            expect(outS.x).toBe(45); // (50 - 0 - 10) + 5
            expect(outS.y).toBe(10); // 0 + 10
            expect(outS.width).toBe(10);
            expect(outS.height).toBe(10);

            const outW = new Rectangle();

            groupD8.transformRectCoords(zeroRect, container, groupD8.W, outW);
            expect(outW.x).toBe(45); // (50 - 0 - 10) + 5
            expect(outW.y).toBe(50); // (50 - 0 - 10) + 10
            expect(outW.width).toBe(10);
            expect(outW.height).toBe(10);
        });

        it('should handle square containers and rectangles', () =>
        {
            const squareRect = { x: 5, y: 5, width: 10, height: 10 };
            const squareContainer = { x: 2, y: 3, width: 20, height: 20 };

            const outS = new Rectangle();

            groupD8.transformRectCoords(squareRect, squareContainer, groupD8.S, outS);
            expect(outS.x).toBe(7); // (20 - 5 - 10) + 2
            expect(outS.y).toBe(8); // 5 + 3
            expect(outS.width).toBe(10);
            expect(outS.height).toBe(10);

            const outW = new Rectangle();

            groupD8.transformRectCoords(squareRect, squareContainer, groupD8.W, outW);
            expect(outW.x).toBe(7); // (20 - 5 - 10) + 2
            expect(outW.y).toBe(8); // (20 - 5 - 10) + 3
            expect(outW.width).toBe(10);
            expect(outW.height).toBe(10);
        });

        it('should handle realistic bitmap font character coordinates', () =>
        {
            // Simulate a character 'A' in a 512x512 texture atlas with frame offset
            const charRect = { x: 45, y: 12, width: 24, height: 32 };
            const atlasFrame = { x: 10, y: 20, width: 512, height: 512 };

            // Test 90° rotation (common in texture packing)
            const out90 = new Rectangle();

            groupD8.transformRectCoords(charRect, atlasFrame, groupD8.S, out90);
            expect(out90.x).toBe(478); // (512 - 12 - 32) + 10
            expect(out90.y).toBe(65); // 45 + 20
            expect(out90.width).toBe(32);
            expect(out90.height).toBe(24);

            // Test 180° rotation
            const out180 = new Rectangle();

            groupD8.transformRectCoords(charRect, atlasFrame, groupD8.W, out180);
            expect(out180.x).toBe(453); // (512 - 45 - 24) + 10
            expect(out180.y).toBe(488); // (512 - 12 - 32) + 20
            expect(out180.width).toBe(24);
            expect(out180.height).toBe(32);
        });

        it('should reuse the provided output rectangle', () =>
        {
            const out = new Rectangle(999, 999, 999, 999);
            const result = groupD8.transformRectCoords(rect, sourceFrame, groupD8.E, out);

            // Should return the same rectangle instance
            expect(result).toBe(out);

            // Should have overwritten the values with frame offset included
            expect(out.x).toBe(15); // 10 + 5
            expect(out.y).toBe(35); // 20 + 15
            expect(out.width).toBe(30);
            expect(out.height).toBe(40);
        });
    });
});
