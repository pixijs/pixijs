import type { IPointData } from './IPointData';
import type { IPoint } from './IPoint';

export interface ObservablePoint extends GlobalMixins.Point, IPoint {}

/**
 * The ObservablePoint object represents a location in a two-dimensional coordinate system, where `x` represents
 * the position on the horizontal axis and `y` represents the position on the vertical axis.
 *
 * An `ObservablePoint` is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 * @implements IPoint
 */

export class ObservablePoint<T = any> implements IPoint
{
    /** The callback function triggered when `x` and/or `y` are changed */
    public cb: (this: T) => any;

    /** The owner of the callback */
    public scope: any;

    _x: number;
    _y: number;

    /**
     * Creates a new `ObservablePoint`
     *
     * @param cb - callback function triggered when `x` and/or `y` are changed
     * @param scope - owner of callback
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
    */
    constructor(cb: (this: T) => any, scope: T, x = 0, y = 0)
    {
        this._x = x;
        this._y = y;

        this.cb = cb;
        this.scope = scope;
    }

    /**
     * Creates a clone of this point.
     * The callback and scope params can be overridden otherwise they will default
     * to the clone object's values.
     *
     * @override
     * @param cb - The callback function triggered when `x` and/or `y` are changed
     * @param scope - The owner of the callback
     * @return a copy of this observable point
     */
    clone(cb = this.cb, scope = this.scope): ObservablePoint
    {
        return new ObservablePoint(cb, scope, this._x, this._y);
    }

    /**
     * Sets the point to a new `x` and `y` position.
     * If `y` is omitted, both `x` and `y` will be set to `x`.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     * @returns The observable point instance itself
     */
    set(x = 0, y = x): this
    {
        if (this._x !== x || this._y !== y)
        {
            this._x = x;
            this._y = y;
            this.cb.call(this.scope);
        }

        return this;
    }

    /**
     * Copies x and y from the given point (`p`)
     *
     * @param p - The point to copy from. Can be any of type that is or extends `IPointData`
     * @returns The observable point instance itself
     */
    copyFrom(p: IPointData): this
    {
        if (this._x !== p.x || this._y !== p.y)
        {
            this._x = p.x;
            this._y = p.y;
            this.cb.call(this.scope);
        }

        return this;
    }

    /**
     * Copies this point's x and y into that of the given point (`p`)
     *
     * @param p - The point to copy to. Can be any of type that is or extends `IPointData`
     * @returns The point (`p`) with values updated
     */
    copyTo<T extends IPoint>(p: T): T
    {
        p.set(this._x, this._y);

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
        return (p.x === this._x) && (p.y === this._y);
    }

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:ObservablePoint x=${0} y=${0} scope=${this.scope}]`;
    }
    // #endif

    /** Position of the observable point on the x axis
     * @type {number}
     */
    get x(): number
    {
        return this._x;
    }

    set x(value: number)
    {
        if (this._x !== value)
        {
            this._x = value;
            this.cb.call(this.scope);
        }
    }

    /** Position of the observable point on the y axis
     * @type {number}
     */
    get y(): number
    {
        return this._y;
    }

    set y(value: number)
    {
        if (this._y !== value)
        {
            this._y = value;
            this.cb.call(this.scope);
        }
    }
}
