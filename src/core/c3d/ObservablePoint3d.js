var ObservablePoint = require('../display/ObservablePoint'),
    Point3d = require('./Point3d');

/**
 * The Point object represents a location in a three-dimensional coordinate system
 *
 * @class
 * @memberof PIXI
 * @param transform {PIXI.Transform} the transform object @mat
 * @param cb {Function} callback when changed
 * @param scope {Object} owner of callback
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 * @param [z=0] {number} position of the point on the z axis
 */
function ObservablePoint3d(cb, scope, x, y, z)
{
    ObservablePoint.call(this, cb, scope, x, y);
    this._z = z || 0;
}

ObservablePoint3d.prototype = Object.create(ObservablePoint.prototype);
ObservablePoint3d.prototype.constructor = ObservablePoint3d;
module.exports = ObservablePoint3d;


Object.defineProperties(ObservablePoint3d.prototype, {
    /**
     * The position of the displayObject on the z axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.ObservablePoint3d#
     */
    z: {
        get: function ()
        {
            return this._z;
        },
        set: function (value)
        {
            if (this._z !== value) {
                this._z = value;
                this.cb.call(this.scope);
            }
        }
    }
});

/**
 * Sets the point to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
ObservablePoint.prototype.set = function (x, y, z)
{
    var _x = x || 0;
    var _y = y || ( (y !== 0) ? _x : 0 );
    var _z = z || 0;
    if (this._x !== _x || this._y !== _y || this._z !== z) {
        this._x = _x;
        this._y = _y;
        this._z = _z;
        this.cb.call(this.scope);
    }
};

/**
 * Creates a clone of this point3d
 *
 * @return {Point3d} a copy of the point3d
 */
ObservablePoint.prototype.clone = function ()
{
    return new Point3d(this.x, this.y, this.z);
};

/**
 * Copies the data from another point
 *
 * @param point {PIXI.Point|PIXI.Point3d|PIXI.ObservablePoint|PIXI.ObservablePoint3d} point to copy from
*/

ObservablePoint.prototype.copy = function (p)
{
    var _x = p.x;
    var _y = p.y;
    var _z = p.z || 0;
    if (this._x !== _x || this._y !== _y || this._z !== _z) {
        this._x = _x;
        this._y = _y;
        this._z = _z;
        this.cb.call(this.scope);
    }
};
