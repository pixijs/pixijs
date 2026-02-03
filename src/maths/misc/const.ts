/**
 * Two Pi.
 * @type {number}
 * @category maths
 * @standard
 */
export const PI_2 = Math.PI * 2;

/**
 * Conversion factor for converting radians to degrees.
 * @type {number} RAD_TO_DEG
 * @category maths
 * @standard
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Conversion factor for converting degrees to radians.
 * @type {number}
 * @category maths
 * @standard
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Constants that identify shapes, mainly to prevent `instanceof` calls.
 * @category maths
 * @advanced
 */
export type SHAPE_PRIMITIVE =
    | 'polygon'
    | 'rectangle'
    | 'circle'
    | 'ellipse'
    | 'triangle'
    | 'roundedRectangle';
