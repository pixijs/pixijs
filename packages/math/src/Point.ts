import type { IPoint } from './IPoint';

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
    public x: number;
    public y: number;

    /**
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(x = 0, y = 0)
    {
        /**
         * @member {number}
         * @default 0
         */
        this.x = x;

        /**
         * @member {number}
         * @default 0
         */
        this.y = y;
    }

    /**
     * Creates a clone of this point
     *
     * @return {PIXI.Point} a copy of the point
     */
    clone(): Point
    {
        return new Point(this.x, this.y);
    }

    /**
     * Copies x and y from the given point
     *
     * @param {PIXI.IPoint} p - The point to copy from
     * @returns {this} Returns itself.
     */
    copyFrom(p: IPoint): this
    {
        this.set(p.x, p.y);

        return this;
    }

    /**
     * Copies x and y into the given point
     *
     * @param {PIXI.IPoint} p - The point to copy.
     * @returns {PIXI.IPoint} Given point with values updated
     */
    copyTo<T extends IPoint>(p: T): T
    {
        p.set(this.x, this.y);

        return p;
    }

    /**
     * Returns true if the given point is equal to this point
     *
     * @param {PIXI.IPoint} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     */
    equals(p: IPoint): boolean
    {
        return (p.x === this.x) && (p.y === this.y);
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     * @returns {this} Returns itself.
     */
    set(x = 0, y = x): this
    {
        this.x = x;
        this.y = y;

        return this;
    }
}
