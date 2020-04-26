import { Rectangle } from 'pixi.js';

const rangePool: Range[] = [];

/**
 * new interval from pool
 * @returns {Range}
 */
function newRange(): Range
{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return rangePool.pop() || new Range();
}

export class Range
{
    start: number;
    end: number;
    mark: boolean;

    constructor(start?: number, end?: number, mark = false)
    {
        this.start = 0;
        this.end = 0;
        this.set(start, end, mark);
    }

    get length(): number
    {
        return this.end - this.start + 1;
    }

    overlaps(start: number, end: number): boolean
    {
        if (start < this.start)
        {
            return end > this.start && end < this.end;
        }

        return start < this.end;
    }

    fits(start: number, end: number): boolean
    {
        return this.start <= start && this.end >= end;
    }

    splitAround(start: number, end: number, mark = true): Range[]
    {
        const beforeSize = start - this.start;
        const afterSize = this.end - end;

        const subintervals = [];

        if (beforeSize > 0)
        {
            subintervals.push(newRange().set(this.start, start - 1));
        }

        subintervals.push(newRange().set(start, end, mark));

        if (afterSize > 0)
        {
            subintervals.push(newRange().set(end + 1, this.end));
            // subintervals[subintervals.length - 1].isend = true;
        }

        return subintervals;
    }

    set(start: number, end: number, mark = false): Range
    {
        this.start = start;
        this.end = end;
        this.mark = mark;

        return this;
    }

    destroy(): void
    {
        rangePool.push(this);
        this.mark = false;
    }
}

// Merges the vacant tiles in a grid into "rectangles" of tiles.
export class TileMerger
{
    rows: number;
    columns: number;
    area: number;

    _tiles: boolean[];
    _intervalTable: Range[][];

    _breakerContext: { subIntervals: Range[]; mappedRects: Rectangle[] };

    constructor(rows: number, columns: number)
    {
        this.rows = rows;
        this.columns = columns;
        this.area = rows * columns;
        this._tiles = new Array(rows * columns);
        this._intervalTable = new Array(rows);

        this._breakerContext = {
            subIntervals: null,
            mappedRects: null,
        };
    }

    /**
     * Reset this healer to a new configuration. The grid size is increased if needed.
     *
     * @param {number} rows
     * @param {number} columns
     * @param {Function} loader - should initialize the grid for healing
     */
    reset(rows: number, columns: number, loader: (arg: boolean[]) => void): void
    {
        this.rows = rows;
        this.columns = columns;
        this.area = rows * columns;

        if (this._tiles.length < this.area)
        {
            this._tiles.length = this.area;
        }

        if (loader)
        {
            this.load(loader);
        }
    }

    load(loader: (arg: boolean[]) => void, resetValues = true): void
    {
        if (resetValues)
        {
            for (let i = 0; i < this.area; i++)
            {
                this._tiles[i] = false;
            }
        }

        loader(this._tiles);
    }

    heal(): Rectangle[]
    {
        const intervals = this._buildRangeTable();

        const basket = [];
        let current: Rectangle[] = [];
        let next = [];

        // Merge
        for (let i = 0; i < this.rows; i++)
        {
            const { subIntervals, mappedRects } = this._breakIntervals(intervals[i], current);

            for (let f = 0; f < mappedRects.length; f++)
            {
                mappedRects[f].height++;
            }

            next = mappedRects;

            for (let t = 0, length = subIntervals.length; t < length; t++)
            {
                const { start, length: size, mark } = subIntervals[t];

                if (!mark)
                {
                    next.push(new Rectangle(start, i, size, 1));
                }
            }

            for (let c = 0; c < current.length; c++)
            {
                if (current[c].y !== i && next.indexOf(current[c]) === -1)
                {
                    basket.push(current[c]); // not in current anymore
                }
            }

            for (let z = 0; z < subIntervals.length; z++)
            {
                subIntervals[z].destroy();
            }

            current = next;
        }

        for (let i = 0; i < this._intervalTable.length; i++)
        {
            const intervals = this._intervalTable[i];

            if (intervals)
            {
                intervals.length = 0;
            }
        }

        basket.push(...current);

        return basket;
    }

    // Create an array indexed for each row, containing sets of continous intervals
    // grid elements. It updates the result in `this._intervalTable`.
    private _buildRangeTable(): Range[][]
    {
        const intervals = this._intervalTable;
        let inout = false; // in = true, out = false
        let start = -1;

        // Interval creation
        for (let i = 0; i < this.rows; i++)
        {
            if (intervals[i])
            {
                intervals[i].length = 0;
            }
            else
            {
                intervals[i] = [];
            }

            for (let j = 0; j < this.columns; j++)
            {
                const value = this._tiles[(i * this.columns) + j];

                if (value !== inout)
                {
                    if (value)
                    { // interval start
                        start = j;
                        inout = true;
                    }
                    else
                    { // interval end
                        intervals[i].push(newRange().set(start, j - 1));
                        inout = false;
                    }
                }
            }

            if (inout)
            { // interval ends at last column
                intervals[i].push(newRange().set(start, this.columns - 1));
                inout = false;
            }
        }

        this._intervalTable = intervals;

        return intervals;
    }

    // Finds the set of subintervals, equivalent to the given intervals, such that
    // each interval completely fits inside a rectangle's breadth or doesn't overlap
    // at all.
    //
    // The intervals that fit inside a rectangle's breadth are "marked".
    //
    // This also separates a list of rectangle that have a mapping to a subinterval in
    // `this.breakerContext.brokeRects`.
    private _breakIntervals(intervals: Range[], rects: Rectangle[]):
        { subIntervals: Range[]; mappedRects: Rectangle[]}
    {
        const rectsCount = rects.length;

        const subIntervals = [...intervals];
        const mappedRects = [];

        for (let subIndex = 0, rectSearchStart = 0; subIndex < subIntervals.length; subIndex++)
        {
            let interval = subIntervals[subIndex];

            let s = rectSearchStart; let
                fitFound = false;

            for (fitFound = false; s < rectsCount; s++)
            {
                const currentRect = rects[s];

                if (interval.fits(currentRect.left, currentRect.right - 1))
                {
                    mappedRects.push(currentRect);

                    const splitSubs = interval.splitAround(currentRect.left, currentRect.right - 1, true);

                    subIntervals.splice(subIndex, 1, ...splitSubs);
                    subIndex += splitSubs.length - 1;
                    interval = subIntervals[subIndex];

                    fitFound = true;
                }
                else if (fitFound)
                {
                    break; // if this is not a fit and fit already found, that means later rects can't fit either
                }
            }

            if (fitFound)
            {
                rectSearchStart = s; // next interval overlap with rects before
            }
        }

        this._breakerContext.subIntervals = subIntervals;
        this._breakerContext.mappedRects = mappedRects;

        return this._breakerContext;
    }
}
