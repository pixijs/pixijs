/**
 * The Point3d object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @namespace PIXI
 * @param [x=0] {number} position of the point3d on the x axis
 * @param [y=0] {number} position of the point3d on the y axis
 */
function Point3d(x, y, z)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.z = z || 0;
}

Point3d.prototype.constructor = Point3d;
module.exports = Point3d;

/**
 * Creates a clone of this point3d
 *
 * @return {Point3d} a copy of the point3d
 */
Point3d.prototype.clone = function ()
{
    return new Point3d(this.x, this.y, this.z);
};

/**
 * Sets the point3d to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @param [x=0] {number} position of the point3d on the x axis
 * @param [y=0] {number} position of the point3d on the y axis
 */
Point3d.prototype.set = function (x, y)
{
    this.x = x || 0;
    this.y = y || ( (y !== 0) ? this.x : 0 ) ;
};
