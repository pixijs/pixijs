/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 */
export default class Point
{
    /**
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(x = 0, y = 0)
    {
        /**
         * @protected
         * @member {number}
         * @default 0
         */
        this._x = x;

        /**
         * @protected
         * @member {number}
         * @default 0
         */
        this._y = y;
    }

    /**
     * Creates a clone of this point
     *
     * @return {PIXI.Point} a copy of the point
     */
    clone()
    {
        return new Point(this._x, this._y);
    }

    /**
     * Copies x and y from the given point
     *
     * @param {PIXI.Point} p - The point to copy.
     */
    copy(p)
    {
        if (!this.equals(p))
        {
            this.set(p.x, p.y);
        }
    }

    /**
     * Returns true if the given point is equal to this point
     *
     * @param {PIXI.Point} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     */
    equals(p)
    {
        return (p.x === this._x) && (p.y === this._y);
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    set(x, y)
    {
        this._x = x || 0;
        this._y = y || ((y !== 0) ? this._x : 0);
    }

    /**
     * The position of the point on the x axis
     *
     * @member {number}
     */
    get x()
    {
        return this._x;
    }

    set x(value) // eslint-disable-line require-jsdoc
    {
        this._x = value;
    }

    /**
     * The position of the point on the y axis
     *
     * @member {number}
     */
    get y()
    {
        return this._y;
    }

    set y(value) // eslint-disable-line require-jsdoc
    {
        this._y = value;
    }

}
