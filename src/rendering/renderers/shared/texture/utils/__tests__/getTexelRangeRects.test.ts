import { getTexelRangeRects } from '../getTexelRangeRects';
import { Rectangle } from '~/maths';

type Rect = [x: number, y: number, width: number, height: number];

function rects(start: number, end: number, width: number, height: number): Rect[]
{
    const out = [new Rectangle(), new Rectangle(), new Rectangle()];
    const count = getTexelRangeRects(start, end, width, height, out);

    return out.slice(0, count).map((r) => [r.x, r.y, r.width, r.height]);
}

describe('getTexelRangeRects', () =>
{
    it('should cover the whole texture with one rect', () =>
    {
        expect(rects(0, Infinity, 8, 4)).toEqual([[0, 0, 8, 4]]);
        expect(rects(0, 32, 8, 4)).toEqual([[0, 0, 8, 4]]);
    });

    it('should upload a single texel as a 1x1 rect', () =>
    {
        expect(rects(13, 14, 8, 4)).toEqual([[5, 1, 1, 1]]);
    });

    it('should keep a range inside one row as one rect', () =>
    {
        expect(rects(9, 15, 8, 4)).toEqual([[1, 1, 6, 1]]);
    });

    it('should keep a range ending exactly at a row end as one rect', () =>
    {
        expect(rects(10, 16, 8, 4)).toEqual([[2, 1, 6, 1]]);
    });

    it('should merge whole rows into one rect', () =>
    {
        expect(rects(8, 24, 8, 4)).toEqual([[0, 1, 8, 2]]);
    });

    it('should split a range into partial first row, whole rows and partial last row', () =>
    {
        expect(rects(5, 29, 8, 4)).toEqual([
            [5, 0, 3, 1],
            [0, 1, 8, 2],
            [0, 3, 5, 1],
        ]);
    });

    it('should split a range across one row boundary into two rects', () =>
    {
        expect(rects(6, 10, 8, 4)).toEqual([
            [6, 0, 2, 1],
            [0, 1, 2, 1],
        ]);
    });

    it('should end at a partial last row that starts on a row boundary', () =>
    {
        expect(rects(8, 20, 8, 4)).toEqual([
            [0, 1, 8, 1],
            [0, 2, 4, 1],
        ]);
    });

    it('should start mid-row and end on a row boundary', () =>
    {
        expect(rects(5, 24, 8, 4)).toEqual([
            [5, 0, 3, 1],
            [0, 1, 8, 2],
        ]);
    });

    it('should clamp the range to the texture', () =>
    {
        expect(rects(-4, 3, 8, 4)).toEqual([[0, 0, 3, 1]]);
        expect(rects(30, 100, 8, 4)).toEqual([[6, 3, 2, 1]]);
    });

    it('should write nothing for an empty range', () =>
    {
        expect(rects(10, 10, 8, 4)).toEqual([]);
        expect(rects(12, 4, 8, 4)).toEqual([]);
        expect(rects(40, 50, 8, 4)).toEqual([]);
    });
});
