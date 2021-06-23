import type { IPoint } from './IPoint';
import type { IPointData } from './IPointData';

export interface Point extends GlobalMixins.Point, IPoint {}

/**
 * The Point object represents a location in a two-dimensional coordinate system, where `x` represents
 * the position on the horizontal axis and `y` represents the position on the vertical axis
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

    /** Creates a new `Point`
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    /** Creates a clone of this point
     * @returns A clone of this point
     */
    clone(): Point
    {
        return new Point(this.x, this.y);
    }

    /**
     * Copies `x` and `y` from the given point into this point
     *
     * @param p - The point to copy from
     * @returns The point instance itself
     */
    copyFrom(p: IPointData): this
    {
        this.set(p.x, p.y);

        return this;
    }

    /**
     * Copies this point's x and y into the given point (`p`).
     *
     * @param p - The point to copy to. Can be any of type that is or extends `IPointData`
     * @returns The point (`p`) with values updated
     */
    copyTo<T extends IPoint>(p: T): T
    {
        p.set(this.x, this.y);

        return p;
    }

    /**
     * Accepts another point (`p`) and returns `true` if the given point is equal to this point
     *
     * @param p - The point to check
     * @returns Returns `true` if both `x` and `y` are equal
     */
    equals(p: IPointData): boolean
    {
        return (p.x === this.x) && (p.y === this.y);
    }

    /**
     * Sets the point to a new `x` and `y` position.
     * If `y` is omitted, both `x` and `y` will be set to `x`.
     *
     * @param {number} [x=0] - position of the point on the `x` axis
     * @param {number} [y=x] - position of the point on the `y` axis
     * @returns The point instance itself
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
