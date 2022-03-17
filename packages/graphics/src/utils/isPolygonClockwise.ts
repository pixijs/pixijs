import { Polygon } from '@pixi/math';

/**
 * Determine if polygon is clockwise or counterclockwise.
 * @see {@link https://stackoverflow.com/questions/1165647}
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param {Polygon} polygon
 * @return {boolean}
 */
export function isPolygonClockwise(polygon: Polygon): boolean
{
    const points = polygon.points;

    let sum = 0;

    for (let i = 0; i < points.length - 2; i += 2)
    {
        sum += (points[i + 2] - points[i]) * (points[i + 3] + points[i + 1]);
    }

    return sum > 0;
}
