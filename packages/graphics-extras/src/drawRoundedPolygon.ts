import type { Graphics } from '@pixi/graphics';

/**
 * Draw a regular polygon with rounded corners.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawRoundedPolygon
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Polygon radius
 * @param {number} sides - Minimum value is 3
 * @param {number} corner - Corner size in pixels.
 * @param {number} rotation - Starting rotation values in radians..
 * @return {PIXI.Graphics}
 */
export function drawRoundedPolygon(this: Graphics,
    x: number,
    y: number,
    radius: number,
    sides: number,
    corner: number,
    rotation = 0): Graphics
{
    sides = Math.max((sides | 0), 3);

    if (corner <= 0)
    {
        return this.drawRegularPolygon(x, y, radius, sides, rotation);
    }

    const sideLength = (radius * Math.sin(Math.PI / sides)) - 0.001;

    corner = Math.min(corner, sideLength);

    const startAngle = (-1 * Math.PI / 2) + rotation;
    const delta = (Math.PI * 2) / sides;
    const internalAngle = ((sides - 2) * Math.PI) / sides / 2;

    for (let i = 0; i < sides; i++)
    {
        const angle = (i * delta) + startAngle;
        const x0 = x + (radius * Math.cos(angle));
        const y0 = y + (radius * Math.sin(angle));
        const a1 = angle + (Math.PI) + internalAngle;
        const a2 = angle - (Math.PI) - internalAngle;
        const x1 = x0 + (corner * Math.cos(a1));
        const y1 = y0 + (corner * Math.sin(a1));
        const x3 = x0 + (corner * Math.cos(a2));
        const y3 = y0 + (corner * Math.sin(a2));

        if (i === 0)
        {
            this.moveTo(x1, y1);
        }
        else
        {
            this.lineTo(x1, y1);
        }
        this.quadraticCurveTo(x0, y0, x3, y3);
    }

    return this.closePath();
}
