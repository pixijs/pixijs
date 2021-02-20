import type { Graphics } from '@pixi/graphics';

/**
 * Draw a torus shape, like a donut. Can be used for something like a circle loader.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @instance
 * @memberof PIXI.Graphics
 * @method drawTorus
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} innerRadius - Inner circle radius
 * @param {number} outerRadius - Outer circle radius
 * @param {number} [startArc=0] - Where to begin sweep, in radians, 0.0 = to the right
 * @param {number} [endArc=Math.PI*2] - Where to end sweep, in radians
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
    if (Math.abs(endArc - startArc) >= Math.PI * 2)
    {
        return this
            .drawCircle(x, y, outerRadius)
            .beginHole()
            .drawCircle(x, y, innerRadius)
            .endHole();
    }

    this.finishPoly();
    this
        .arc(x, y, innerRadius, endArc, startArc, true)
        .arc(x, y, outerRadius, startArc, endArc, false)
        .finishPoly();

    return this;
}
