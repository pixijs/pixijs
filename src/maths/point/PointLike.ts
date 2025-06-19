import type { PointData } from './PointData';

/**
 * Common interface for points with manipulation methods.
 *
 * Extends PointData to add operations for copying, comparison and setting values.
 * @example
 * ```ts
 * // Basic point manipulation
 * const point: PointLike = new Point(10, 20);
 * point.set(30, 40);
 *
 * // Copy between points
 * const other = new Point();
 * point.copyTo(other);
 *
 * // Compare points
 * const same = point.equals(other); // true
 * ```
 * @see {@link PointData} For basic x,y interface
 * @see {@link Point} For standard implementation
 * @see {@link ObservablePoint} For observable implementation
 * @category maths
 * @standard
 */
export interface PointLike extends PointData
{
    /**
     * Copies x and y from the given point
     * @param {PointData} p - The point to copy from
     * @returns {this} Returns itself.
     * @example
     * ```ts
     * const point1: PointLike = new Point(10, 20);
     * const point2: PointLike = new Point(30, 40);
     * point1.copyFrom(point2);
     * console.log(point1.x, point1.y); // 30, 40
     * ```
     */
    copyFrom: (p: PointData) => this;
    /**
     * Copies x and y into the given point
     * @param {PointLike} p - The point to copy.
     * @returns {PointLike} Given point with values updated
     * @example
     * ```ts
     * const point1: PointLike = new Point(10, 20);
     * const point2: PointLike = new Point(0, 0);
     * point1.copyTo(point2);
     * console.log(point2.x, point2.y); // 10, 20
     * ```
     */
    copyTo: <T extends PointLike>(p: T) => T;
    /**
     * Returns true if the given point is equal to this point
     * @param {PointData} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     * @example
     * ```ts
     * const point1: PointLike = new Point(10, 20);
     * const point2: PointLike = new Point(10, 20);
     * const point3: PointLike = new Point(30, 40);
     * console.log(point1.equals(point2)); // true
     * console.log(point1.equals(point3)); // false
     * ```
     */
    equals: (p: PointData) => boolean;
    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=x] - position of the point on the y axis
     * @example
     * ```ts
     * const point: PointLike = new Point(10, 20);
     * point.set(30, 40);
     * console.log(point.x, point.y); // 30, 40
     * point.set(50); // Sets both x and y to 50
     * console.log(point.x, point.y); // 50, 50
     * ```
     */
    set: (x?: number, y?: number) => void;
}

