import { SHAPES } from '../const';
import type { IPointData } from '../IPointData';

/**
 * A class to define a shape via user defined coordinates.
 *
 * @memberof PIXI
 */
export class Polygon
{
    /** An array of the points of this polygon. */
    public points: number[];

    /** `false` after moveTo, `true` after `closePath`. In all other cases it is `true`. */
    public closeStroke: boolean;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @default PIXI.SHAPES.POLY
     * @see PIXI.SHAPES
     */
    public readonly type: SHAPES.POLY;

    constructor(points: IPointData[]|number[]);
    constructor(...points: IPointData[]|number[]);

    /**
     * @param {PIXI.IPointData[]|number[]} points - This can be an array of Points
     *  that form the polygon, a flat array of numbers that will be interpreted as [x,y, x,y, ...], or
     *  the arguments passed can be all the points of the polygon e.g.
     *  `new PIXI.Polygon(new PIXI.Point(), new PIXI.Point(), ...)`, or the arguments passed can be flat
     *  x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are Numbers.
     */
    constructor(...points: any[])
    {
        let flat: IPointData[]|number[] = Array.isArray(points[0]) ? points[0] : points;

        // if this is an array of points, convert it to a flat array of numbers
        if (typeof flat[0] !== 'number')
        {
            const p: number[] = [];

            for (let i = 0, il = flat.length; i < il; i++)
            {
                p.push((flat[i] as IPointData).x, (flat[i] as IPointData).y);
            }

            flat = p;
        }

        this.points = flat as number[];
        this.type = SHAPES.POLY;
        this.closeStroke = true;
    }

    /**
     * Creates a clone of this polygon.
     *
     * @return - A copy of the polygon.
     */
    clone(): Polygon
    {
        const points = this.points.slice();
        const polygon = new Polygon(points);

        polygon.closeStroke = this.closeStroke;

        return polygon;
    }

    /**
     * Checks whether the x and y coordinates passed to this function are contained within this polygon.
     *
     * @param x - The X coordinate of the point to test.
     * @param y - The Y coordinate of the point to test.
     * @return - Whether the x/y coordinates are within this polygon.
     */
    contains(x: number, y: number): boolean
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

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:Polygon`
            + `closeStroke=${this.closeStroke}`
            + `points=${this.points.reduce((pointsDesc, currentPoint) => `${pointsDesc}, ${currentPoint}`, '')}]`;
    }
    // #endif
}
