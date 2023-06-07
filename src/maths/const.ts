/**
 * Two Pi.
 * @static
 * @member {number}
 * @memberof PIXI
 */
export const PI_2 = Math.PI * 2;

/**
 * Conversion factor for converting radians to degrees.
 * @static
 * @member {number} RAD_TO_DEG
 * @memberof PIXI
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Conversion factor for converting degrees to radians.
 * @static
 * @member {number}
 * @memberof PIXI
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Constants that identify shapes, mainly to prevent `instanceof` calls.
 * @memberof PIXI
 */
export type SHAPE_PRIMITIVE =
    | 'polygon'
    | 'rectangle'
    | 'circle'
    | 'ellipse'
    | 'triangle'
    | 'roundedRectangle';

