/**
 * @author Adrien Brault <adrien.brault@gmail.com>
 */

/**
 * @class Polygon
 * @constructor
 * @param points {Array}
 */
PIXI.Polygon = function(points)
{
	this.points = points;
}

/**
 * @method clone
 * @return a copy of the polygon
 */
PIXI.Polygon.clone = function()
{
	var points = [];
	for (var i=0; i<this.points.length; i++) {
		points.push(this.points[i].clone());
	}

	return new PIXI.Polygon(points);
}

PIXI.Polygon.constructor = PIXI.Polygon;

