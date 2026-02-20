import { MatrixFilter } from '../MatrixFilter';

import type { ColorMatrix } from '../ColorMatrixFilter';

describe('MatrixFilter', () =>
{
    it('should construct filter', () =>
    {
        const filter = new MatrixFilter();

        expect(filter).toBeInstanceOf(MatrixFilter);
        expect(filter.alpha).toEqual(1);

        filter.alpha = 0.5;

        expect(filter.alpha).toEqual(0.5);
        expect(filter.matrix).toEqual([
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ]);

        filter.destroy();
    });

    it('should accept a 5x4 matrix in the constructor', () =>
    {
        const matrix: ColorMatrix = [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0
        ];
        const filter = new MatrixFilter({ matrix });

        expect(filter.matrix).toBe(matrix);

        filter.destroy();
    });

    it('should have a helper function that can append 5x4 matrices', () =>
    {
        const filter = new MatrixFilter({
            matrix: [
                2, 1, 0, 0, 0,
                0, 2, 0, 0, 0,
                0, 1, 2, 0, 0,
                0, 0, 0, 2, 0
            ]
        });

        filter.append([
            0.5, 0, 1, 0, 0,
            0, 0.5, 1, 0, 0,
            0, 0, 0.5, 0, 0,
            0, 0, 0, 0.5, 0
        ]);

        expect(filter.matrix).toEqual([
            1, 0.5, 3, 0, 0,
            0, 1, 2, 0, 0,
            0, 0.5, 2, 0, 0,
            0, 0, 0, 1, 0
        ]);

        filter.destroy();
    });

    it('should have a helper function that can prepend 5x4 matrices', () =>
    {
        const filter = new MatrixFilter({
            matrix: [
                2, 1, 0, 0, 0,
                0, 2, 0, 0, 0,
                0, 1, 2, 0, 0,
                0, 0, 0, 2, 0
            ]
        });

        filter.prepend([
            0.5, 0, 1, 0, 0,
            0, 0.5, 1, 0, 0,
            0, 0, 0.5, 0, 0,
            0, 0, 0, 0.5, 0
        ]);

        expect(filter.matrix).toEqual([
            1, 1.5, 2, 0, 0,
            0, 2, 2, 0, 0,
            0, 0.5, 1, 0, 0,
            0, 0, 0, 1, 0
        ]);

        filter.destroy();
    });
});
