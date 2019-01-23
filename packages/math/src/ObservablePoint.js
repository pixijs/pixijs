/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * An ObservablePoint is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 */
export default class ObservablePoint
{
    /**
     * @param {Function} cb - callback when changed
     * @param {object} scope - owner of callback
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    constructor(cb, scope, x = 0, y = 0)
    {
        this._x = x;
        this._y = y;

        this.cb = cb;
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
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    set(x, y)
    {
        const _x = x || 0;
        const _y = y || ((y !== 0) ? _x : 0);

        if (this._x !== _x || this._y !== _y)
        {
            this._x = _x;
            this._y = _y;
            this.cb.call(this.scope);
        }
    }

    /**
     * Copies x and y from the given point
     *
     * @param {PIXI.IPoint} p - The point to copy from.
     * @returns {PIXI.IPoint} Returns itself.
     */
    copyFrom(p)
    {
        if (this._x !== p.x || this._y !== p.y)
        {
            this._x = p.x;
            this._y = p.y;
            this.cb.call(this.scope);
        }

        return this;
    }

    /**
     * Copies x and y into the given point
     *
     * @param {PIXI.IPoint} p - The point to copy.
     * @returns {PIXI.IPoint} Given point with values updated
     */
    copyTo(p)
    {
        p.set(this._x, this._y);

        return p;
    }

    /**
     * Returns true if the given point is equal to this point
     *
     * @param {PIXI.IPoint} p - The point to check
     * @returns {boolean} Whether the given point equal to this point
     */
    equals(p)
    {
        return (p.x === this._x) && (p.y === this._y);
    }
    
    /**
     * Store zero x, y in ObservablePoint
     *
     * @param {number} [x=this._x] - store zero x from parent, value or PIXI.Point
     * @param {number} [y=this._y] - store zero y from parent, value or PIXI.Point
     * @returns {scope} Return ObservablePoint scope for chaining.
     */
    zeroSet(x, y, z)
    {   
        this.zero = this.zero || new PIXI.Point();
        if(!arguments.length){
            this.zero.copy(this);
        }else
        if(isNaN(x)){
            this.zero.copy.copy(x);
        }else{
            this.zero.set(...arguments);
        };
        return this;
    }

    /**
     * Compute difference between zero and current values
     *
     * @param {boolean} continuity - store current value in zero point
     * @returns {scope} Return ObservablePoint scope for chaining.
     */
    zeroApply(continuity)
    {       
        !this.zero && this.zeroSet();
        continuity = continuity? this.clone() : this.zero;
        this.copy(this.zero);
        this.zero.copy(continuity);
        return this;
    }

    /**
     * Compute difference between zero and current values
     *
     * @param {boolean} abs - use Math.abs on values
     * @returns {PIXI.Point} Return values in PIXI.Point.
     */
    zeroDiff(abs)
    {   
        !this.zero && this.zeroSet();
        let x = this.zero && this.zero.x || this._x;
        let y = this.zero && this.zero.y || this._y;
        x = abs? Math.abs(this._x-x):this._x-x;
        y = abs? Math.abs(this._y-y):this._y-y;
        return new PIXI.Point(x,y);
    }

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     */
    get x()
    {
        return this._x;
    }

    set x(value) // eslint-disable-line require-jsdoc
    {
        if (this._x !== value)
        {
            this._x = value;
            this.cb.call(this.scope);
        }
    }

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     */
    get y()
    {
        return this._y;
    }

    set y(value) // eslint-disable-line require-jsdoc
    {
        if (this._y !== value)
        {
            this._y = value;
            this.cb.call(this.scope);
        }
    }
}

/**
 * A number, or a string containing a number.
 * @memberof PIXI
 * @typedef {(PIXI.Point|PIXI.ObservablePoint)} IPoint
 */
