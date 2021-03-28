import type { Graphics } from '@pixi/graphics';

/**
 * Draw Rectangle with fillet corners. This is much like rounded rectangle
 * however it support negative numbers as well for the corner radius.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @instance
 * @memberof PIXI.Graphics
 * @method drawFilletRect
 * @param {number} x - Upper left corner of rect
 * @param {number} y - Upper right corner of rect
 * @param {number} width - Width of rect
 * @param {number} height - Height of rect
 * @param {number} fillet - accept negative or positive values
 * @return {PIXI.Graphics} Returns self.
 */
export function drawFilletRect(this: Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    fillet: number): Graphics
{
    if (fillet === 0)
    {
        return this.drawRect(x, y, width, height);
    }

    const maxFillet = Math.min(width, height) / 2;
    const inset = Math.min(maxFillet, Math.max(-maxFillet, fillet));
    const right = x + width;
    const bottom = y + height;
    const dir = inset < 0 ? -inset : 0;
    const size = Math.abs(inset);

    return this
        .moveTo(x, y + size)
        .arcTo(x + dir, y + dir, x + size, y, size)
        .lineTo(right - size, y)
        .arcTo(right - dir, y + dir, right, y + size, size)
        .lineTo(right, bottom - size)
        .arcTo(right - dir, bottom - dir, x + width - size, bottom, size)
        .lineTo(x + size, bottom)
        .arcTo(x + dir, bottom - dir, x, bottom - size, size)
        .closePath();
}
