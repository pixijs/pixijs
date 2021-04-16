import type { IPoint } from './IPoint';
import type { IPointData } from './IPointData';

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @implements IPoint
 */
export class Point implements IPoint
{
    /** Position of the point on the x axis */
    public x = 0;
    /** Position of the point on the y axis */
    public y = 0;

    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    /** Creates a clone of this point */
    clone(): Point
    {
        return new Point(this.x, this.y);
    }

    /**
     * Copies x and y from the given point
     *
     * @param p - The point to copy from
     * @returns Returns itself
     */
    copyFrom(p: IPointData): this
    {
        this.set(p.x, p.y);

        return this;
    }

    /**
     * Copies x and y into the given point
     *
     * @param p - The point to copy
     * @returns Given point with values updated
     */
    copyTo<T extends IPoint>(p: T): T
    {
        p.set(this.x, this.y);

        return p;
    }

    /**
     * Returns true if the given point is equal to this point
     *
     * @param p - The point to check
     * @returns `true` if the given point equal to this point
     */
    equals(p: IPointData): boolean
    {
        return (p.x === this.x) && (p.y === this.y);
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param x - position of the point on the x axis
     * @param y - position of the point on the y axis
     * @returns Returns itself
     */
    set(x = 0, y = x): this
    {
        this.x = x;
        this.y = y;

        return this;
    }

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:Point x=${this.x} y=${this.y}]`;
    }
    // #endif
}
