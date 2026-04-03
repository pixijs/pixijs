import { type ColorMatrix, ColorMatrixFilter } from '../ColorMatrixFilter';

describe('ColorMatrixFilter', () =>
{
    it('should construct filter', () =>
    {
        const filter = new ColorMatrixFilter();

        expect(filter).toBeInstanceOf(ColorMatrixFilter);
        expect(filter.alpha).toEqual(1);

        filter.alpha = 0.5;

        expect(filter.alpha).toEqual(0.5);
        expect(filter.matrix).toEqual([
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
        ]);

        filter.destroy();
    });

    it('should accept a 5x4 matrix in the constructor', () =>
    {
        const matrix: ColorMatrix = [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
        ];
        const filter = new ColorMatrixFilter({ matrix });

        expect(filter.matrix).toBe(matrix);

        filter.destroy();
    });

    it('should have a helper function that can append 5x4 matrices', () =>
    {
        const filter = new ColorMatrixFilter({
            matrix: [
                2, 1, 0, 0, 0,
                0, 2, 0, 0, 0,
                0, 1, 2, 0, 0,
                0, 0, 0, 2, 0
            ],
        });

        filter.append([
            0.5, 0, 1, 0, 0,
            0, 0.5, 1, 0, 0,
            0, 0, 0.5, 0, 0,
            0, 0, 0, 0.5, 0,
        ]);

        expect(filter.matrix).toEqual([
            1, 0.5, 3, 0, 0,
            0, 1, 2, 0, 0,
            0, 0.5, 2, 0, 0,
            0, 0, 0, 1, 0,
        ]);

        filter.destroy();
    });

    it('should have a helper function that can prepend 5x4 matrices', () =>
    {
        const filter = new ColorMatrixFilter({
            matrix: [
                2, 1, 0, 0, 0,
                0, 2, 0, 0, 0,
                0, 1, 2, 0, 0,
                0, 0, 0, 2, 0
            ],
        });

        filter.prepend([
            0.5, 0, 1, 0, 0,
            0, 0.5, 1, 0, 0,
            0, 0, 0.5, 0, 0,
            0, 0, 0, 0.5, 0,
        ]);

        expect(filter.matrix).toEqual([
            1, 1.5, 2, 0, 0,
            0, 2, 2, 0, 0,
            0, 0.5, 1, 0, 0,
            0, 0, 0, 1, 0,
        ]);

        filter.destroy();
    });
});

describe('ColorMatrixFilter deprecated functions', () =>
{
    it('should be able to call ColorMatrixFilter.brightness', () =>
    {
        const filter = new ColorMatrixFilter();

        filter.brightness(0);

        expect(filter.matrix).toEqual([
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 1, 0,
        ]);
    });
});
