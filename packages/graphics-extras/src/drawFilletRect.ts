import type { Graphics } from '@pixi/graphics';

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
export function drawFilletRect(this: Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    fillet: number): Graphics
{
    if (fillet <= 0)
    {
        return this.drawRect(x, y, width, height);
    }

    const inset = Math.min(fillet, Math.min(width, height) / 2);
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
