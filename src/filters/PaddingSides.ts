import type { Filter } from './Filter';

/**
 * class used for paddings of text styles and filters
 * @category filters
 * @advanced
 */
export class PaddingSides
{
    public top: number = 0;
    public right: number = 0;
    public bottom: number = 0;
    public left: number = 0;

    get horizontal()
    {
        return this.left + this.right;
    }

    get vertical()
    {
        return this.top + this.bottom;
    }

    public copyFrom(sides: IPaddingSidesLike): this
    {
        if (!sides)
        {
            this.top = 0;
            this.right = 0;
            this.bottom = 0;
            this.left = 0;
        }
        else if (typeof sides === 'number')
        {
            this.top = sides;
            this.right = sides;
            this.bottom = sides;
            this.left = sides;
        }
        else if (sides instanceof Array)
        {
            this.top = (sides as any)[0];
            this.right = (sides as any)[1];
            this.bottom = (sides as any)[2];
            this.left = (sides as any)[3];
        }
        else
        {
            this.top = sides.top || 0;
            this.right = sides.right || 0;
            this.bottom = sides.bottom || 0;
            this.left = sides.left || 0;
        }

        return this;
    }

    public unite(sides: IPaddingSidesLike): this
    {
        if (!sides)
        {
            return this;
        }

        if (typeof sides === 'number')
        {
            this.top = Math.max(this.top, sides);
            this.right = Math.max(this.right, sides);
            this.bottom = Math.max(this.bottom, sides);
            this.left = Math.max(this.left, sides);

            return this;
        }

        if (sides instanceof Array)
        {
            this.top = Math.max(this.top, sides[0]);
            this.right = Math.max(this.right, sides[1]);
            this.bottom = Math.max(this.bottom, sides[2]);
            this.left = Math.max(this.left, sides[3]);

            return this;
        }

        this.top = Math.max(this.top, sides.top);
        this.right = Math.max(this.right, sides.right);
        this.bottom = Math.max(this.bottom, sides.bottom);
        this.left = Math.max(this.left, sides.left);

        return this;
    }

    public ceil(): this
    {
        this.top = Math.ceil(this.top);
        this.right = Math.ceil(this.right);
        this.bottom = Math.ceil(this.bottom);
        this.left = Math.ceil(this.left);

        return this;
    }

    /**
     * Pads PaddingSides object, making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     * @param paddingX - The horizontal padding amount.
     * @param paddingY - The vertical padding amount.
     */
    public pad(paddingX: number, paddingY: number = paddingX): this
    {
        this.left += paddingX;
        this.right += paddingX;

        this.top += paddingY;
        this.bottom += paddingY;

        return this;
    }

    public static fromDistanceRotation(rotation: number, distance: number, blur: number = 0): PaddingSides | number
    {
        if (!distance)
        {
            return blur;
        }

        const res = new PaddingSides();

        const x = Math.cos(rotation) * distance;
        const y = Math.sin(rotation) * distance;

        res.top = -Math.min(0, y - blur);
        res.bottom = Math.max(0, y + blur);
        res.left = -Math.min(0, x - blur);
        res.right = Math.max(0, x + blur);

        return res.ceil();
    }

    public static applyFilters(padding: PaddingSides | number, filters: Filter[]): PaddingSides | number
    {
        let filterPadding = 0;

        for (let i = 0; i < filters.length; i++)
        {
            filterPadding += filters[i].padding;
        }

        if (typeof padding === 'number')
        {
            return padding + filterPadding;
        }

        return padding.pad(filterPadding);
    }
}

/**
 * Padding data that can be passed to text or filter: single number, or array, or object. Like in CSS.
 * @category filters
 * @standard
 */
export type IPaddingSidesLike = PaddingSides | [number, number, number, number] | number;
