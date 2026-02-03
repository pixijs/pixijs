/**
 * Common interface for points. Both Point and ObservablePoint implement it.
 * Provides a standard way to represent 2D coordinates.
 *
 * Many PixiJS methods accept PointData for transformations,
 * making it easy to work with different point types interchangeably.
 * @example
 * ```ts
 * // Create an object implementing PointData
 * const point: PointData = { x: 100, y: 200 };
 *
 * // Use with matrix transformations
 * const matrix = new Matrix();
 * matrix.translate(50, 50).apply(point);
 *
 * // Mix with other point types
 * const observablePoint = new ObservablePoint(() => {}, null, 0, 0);
 * const regularPoint = new Point(0, 0);
 * // All are PointData compatible
 * ```
 * @remarks
 * - Basic x,y coordinate interface
 * - Used by Point and ObservablePoint
 * @see {@link Point} For standard point implementation
 * @see {@link ObservablePoint} For observable point implementation
 * @category maths
 * @standard
 */
export interface PointData
{
    /** X coordinate */
    x: number;

    /** Y coordinate */
    y: number;
}
