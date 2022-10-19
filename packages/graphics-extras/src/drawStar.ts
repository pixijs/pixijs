import type { Graphics } from '@pixi/graphics';
import { Polygon, PI_2 } from '@pixi/core';

/**
 * Draw a star shape with an arbitrary number of points.
 * @ignore
 */
class Star extends Polygon
{
    /**
     * @param x - Center X position of the star
     * @param y - Center Y position of the star
     * @param points - The number of points of the star, must be > 1
     * @param radius - The outer radius of the star
     * @param innerRadius - The inner radius between points, default half `radius`
     * @param rotation - The rotation of the star in radians, where 0 is vertical
     */
    constructor(x: number, y: number, points: number, radius: number, innerRadius?: number, rotation = 0)
    {
        innerRadius = innerRadius || radius / 2;

        const startAngle = (-1 * Math.PI / 2) + rotation;
        const len = points * 2;
        const delta = PI_2 / len;
        const polygon = [];

        for (let i = 0; i < len; i++)
        {
            const r = i % 2 ? innerRadius : radius;
            const angle = (i * delta) + startAngle;

            polygon.push(
                x + (r * Math.cos(angle)),
                y + (r * Math.sin(angle))
            );
        }

        super(polygon);
    }
}

/**
 * Draw a star shape with an arbitrary number of points.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 * @method PIXI.Graphics#drawStar
 * @param this
 * @param x - Center X position of the star
 * @param y - Center Y position of the star
 * @param points - The number of points of the star, must be > 1
 * @param radius - The outer radius of the star
 * @param innerRadius - The inner radius between points, default half `radius`
 * @param rotation - The rotation of the star in radians, where 0 is vertical
 * @returns - This Graphics object. Good for chaining method calls
 */
export function drawStar(this: Graphics,
    x: number,
    y: number,
    points: number,
    radius: number,
    innerRadius: number,
    rotation = 0): Graphics
{
    return this.drawPolygon(new Star(x, y, points, radius, innerRadius, rotation) as Polygon);
}
