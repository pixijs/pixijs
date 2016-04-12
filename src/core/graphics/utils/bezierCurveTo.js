
/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * @param fromX {number} Starting point x
 * @param fromY {number} Starting point y
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param cpX2 {number} Second Control point x
 * @param cpY2 {number} Second Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @param [path=number[]] Path array to push points into
 * @return {PIXI.Graphics}
 */
var bezierCurveTo = function (fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY, path) // jshint ignore:line
{
    path = path || [];

    var n = 20,
        dt,
        dt2,
        dt3,
        t2,
        t3;

    path.push(fromX, fromY);

    var j = 0;

    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        dt = (1 - j);
        dt2 = dt * dt;
        dt3 = dt2 * dt;

        t2 = j * j;
        t3 = t2 * j;

        path.push( dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
                   dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }

    return path;
};

module.exports = bezierCurveTo;
