import type { Graphics } from '@pixi/graphics';

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
export function drawTorus(this: Graphics,
    x: number,
    y: number,
    innerRadius: number,
    outerRadius: number,
    startArc = 0,
    endArc: number = Math.PI * 2): Graphics
{
    if ((endArc - startArc) >= Math.PI * 2)
    {
        return this
            .drawCircle(x, y, outerRadius)
            .beginHole()
            .drawCircle(x, y, innerRadius)
            .endHole();
    }

    return this
        .arc(x, y, innerRadius, endArc, startArc, true)
        .arc(x, y, outerRadius, startArc, endArc, false)
        .closePath();
}
