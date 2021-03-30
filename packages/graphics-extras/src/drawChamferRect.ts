import type { Graphics } from '@pixi/graphics';

/**
 * Draw Rectangle with chamfer corners. These are angled corners.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @instance
 * @memberof PIXI.Graphics
 * @method drawChamferRect
 * @param {number} x - Upper left corner of rect
 * @param {number} y - Upper right corner of rect
 * @param {number} width - Width of rect
 * @param {number} height - Height of rect
 * @param {number} chamfer - non-zero real number, size of corner cutout
 * @return {PIXI.Graphics} Returns self.
 */
export function drawChamferRect(this: Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    chamfer: number): Graphics
{
    if (chamfer <= 0)
    {
        return this.drawRect(x, y, width, height);
    }

    const inset = Math.min(chamfer, Math.min(width, height) / 2);
    const right = x + width;
    const bottom = y + height;
    const points = [
        x + inset, y,
        right - inset, y,
        right, y + inset,
        right, bottom - inset,
        right - inset, bottom,
        x + inset, bottom,
        x, bottom - inset,
        x, y + inset,
    ];

    // Remove overlapping points
    for (let i = points.length - 1; i >= 2; i -= 2)
    {
        if (points[i] === points[i - 2] && points[i - 1] === points[i - 3])
        {
            points.splice(i - 1, 2);
        }
    }

    return this.drawPolygon(points);
}
