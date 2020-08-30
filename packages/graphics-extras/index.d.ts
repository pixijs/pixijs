import type { Graphics } from '@pixi/graphics';

/**
 * Draw Rectangle with chamfer corners.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawChamferRect
 * @param {number} x - Upper left corner of rect
 * @param {number} y - Upper right corner of rect
 * @param {number} width - Width of rect
 * @param {number} height - Height of rect
 * @param {number} chamfer - accept negative or positive values
 * @return {PIXI.Graphics} Returns self.
 */
declare function drawChamferRect(this: Graphics, x: number, y: number, width: number, height: number, chamfer: number): Graphics;

/**
 * Draw Rectangle with fillet corners.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawFilletRect
 * @param {number} x - Upper left corner of rect
 * @param {number} y - Upper right corner of rect
 * @param {number} width - Width of rect
 * @param {number} height - Height of rect
 * @param {number} fillet - non-zero real number, size of corner cutout
 * @return {PIXI.Graphics} Returns self.
 */
declare function drawFilletRect(this: Graphics, x: number, y: number, width: number, height: number, fillet: number): Graphics;

/**
 * Draw a regular polygon where all sides are the same length.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawRegularPolygon
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Polygon radius
 * @param {number} sides - Minimum value is 3
 * @param {number} rotation - Starting rotation values in radians..
 * @return {PIXI.Graphics}
 */
declare function drawRegularPolygon(this: Graphics, x: number, y: number, radius: number, sides: number, rotation?: number): Graphics;

/**
 * Draw a torus shape, like a donut. Can be used for something like a circle loader.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawTorus
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} innerRadius - Inner circle radius
 * @param {number} outerRadius - Outer circle radius
 * @param {number} sweep - How much of the circle to fill, in radius
 * @return {PIXI.Graphics}
 */
declare function drawTorus(this: Graphics, x: number, y: number, innerRadius: number, outerRadius: number, startArc?: number, endArc?: number): Graphics;

export declare interface IGraphicsExtras {
    drawTorus: typeof drawTorus;
    drawChamferRect: typeof drawChamferRect;
    drawFilletRect: typeof drawFilletRect;
    drawRegularPolygon: typeof drawRegularPolygon;
}

export { }
