/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function ObservablePoint(transform, x, y)
{
    this._x = x || 0;
    this._y = y || 0;

    this.transform = transform;
}

ObservablePoint.prototype.constructor = ObservablePoint;
module.exports = ObservablePoint;



Object.defineProperties(ObservablePoint.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this._x;
        },
        set: function (value)
        {
            this._x = value;
            this.transform._versionLocal++;
        }
    },

    y: {
        get: function ()
        {
            return this._y;
        },
        set: function (value)
        {
            this._y = value;
            this.transform._versionLocal++;
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
    this._x = x || 0;
    this._y = y || ( (y !== 0) ? this._x : 0 );

    this.transform._versionLocal++;
};
