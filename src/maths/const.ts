/**
 * Two Pi.
 * @static
 * @member {number}
 */
export const PI_2 = Math.PI * 2;

/**
 * Conversion factor for converting radians to degrees.
 * @static
 * @member {number} RAD_TO_DEG
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Conversion factor for converting degrees to radians.
 * @static
 * @member {number}
 */
export const DEG_TO_RAD = Math.PI / 180;

/** Constants that identify shapes, mainly to prevent `instanceof` calls. */
export type SHAPE_PRIMITIVE =
    | 'polygon'
    | 'rectangle'
    | 'circle'
    | 'ellipse'
    | 'triangle'
    | 'roundedRectangle';

