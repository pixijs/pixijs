import Point from './Point';

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 * An observable point is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Point
 */
export default class ObservablePoint extends Point
{
    /**
     * @param {Function} cb - callback when changed
     * @param {object} scope - owner of callback
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(cb, scope, x = 0, y = 0)
    {
        super(x, y);

        /**
         * @protected
         * @member {Function}
         */
        this.cb = cb;

        /**
         * @protected
         * @member {object}
         */
        this.scope = scope;
    }

    /**
     * Creates a clone of this point.
     * The callback and scope params can be overidden otherwise they will default
     * to the clone object's values.
     *
     * @override
     * @param {Function} [cb=null] - callback when changed
     * @param {object} [scope=null] - owner of callback
     * @return {PIXI.ObservablePoint} a copy of the point
     */
    clone(cb = null, scope = null)
    {
        const _cb = cb || this.cb;
        const _scope = scope || this.scope;
        
        return new ObservablePoint(_cb, _scope, this._x, this._y);
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @override
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    set(x, y)
    {
        const _x = x || 0;
        const _y = y || ((y !== 0) ? _x : 0);

        if (this._x !== _x || this._y !== _y)
        {
            super.set(_x, _y);
            this.cb.call(this.scope);
        }
    }

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @override
     * @member {number}
     */
    get x()
    {
        return super.x;
    }

    set x(value) // eslint-disable-line require-jsdoc
    {
        if (this._x !== value)
        {
            super.x = value;
            this.cb.call(this.scope);
        }
    }

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @override
     * @member {number}
     */
    get y()
    {
        return super.y;
    }

    set y(value) // eslint-disable-line require-jsdoc
    {
        if (this._y !== value)
        {
            super.y = value;
            this.cb.call(this.scope);
        }
    }
}
