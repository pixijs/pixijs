/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @param {number} fromX - Starting point x
 * @param {number} fromY - Starting point y
 * @param {number} cpX - Control point x
 * @param {number} cpY - Control point y
 * @param {number} cpX2 - Second Control point x
 * @param {number} cpY2 - Second Control point y
 * @param {number} toX - Destination point x
 * @param {number} toY - Destination point y
 * @param {number[]} [path=[]] - Path array to push points into
 * @return {number[]} Array of points of the curve
 */
export default function bezierCurveTo(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY, path = [])
{
    const n = 20;
    let dt = 0;
    let dt2 = 0;
    let dt3 = 0;
    let t2 = 0;
    let t3 = 0;

    path.push(fromX, fromY);

    for (let i = 1, j = 0; i <= n; ++i)
    {
        j = i / n;

        dt = (1 - j);
        dt2 = dt * dt;
        dt3 = dt2 * dt;

        t2 = j * j;
        t3 = t2 * j;

        path.push(
            (dt3 * fromX) + (3 * dt2 * j * cpX) + (3 * dt * t2 * cpX2) + (t3 * toX),
            (dt3 * fromY) + (3 * dt2 * j * cpY) + (3 * dt * t2 * cpY2) + (t3 * toY)
        );
    }

    return path;
}
