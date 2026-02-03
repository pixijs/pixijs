import type { SHAPE_PRIMITIVE } from '../misc/const';
import type { Rectangle } from './Rectangle';

/**
 * A basic interface that defines common properties and methods for all Pixi shape primitives.
 * Provides a standard API for shape manipulation, hit testing, and bounds calculation.
 * @example
 * ```ts
 * // Implement basic shape
 * class CustomShape implements ShapePrimitive {
 *     public readonly type = 'custom';
 *     public x = 0;
 *     public y = 0;
 *
 *     // Implement required methods
 *     public contains(x: number, y: number): boolean {
 *         // Custom hit testing logic
 *         return true;
 *     }
 *
 *     public getBounds(out?: Rectangle): Rectangle {
 *         // Custom bounds calculation
 *         return out || new Rectangle();
 *     }
 *
 *     // ... implement other required methods
 * }
 * // Use in a container
 * container.hitArea = new CustomShape();
 * ```
 * @see {@link Rectangle} For rectangular shape implementation
 * @see {@link Circle} For circular shape implementation
 * @see {@link Polygon} For polygon shape implementation
 * @category maths
 * @advanced
 */
export interface ShapePrimitive
{
    /** The type of the object, mainly used to avoid `instanceof` checks */
    readonly type: SHAPE_PRIMITIVE | (string & {});

    /** Checks whether the x and y coordinates passed to this function are contained within this ShapePrimitive. */
    contains(x: number, y: number): boolean;
    /** Checks whether the x and y coordinates passed to this function are contained within the stroke of this shape */
    strokeContains(x: number, y: number, strokeWidth: number, alignment?: number): boolean;
    /** Creates a clone of this ShapePrimitive instance. */
    clone(): ShapePrimitive;
    /** Copies the properties from another ShapePrimitive to this ShapePrimitive. */
    copyFrom(source: ShapePrimitive): void;
    /** Copies the properties from this ShapePrimitive to another ShapePrimitive. */
    copyTo(destination: ShapePrimitive): void;
    /** Returns the framing rectangle of the ShapePrimitive as a Rectangle object. */
    getBounds(out?: Rectangle): Rectangle;

    /** The X coordinate of the shape */
    readonly x: number;
    /** The Y coordinate of the shape */
    readonly y: number;
}
