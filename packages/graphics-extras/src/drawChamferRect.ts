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
export function drawChamferRect(this: Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    chamfer: number): Graphics
{
    if (chamfer === 0)
    {
        return this.drawRect(x, y, width, height);
    }

    const maxChamfer = Math.min(width, height) / 2;
    const inset = Math.min(maxChamfer, Math.max(-maxChamfer, chamfer));
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
