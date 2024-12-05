/* eslint-disable @typescript-eslint/no-use-before-define */
import type { PointData } from './PointData';
import type { PointLike } from './PointLike';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Point extends PixiMixins.Point { }

/**
 * The Point object represents a location in a two-dimensional coordinate system, where `x` represents
 * the position on the horizontal axis and `y` represents the position on the vertical axis.
 * <br/>
 * Many Pixi functions accept the `PointData` type as an alternative to `Point`,
 * which only requires `x` and `y` properties.
 * @class
 * @implements {PointLike}
 * @memberof maths
 */
export class Point implements PointLike
{
    /** Position of the point on the x axis */
    public x = 0;
    /** Position of the point on the y axis */
    public y = 0;

    /**
     * Creates a new `Point`
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    /**
     * Creates a clone of this point
     * @returns A clone of this point
     */
    public clone(): Point
    {
        return new Point(this.x, this.y);
    }

    /**
     * Copies `x` and `y` from the given point into this point
     * @param p - The point to copy from
     * @returns The point instance itself
     */
    public copyFrom(p: PointData): this
    {
        this.set(p.x, p.y);

        return this;
    }

    /**
     * Copies this point's x and y into the given point (`p`).
     * @param p - The point to copy to. Can be any of type that is or extends `PointData`
     * @returns The point (`p`) with values updated
     */
    public copyTo<T extends PointLike>(p: T): T
    {
        p.set(this.x, this.y);

        return p;
    }

    /**
     * Accepts another point (`p`) and returns `true` if the given point is equal to this point
     * @param p - The point to check
     * @returns Returns `true` if both `x` and `y` are equal
     */
    public equals(p: PointData): boolean
    {
        return (p.x === this.x) && (p.y === this.y);
    }

    /**
     * Sets the point to a new `x` and `y` position.
     * If `y` is omitted, both `x` and `y` will be set to `x`.
     * @param {number} [x=0] - position of the point on the `x` axis
     * @param {number} [y=x] - position of the point on the `y` axis
     * @returns The point instance itself
     */
    public set(x = 0, y: number = x): this
    {
        this.x = x;
        this.y = y;

        return this;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Point x=${this.x} y=${this.y}]`;
    }
    // #endif

    /**
     * A static Point object with `x` and `y` values of `0`. Can be used to avoid creating new objects multiple times.
     * @readonly
     */
    static get shared(): Point
    {
        tempPoint.x = 0;
        tempPoint.y = 0;

        return tempPoint;
    }
}

const tempPoint = new Point();
