/* eslint-disable @typescript-eslint/no-use-before-define */
import type { PointData } from './PointData';
import type { PointLike } from './PointLike';

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface Point extends PixiMixins.Point { }

/**
 * The Point object represents a location in a two-dimensional coordinate system, where `x` represents
 * the position on the horizontal axis and `y` represents the position on the vertical axis.
 *
 * Many Pixi functions accept the `PointData` type as an alternative to `Point`,
 * which only requires `x` and `y` properties.
 * @example
 * ```ts
 * // Basic point creation
 * const point = new Point(100, 200);
 *
 * // Using with transformations
 * const matrix = new Matrix();
 * matrix.translate(50, 50).apply(point);
 *
 * // Point arithmetic
 * const start = new Point(0, 0);
 * const end = new Point(100, 100);
 * const middle = new Point(
 *     (start.x + end.x) / 2,
 *     (start.y + end.y) / 2
 * );
 * ```
 * @see {@link PointData} For basic x,y interface
 * @see {@link PointLike} For point manipulation interface
 * @see {@link ObservablePoint} For observable version
 * @category maths
 * @standard
 */
export class Point implements PointLike
{
    /**
     * Position of the point on the x axis
     * @example
     * ```ts
     * // Set x position
     * const point = new Point();
     * point.x = 100;
     *
     * // Use in calculations
     * const width = rightPoint.x - leftPoint.x;
     * ```
     */
    public x = 0;
    /**
     * Position of the point on the y axis
     * @example
     * ```ts
     * // Set y position
     * const point = new Point();
     * point.y = 200;
     *
     * // Use in calculations
     * const height = bottomPoint.y - topPoint.y;
     * ```
     */
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
     * Creates a clone of this point, which is a new instance with the same `x` and `y` values.
     * @example
     * ```ts
     * // Basic point cloning
     * const original = new Point(100, 200);
     * const copy = original.clone();
     *
     * // Clone and modify
     * const modified = original.clone();
     * modified.set(300, 400);
     *
     * // Verify independence
     * console.log(original); // Point(100, 200)
     * console.log(modified); // Point(300, 400)
     * ```
     * @remarks
     * - Creates new Point instance
     * - Deep copies x and y values
     * - Independent from original
     * - Useful for preserving values
     * @returns A clone of this point
     * @see {@link Point.copyFrom} For copying into existing point
     * @see {@link Point.copyTo} For copying to existing point
     */
    public clone(): Point
    {
        return new Point(this.x, this.y);
    }

    /**
     * Copies x and y from the given point into this point.
     * @example
     * ```ts
     * // Basic copying
     * const source = new Point(100, 200);
     * const target = new Point();
     * target.copyFrom(source);
     *
     * // Copy and chain operations
     * const point = new Point()
     *     .copyFrom(source)
     *     .set(x + 50, y + 50);
     *
     * // Copy from any PointData
     * const data = { x: 10, y: 20 };
     * point.copyFrom(data);
     * ```
     * @param p - The point to copy from
     * @returns The point instance itself
     * @see {@link Point.copyTo} For copying to another point
     * @see {@link Point.clone} For creating new point copy
     */
    public copyFrom(p: PointData): this
    {
        this.set(p.x, p.y);

        return this;
    }

    /**
     * Copies this point's x and y into the given point.
     * @example
     * ```ts
     * // Basic copying
     * const source = new Point(100, 200);
     * const target = new Point();
     * source.copyTo(target);
     * ```
     * @param p - The point to copy to. Can be any type that is or extends `PointLike`
     * @returns The point (`p`) with values updated
     * @see {@link Point.copyFrom} For copying from another point
     * @see {@link Point.clone} For creating new point copy
     */
    public copyTo<T extends PointLike>(p: T): T
    {
        p.set(this.x, this.y);

        return p;
    }

    /**
     * Checks if another point is equal to this point.
     *
     * Compares x and y values using strict equality.
     * @example
     * ```ts
     * // Basic equality check
     * const p1 = new Point(100, 200);
     * const p2 = new Point(100, 200);
     * console.log(p1.equals(p2)); // true
     *
     * // Compare with PointData
     * const data = { x: 100, y: 200 };
     * console.log(p1.equals(data)); // true
     *
     * // Check different points
     * const p3 = new Point(200, 300);
     * console.log(p1.equals(p3)); // false
     * ```
     * @param p - The point to check
     * @returns `true` if both `x` and `y` are equal
     * @see {@link Point.copyFrom} For making points equal
     * @see {@link PointData} For point data interface
     */
    public equals(p: PointData): boolean
    {
        return (p.x === this.x) && (p.y === this.y);
    }

    /**
     * Sets the point to a new x and y position.
     *
     * If y is omitted, both x and y will be set to x.
     * @example
     * ```ts
     * // Basic position setting
     * const point = new Point();
     * point.set(100, 200);
     *
     * // Set both x and y to same value
     * point.set(50); // x=50, y=50
     *
     * // Chain with other operations
     * point
     *     .set(10, 20)
     *     .copyTo(otherPoint);
     * ```
     * @param x - Position on the x axis
     * @param y - Position on the y axis, defaults to x
     * @returns The point instance itself
     * @see {@link Point.copyFrom} For copying from another point
     * @see {@link Point.equals} For comparing positions
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
     * A static Point object with `x` and `y` values of `0`.
     *
     * This shared instance is reset to zero values when accessed.
     *
     * > [!IMPORTANT] This point is shared and temporary. Do not store references to it.
     * @example
     * ```ts
     * // Use for temporary calculations
     * const tempPoint = Point.shared;
     * tempPoint.set(100, 200);
     * matrix.apply(tempPoint);
     *
     * // Will be reset to (0,0) on next access
     * const fresh = Point.shared; // x=0, y=0
     * ```
     * @readonly
     * @returns A fresh zeroed point for temporary use
     * @see {@link Point.constructor} For creating new points
     * @see {@link PointData} For basic point interface
     */
    static get shared(): Point
    {
        tempPoint.x = 0;
        tempPoint.y = 0;

        return tempPoint;
    }
}

const tempPoint = new Point();
