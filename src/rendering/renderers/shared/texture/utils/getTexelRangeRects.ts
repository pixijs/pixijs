import type { Rectangle } from '../../../../../maths/shapes/Rectangle';

/**
 * Splits a linear texel range of a row-major texture into at most three rectangles: the partial
 * first row, the whole rows in between, and the partial last row. Each rectangle is contiguous in
 * the source data, so the uploader copies it straight from the flat array without row-length
 * unpack state. That keeps the split valid on WebGL1, WebGL2 and WebGPU.
 *
 * The function clamps the range to the texture, so `end = Infinity` runs to the last texel.
 * @param start - index of the first texel in the range
 * @param end - index one past the last texel in the range (exclusive, like `TypedArray.subarray`)
 * @param width - texture width in texels
 * @param height - texture height in texels
 * @param out - at least three rectangles to write into
 * @returns the number of rectangles written to `out` (0 to 3)
 * @internal
 */
export function getTexelRangeRects(start: number, end: number, width: number, height: number, out: Rectangle[]): number
{
    start = Math.max(0, start);
    end = Math.min(end, width * height);

    if (start >= end) return 0;

    const firstRow = Math.floor(start / width);
    const firstX = start - (firstRow * width);
    // end is exclusive, so lastRow holds lastX texels of the range
    const lastRow = Math.floor(end / width);
    const lastX = end - (lastRow * width);

    if (firstRow === lastRow)
    {
        out[0].set(firstX, firstRow, lastX - firstX, 1);

        return 1;
    }

    let count = 0;
    let firstFullRow = firstRow;

    if (firstX > 0)
    {
        out[count++].set(firstX, firstRow, width - firstX, 1);
        firstFullRow++;
    }

    if (lastRow > firstFullRow)
    {
        out[count++].set(0, firstFullRow, width, lastRow - firstFullRow);
    }

    if (lastX > 0)
    {
        out[count++].set(0, lastRow, lastX, 1);
    }

    return count;
}
