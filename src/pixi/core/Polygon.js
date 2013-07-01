/**
 * @author Adrien Brault <adrien.brault@gmail.com>
 */

/**
 * @class Polygon
 * @constructor
 * @param points {Array<Point>|Array<Number>} This cna be an array of Points or a flat array of numbers
 *      that will be interpreted as [x,y, x,y, ...]
 */
PIXI.Polygon = function(points)
{
    //if this is a flat array of numbers, convert it to points
    if(typeof points[0] === 'number') {
        var p = [];
        for(var i = 0, il = points.length; i < il; i+=2) {
            p.push(
                new PIXI.Point(points[i], points[i + 1])
            );
        }

        points = p;
    }

	this.points = points;
}

/**
 * @method clone
 * @return a copy of the polygon
 */
PIXI.Polygon.prototype.clone = function()
{
	var points = [];
	for (var i=0; i<this.points.length; i++) {
		points.push(this.points[i].clone());
	}

	return new PIXI.Polygon(points);
}

/**
 * @method contains
 * @param x {Number} The X coord of the point to test
 * @param y {Number} The Y coord of the point to test
 * @return if the x/y coords are within this polygon
 */
PIXI.Polygon.prototype.contains = function(x, y)
{
    var inside = false;

    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    for(var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
        var xi = this.points[i].x, yi = this.points[i].y,
            xj = this.points[j].x, yj = this.points[j].y,
            intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if(intersect) inside = !inside;
    }

    return inside;
}

PIXI.Polygon.constructor = PIXI.Polygon;

