import type { PointData } from './PointData';
import type { PointLike } from './PointLike';

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface ObservablePoint extends PixiMixins.ObservablePoint { }

/**
 * Observer used to listen for observable point changes.
 * Provides callback mechanism for point value updates.
 * @example
 * ```ts
 * // Basic observer implementation
 * const observer: Observer<ObservablePoint> = {
 *     _onUpdate: (point) => {
 *         console.log(`Point updated to (${point.x}, ${point.y})`);
 *     }
 * };
 *
 * // Create observable point with observer
 * const point = new ObservablePoint(observer, 100, 100);
 *
 * // Observer will be notified on changes
 * point.x = 200; // Logs: Point updated to (200, 100)
 * ```
 * @remarks
 * - Used internally by ObservablePoint
 * - Triggered on x/y changes
 * - Can track multiple points
 * - Useful for change detection
 * @typeParam T - The type of point being observed
 * @see {@link ObservablePoint} The observable point class
 * @see {@link PointLike} For point interface
 * @category maths
 * @standard
 */
export interface Observer<T>
{
    /**
     * Callback to call when the point has updated.
     * Triggered whenever x or y coordinates change.
     * @param point - The point that was updated
     */
    _onUpdate: (point?: T) => void;
}

/**
 * The ObservablePoint object represents a location in a two-dimensional coordinate system.
 * Triggers a callback when its position changes.
 *
 * The x and y properties represent the position on the horizontal and vertical axes, respectively.
 * @example
 * ```ts
 * // Basic observable point usage
 * const point = new ObservablePoint(
 *     { _onUpdate: (p) => console.log(`Updated to (${p.x}, ${p.y})`) },
 *     100, 100
 * );
 *
 * // Update triggers callback
 * point.x = 200; // Logs: Updated to (200, 100)
 * point.y = 300; // Logs: Updated to (200, 300)
 *
 * // Set both coordinates
 * point.set(50, 50); // Logs: Updated to (50, 50)
 * ```
 * @see {@link Point} For non-observable version
 * @see {@link Observer} For observer interface
 * @see {@link PointLike} For point interface
 * @category maths
 * @standard
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
     * @example
     * ```ts
     * // Basic cloning
     * const point = new ObservablePoint(observer, 100, 200);
     * const copy = point.clone();
     *
     * // Clone with new observer
     * const newObserver = {
     *     _onUpdate: (p) => console.log(`Clone updated: (${p.x}, ${p.y})`)
     * };
     * const watched = point.clone(newObserver);
     *
     * // Verify independence
     * watched.set(300, 400); // Only triggers new observer
     * ```
     * @param observer - Optional observer to pass to the new observable point
     * @returns A copy of this observable point
     * @see {@link ObservablePoint.copyFrom} For copying into existing point
     * @see {@link Observer} For observer interface details
     */
    public clone(observer?: Observer<ObservablePoint>): ObservablePoint
    {
        return new ObservablePoint(observer ?? this._observer, this._x, this._y);
    }

    /**
     * Sets the point to a new x and y position.
     *
     * If y is omitted, both x and y will be set to x.
     * @example
     * ```ts
     * // Basic position setting
     * const point = new ObservablePoint(observer);
     * point.set(100, 200);
     *
     * // Set both x and y to same value
     * point.set(50); // x=50, y=50
     * ```
     * @param x - Position on the x axis
     * @param y - Position on the y axis, defaults to x
     * @returns The point instance itself
     * @see {@link ObservablePoint.copyFrom} For copying from another point
     * @see {@link ObservablePoint.equals} For comparing positions
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
     * Copies x and y from the given point into this point.
     * @example
     * ```ts
     * // Basic copying
     * const source = new ObservablePoint(observer, 100, 200);
     * const target = new ObservablePoint();
     * target.copyFrom(source);
     *
     * // Copy and chain operations
     * const point = new ObservablePoint()
     *     .copyFrom(source)
     *     .set(x + 50, y + 50);
     *
     * // Copy from any PointData
     * const data = { x: 10, y: 20 };
     * point.copyFrom(data);
     * ```
     * @param p - The point to copy from
     * @returns The point instance itself
     * @see {@link ObservablePoint.copyTo} For copying to another point
     * @see {@link ObservablePoint.clone} For creating new point copy
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
     * Copies this point's x and y into the given point.
     * @example
     * ```ts
     * // Basic copying
     * const source = new ObservablePoint(100, 200);
     * const target = new ObservablePoint();
     * source.copyTo(target);
     * ```
     * @param p - The point to copy to. Can be any type that is or extends `PointLike`
     * @returns The point (`p`) with values updated
     * @see {@link ObservablePoint.copyFrom} For copying from another point
     * @see {@link ObservablePoint.clone} For creating new point copy
     */
    public copyTo<T extends PointLike>(p: T): T
    {
        p.set(this._x, this._y);

        return p;
    }

    /**
     * Checks if another point is equal to this point.
     *
     * Compares x and y values using strict equality.
     * @example
     * ```ts
     * // Basic equality check
     * const p1 = new ObservablePoint(100, 200);
     * const p2 = new ObservablePoint(100, 200);
     * console.log(p1.equals(p2)); // true
     *
     * // Compare with PointData
     * const data = { x: 100, y: 200 };
     * console.log(p1.equals(data)); // true
     *
     * // Check different points
     * const p3 = new ObservablePoint(200, 300);
     * console.log(p1.equals(p3)); // false
     * ```
     * @param p - The point to check
     * @returns `true` if both `x` and `y` are equal
     * @see {@link ObservablePoint.copyFrom} For making points equal
     * @see {@link PointData} For point data interface
     */
    public equals(p: PointData): boolean
    {
        return (p.x === this._x) && (p.y === this._y);
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:ObservablePoint x=${this._x} y=${this._y} scope=${this._observer}]`;
    }
    // #endif

    /**
     * Position of the observable point on the x axis.
     * Triggers observer callback when value changes.
     * @example
     * ```ts
     * // Basic x position
     * const point = new ObservablePoint(observer);
     * point.x = 100; // Triggers observer
     *
     * // Use in calculations
     * const width = rightPoint.x - leftPoint.x;
     * ```
     * @default 0
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
            this._observer._onUpdate(this);
        }
    }

    /**
     * Position of the observable point on the y axis.
     * Triggers observer callback when value changes.
     * @example
     * ```ts
     * // Basic y position
     * const point = new ObservablePoint(observer);
     * point.y = 200; // Triggers observer
     *
     * // Use in calculations
     * const height = bottomPoint.y - topPoint.y;
     * ```
     * @default 0
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
            this._observer._onUpdate(this);
        }
    }
}
