import { Polygon, PI_2 } from '@pixi/math';

/**
 * Draw a star shape with an arbitrary number of points.
 *
 * @class
 * @extends PIXI.Polygon
 * @memberof PIXI
 * @param {number} x - Center X position of the star
 * @param {number} y - Center Y position of the star
 * @param {number} points - The number of points of the star, must be > 1
 * @param {number} radius - The outer radius of the star
 * @param {number} [innerRadius] - The inner radius between points, default half `radius`
 * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
export class Star extends Polygon
{
    constructor(x: number, y: number, points: number, radius: number, innerRadius: number, rotation = 0)
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
