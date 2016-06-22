/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 * An observable point is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 * @param cb {Function} callback when changed
 * @param scope {Object} owner of callback
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function ObservablePoint(cb, scope, x, y)
{
    this._x = x || 0;
    this._y = y || 0;

    this.cb = cb;
    this.scope = scope;
}

ObservablePoint.prototype.constructor = ObservablePoint;
module.exports = ObservablePoint;



Object.defineProperties(ObservablePoint.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.ObservablePoint#
     */
    x: {
        get: function ()
        {
            return this._x;
        },
        set: function (value)
        {
            if (this._x !== value) {
                this._x = value;
                this.cb.call(this.scope);
            }
        }
    },
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.ObservablePoint#
     */
    y: {
        get: function ()
        {
            return this._y;
        },
        set: function (value)
        {
            if (this._y !== value) {
                this._y = value;
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
ObservablePoint.prototype.set = function (x, y)
{
    var _x = x || 0;
    var _y = y || ( (y !== 0) ? _x : 0 );
    if (this._x !== _x || this._y !== _y)
    {
        this._x = _x;
        this._y = _y;
        this.cb.call(this.scope);
    }
};

/**
 * Copies the data from another point
 *
 * @param point {PIXI.Point|PIXI.ObservablePoint} point to copy from
 */
ObservablePoint.prototype.copy = function (point)
{
    if (this._x !== point.x || this._y !== point.y)
    {
        this._x = point.x;
        this._y = point.y;
        this.cb.call(this.scope);
    }
};
