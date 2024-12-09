import type { PointData } from './PointData';
import type { PointLike } from './PointLike';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ObservablePoint extends PixiMixins.ObservablePoint { }

/**
 * Observer used to listen for observable point changes.
 * @memberof maths
 */
export interface Observer<T>
{
    /** Callback to call when the point has updated. */
    _onUpdate: (point?: T) => void;
}

/**
 * The ObservablePoint object represents a location in a two-dimensional coordinate system, where `x` represents
 * the position on the horizontal axis and `y` represents the position on the vertical axis.
 *
 * An `ObservablePoint` is a point that triggers the `onUpdate` method on an observer when the point's position is changed.
 * @memberof maths
 */
export class ObservablePoint implements PointLike
{
    /** @ignore */
    public _x: number;
    /** @ignore */
    public _y: number;

    /** This object used to call the `onUpdate` callback when the point changes. */
    private readonly _observer: Observer<ObservablePoint>;

    /**
     * Creates a new `ObservablePoint`
     * @param observer - Observer to pass to listen for change events.
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(observer: Observer<ObservablePoint>, x?: number, y?: number)
    {
        this._x = x || 0;
        this._y = y || 0;

        this._observer = observer;
    }

    /**
     * Creates a clone of this point.
     * @param observer - Optional observer to pass to the new observable point.
     * @returns a copy of this observable point
     */
    public clone(observer?: Observer<ObservablePoint>): ObservablePoint
    {
        return new ObservablePoint(observer ?? this._observer, this._x, this._y);
    }

    /**
     * Sets the point to a new `x` and `y` position.
     * If `y` is omitted, both `x` and `y` will be set to `x`.
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     * @returns The observable point instance itself
     */
    public set(x = 0, y = x): this
    {
        if (this._x !== x || this._y !== y)
        {
            this._x = x;
            this._y = y;
            this._observer._onUpdate(this);
        }

        return this;
    }

    /**
     * Copies x and y from the given point (`p`)
     * @param p - The point to copy from. Can be any of type that is or extends `PointData`
     * @returns The observable point instance itself
     */
    public copyFrom(p: PointData): this
    {
        if (this._x !== p.x || this._y !== p.y)
        {
            this._x = p.x;
            this._y = p.y;
            this._observer._onUpdate(this);
        }

        return this;
    }

    /**
     * Copies this point's x and y into that of the given point (`p`)
     * @param p - The point to copy to. Can be any of type that is or extends `PointData`
     * @returns The point (`p`) with values updated
     */
    public copyTo<T extends PointLike>(p: T): T
    {
        p.set(this._x, this._y);

        return p;
    }

    /**
     * Accepts another point (`p`) and returns `true` if the given point is equal to this point
     * @param p - The point to check
     * @returns Returns `true` if both `x` and `y` are equal
     */
    public equals(p: PointData): boolean
    {
        return (p.x === this._x) && (p.y === this._y);
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:ObservablePoint x=${0} y=${0} scope=${this._observer}]`;
    }
    // #endif

    /** Position of the observable point on the x axis. */
    get x(): number
    {
        return this._x;
    }

    set x(value: number)
    {
        if (this._x !== value)
        {
            this._x = value;
            this._observer._onUpdate(this);
        }
    }

    /** Position of the observable point on the y axis. */
    get y(): number
    {
        return this._y;
    }

    set y(value: number)
    {
        if (this._y !== value)
        {
            this._y = value;
            this._observer._onUpdate(this);
        }
    }
}
