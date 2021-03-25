/**
 * Utilities for polygon
 * @class
 * @private
 */
export class PolygonUtils
{
    /**
    * Calculate points of an offset polygon
    * @see {@link http://csharphelper.com/blog/2016/01/enlarge-a-polygon-in-c/}
    *
    * @private
    * @param {number[]} points - polygon coordinates
    * @param {number} offset
    * @return {number[]} - offset points
    */
    static offsetPolygon(points: number[], offset: number): number[]
    {
        const offsetPoints: number[] = [];
        const length: number = points.length;

        offset = PolygonUtils.isPolygonClockwise(points) ? offset : -1 * offset;

        for (let j = 0; j < length; j += 2)
        {
            // Find location for the points before and after j
            let i = (j - 2);

            if (i < 0)
            {
                i += length;
            }

            const k = (j + 2) % length;

            // Move the points by the offset
            let v1x = points[j] - points[i];
            let v1y = points[j + 1] - points[i + 1];
            let len = Math.sqrt((v1x * v1x) + (v1y * v1y));

            v1x /= len;
            v1y /= len;
            v1x *= offset;
            v1y *= offset;

            const norm1x = -v1y;
            const norm1y = v1x;

            const pij1 = [points[i] + norm1x, points[i + 1] + norm1y];
            const pij2 = [points[j] + norm1x, points[j + 1] + norm1y];

            let v2x = points[k] - points[j];
            let v2y = points[k + 1] - points[j + 1];

            len = Math.sqrt((v2x * v2x) + (v2y * v2y));

            v2x /= len;
            v2y /= len;
            v2x *= offset;
            v2y *= offset;

            const norm2x = -v2y;
            const norm2y = v2x;

            const pjk1 = [points[j] + norm2x, points[j + 1] + norm2y];
            const pjk2 = [points[k] + norm2x, points[k + 1] + norm2y];

            // Find where the shifted lines ij and jk intersect.
            const intersectPoint = PolygonUtils
                .findIntersection(pij1[0], pij1[1], pij2[0], pij2[1], pjk1[0], pjk1[1], pjk2[0], pjk2[1]);

            if (intersectPoint)
            {
                offsetPoints.push(...intersectPoint);
            }
        }

        return offsetPoints;
    }

    /**
    * Determine the intersection point of two line segments
    * @see {@link here http://paulbourke.net/geometry/pointlineplane/}
    *
    * @private
    * @param {number} x1 - x-coordinate of start point at first line
    * @param {number} y1 - y-coordinate of start point at first line
    * @param {number} x2 - x-coordinate of end point at first line
    * @param {number} y2 - y-coordinate of end point at first line
    * @param {number} x3 - x-coordinate of start point at second line
    * @param {number} y3 - y-coordinate of start point at second line
    * @param {number} x4 - x-coordinate of end point at second line
    * @param {number} y4 - y-coordinate of end point at second line
    * @returns {[number, number] | null} - [x, y] coordinates of intersection
    */
    static findIntersection(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): [number, number] | null
    {
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        const numeratorA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
        const numeratorB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

        // lines are parallel
        if (denominator === 0)
        {
            // lines are coincident
            if (numeratorA === 0 && numeratorB === 0)
            {
                return [(x1 + x2) / 2, (y1 + y2) / 2];
            }

            return null;
        }

        const uA = numeratorA / denominator;

        return [x1 + (uA * (x2 - x1)), y1 + (uA * (y2 - y1))];
    }

    /**
     * Determine polygon are clockwise or counterclockwise
     * @see {@link https://stackoverflow.com/questions/1165647}
     *
     * @private
     * @param {number[]} polygon - polygon coordinates
     * @return {boolean}
     */
    static isPolygonClockwise(polygon: number[]): boolean
    {
        let sum = 0;

        for (let i = 0; i < polygon.length - 2; i += 2)
        {
            sum += (polygon[i + 2] - polygon[i]) * (polygon[i + 3] + polygon[i + 1]);
        }

        return sum > 0;
    }
}
