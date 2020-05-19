import type { Graphics } from '@pixi/graphics';

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
export function drawRegularPolygon(this: Graphics,
    x: number,
    y: number,
    radius: number,
    sides: number,
    rotation = 0): Graphics
{
    sides = Math.max(sides | 0, 3);
    const startAngle = (-1 * Math.PI / 2) + rotation;
    const delta = (Math.PI * 2) / sides;
    const polygon = [];

    for (let i = 0; i < sides; i++)
    {
        const angle = (i * delta) + startAngle;

        polygon.push(
            x + (radius * Math.cos(angle)),
            y + (radius * Math.sin(angle))
        );
    }

    return this.drawPolygon(polygon);
}
