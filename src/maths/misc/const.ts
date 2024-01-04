/**
 * Two Pi.
 * @static
 * @member {number}
 * @memberof maths
 */
export const PI_2 = Math.PI * 2;

/**
 * Conversion factor for converting radians to degrees.
 * @static
 * @member {number} RAD_TO_DEG
 * @memberof maths
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Conversion factor for converting degrees to radians.
 * @static
 * @member {number}
 * @memberof maths
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Constants that identify shapes, mainly to prevent `instanceof` calls.
 * @memberof maths
 */
export type SHAPE_PRIMITIVE =
    | 'polygon'
    | 'rectangle'
    | 'circle'
    | 'ellipse'
    | 'triangle'
    | 'roundedRectangle';

/**
 * The `maths` folder contains utility classes and functions for mathematical operations used throughout the project.
 * This includes constants such as conversion factors for radians and degrees, as well as shapes such as polygons,
 * rectangles, circles, ellipses, triangles, and rounded rectangles.
 * ```js
 * import { RAD_TO_DEG, Circle } from 'pixi.js';
 *
 * // Convert 180 degrees to radians
 * const radians = 180 * RAD_TO_DEG;
 *
 * // test if a point is inside a circle
 * const isPointInCircle = new Circle(0, 0, 10).contains(0, 0); // true
 * ```
 * @namespace maths
 */
