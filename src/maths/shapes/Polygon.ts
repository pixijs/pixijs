import { squaredDistanceToLineSegment } from '../misc/squaredDistanceToLineSegment';
import { Rectangle } from './Rectangle';

import type { SHAPE_PRIMITIVE } from '../misc/const';
import type { PointData } from '../point/PointData';
import type { ShapePrimitive } from './ShapePrimitive';

/**
 * A class to define a shape via user defined coordinates.
 *
 *
 * `Polygon` can accept the following different constructor arguments:
 * - An array of `Point` objects
 * - An array of coordinate pairs
 *
 *
 * These can be passed as a single array, or as a sequence of arguments.
 * ```js
 * import { Polygon } from 'pixi.js';
 *
 * // create a polygon object from an array of points, or an array of coordinate pairs
 * const polygon1 = new Polygon([ new Point(0, 0), new Point(0, 100), new Point(100, 100) ]);
 * const polygon2 = new Polygon([ 0, 0, 0, 100, 100, 100 ]);
 *
 * // or create a polygon object from a sequence of points, or coordinate pairs
 * const polygon3 = new Polygon(new Point(0, 0), new Point(0, 100), new Point(100, 100));
 * const polygon4 = new Polygon(0, 0, 0, 100, 100, 100);
 * ```
 * @memberof maths
 */
export class Polygon implements ShapePrimitive
{
    /** An array of the points of this polygon. */
    public points: number[];

    /** `false` after moveTo, `true` after `closePath`. In all other cases it is `true`. */
    public closePath: boolean;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @default 'polygon'
     */
    public readonly type: SHAPE_PRIMITIVE = 'polygon';

    constructor(points: PointData[] | number[]);
    constructor(...points: PointData[] | number[]);
    /**
     * @param points - This can be an array of Points
     *  that form the polygon, a flat array of numbers that will be interpreted as [x,y, x,y, ...], or
     *  the arguments passed can be all the points of the polygon e.g.
     *  `new Polygon(new Point(), new Point(), ...)`, or the arguments passed can be flat
     *  x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are Numbers.
     */
    constructor(...points: (PointData[] | number[])[] | PointData[] | number[])
    {
        let flat = Array.isArray(points[0]) ? points[0] : points;

        // if this is an array of points, convert it to a flat array of numbers
        if (typeof flat[0] !== 'number')
        {
            const p: number[] = [];

            for (let i = 0, il = flat.length; i < il; i++)
            {
                p.push((flat[i] as PointData).x, (flat[i] as PointData).y);
            }

            flat = p;
        }

        this.points = flat as number[];

        this.closePath = true;
    }

    /**
     * Creates a clone of this polygon.
     * @returns - A copy of the polygon.
     */
    public clone(): Polygon
    {
        const points = this.points.slice();
        const polygon = new Polygon(points);

        polygon.closePath = this.closePath;

        return polygon;
    }

    /**
     * Checks whether the x and y coordinates passed to this function are contained within this polygon.
     * @param x - The X coordinate of the point to test.
     * @param y - The Y coordinate of the point to test.
     * @returns - Whether the x/y coordinates are within this polygon.
     */
    public contains(x: number, y: number): boolean
    {
        let inside = false;

        // use some raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        const length = this.points.length / 2;

        for (let i = 0, j = length - 1; i < length; j = i++)
        {
            const xi = this.points[i * 2];
            const yi = this.points[(i * 2) + 1];
            const xj = this.points[j * 2];
            const yj = this.points[(j * 2) + 1];
            const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);

            if (intersect)
            {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this polygon including the stroke.
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @param strokeWidth - The width of the line to check
     * @returns Whether the x/y coordinates are within this polygon
     */
    public strokeContains(x: number, y: number, strokeWidth: number): boolean
    {
        const halfStrokeWidth = strokeWidth / 2;
        const halfStrokeWidthSqrd = halfStrokeWidth * halfStrokeWidth;
        const { points } = this;
        const iterationLength = points.length - (this.closePath ? 0 : 2);

        for (let i = 0; i < iterationLength; i += 2)
        {
            const x1 = points[i];
            const y1 = points[i + 1];
            const x2 = points[(i + 2) % points.length];
            const y2 = points[(i + 3) % points.length];

            const distanceSqrd = squaredDistanceToLineSegment(x, y, x1, y1, x2, y2);

            if (distanceSqrd <= halfStrokeWidthSqrd)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns the framing rectangle of the polygon as a Rectangle object
     * @param out - optional rectangle to store the result
     * @returns The framing rectangle
     */
    public getBounds(out?: Rectangle): Rectangle
    {
        out = out || new Rectangle();

        const points = this.points;

        let minX = Infinity;
        let maxX = -Infinity;

        let minY = Infinity;
        let maxY = -Infinity;

        for (let i = 0, n = points.length; i < n; i += 2)
        {
            const x = points[i];
            const y = points[i + 1];

            minX = x < minX ? x : minX;
            maxX = x > maxX ? x : maxX;

            minY = y < minY ? y : minY;
            maxY = y > maxY ? y : maxY;
        }

        out.x = minX;
        out.width = maxX - minX;

        out.y = minY;
        out.height = maxY - minY;

        return out;
    }

    /**
     * Copies another polygon to this one.
     * @param polygon - The polygon to copy from.
     * @returns Returns itself.
     */
    public copyFrom(polygon: Polygon): this
    {
        this.points = polygon.points.slice();
        this.closePath = polygon.closePath;

        return this;
    }

    /**
     * Copies this polygon to another one.
     * @param polygon - The polygon to copy to.
     * @returns Returns given parameter.
     */
    public copyTo(polygon: Polygon): Polygon
    {
        polygon.copyFrom(this);

        return polygon;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Polygon`
            + `closeStroke=${this.closePath}`
            + `points=${this.points.reduce((pointsDesc, currentPoint) => `${pointsDesc}, ${currentPoint}`, '')}]`;
    }
    // #endif

    /**
     * Get the last X coordinate of the polygon
     * @readonly
     */
    get lastX(): number
    {
        return this.points[this.points.length - 2];
    }

    /**
     * Get the last Y coordinate of the polygon
     * @readonly
     */
    get lastY(): number
    {
        return this.points[this.points.length - 1];
    }

    /**
     * Get the first X coordinate of the polygon
     * @readonly
     */
    get x(): number
    {
        return this.points[this.points.length - 2];
    }
    /**
     * Get the first Y coordinate of the polygon
     * @readonly
     */
    get y(): number
    {
        return this.points[this.points.length - 1];
    }
}

