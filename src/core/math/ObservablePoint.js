/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 * An observable point is a point that triggers a callback when the point's position is changed.
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
        this.set = this.set.bind(this);
        this.runCallbacks = this.runCallbacks.bind(this);
        this._listeners = [];
        this._broadcasters = [];
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
            this.runCallbacks();
        }
    }

    /**
     * Copies the data from another point
     *
     * @param {PIXI.Point|PIXI.ObservablePoint} point - point to copy from
     */
    copy(point)
    {
        if (this._x !== point.x || this._y !== point.y)
        {
            this._x = point.x;
            this._y = point.y;
            this.runCallbacks();
        }
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
            this.runCallbacks();
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
            this.runCallbacks();
        }
    }

    /**
     * Runs callback passed to the constructor, as well as publicly subscribed callbacks
     */
    runCallbacks()
    {
        this.cb.call(this.scope);
        for (let i = 0, j = this._listeners.length; i < j; i++)
        {
            this._listeners[i](this._x, this._y);
        }
    }

    /**
     * Every time x | y is changed, subscribed callback will be executed.
     * @param {Function} callback - executed with x and y arguments
     * @returns {Number} of currently linked listeners (if unique) or {null} if already added.
     */
    addChangeListener(callback)
    {
        if (this._listeners.indexOf(callback) < 0)
        {
            return this._listeners.push(callback);
        }

        return null;
    }

    /**
     * Stops instance from executing publicly subscribed, specific callback.
     * @param {Function} callback - previously linked listener
     * @returns {Number} of currently linked listeners (if succesfully removed)
     * or {null} if callback wasn't on the list.
     */
    removeChangeListener(callback)
    {
        const i = this._listeners.indexOf(callback);

        if (i > -1)
        {
            this._listeners.splice(i, 1);

            return this._listeners.length;
        }

        return null;
    }

    /**
     * Removes all publicly subscribed listeners. Main callback (passed to constructor) stays.
     * @returns {ObservablePoint} self
     */
    purgeListeners()
    {
        this._listeners = [];

        return this;
    }

    /**
     * Makes connection opposite to addEventListener. Forces this instance to listen to changes broadcast by
     * another instance of {ObservablePoint} (passed here as an argument).
     *
     * Every change in foreign instance makes this instance to update itself to the foreign instance values (x, y).
     * E.g:  this.position < -- is - updated - by - (observablePoint) - every time - observablePoint - is - updated -
     *
     *
     * @param {ObservablePoint} observablePoint - foreign instance
     */
    linkTo(observablePoint)
    {
        if (!(observablePoint instanceof ObservablePoint))
        {
            throw new Error('Linking to NOT an ObservablePoint instance');
        }
        else if (observablePoint.addChangeListener(this.set) > 0)
        {
            if (this._broadcasters.indexOf(observablePoint) < 0)
            {
                this._broadcasters.push(observablePoint);
            }
        }
        this.copy(observablePoint);
    }

    /**
     * Stops foreign instance of {ObservablePoint} updating this {ObservablePoint}.
     * If bilateral connection was made, this instance will keep updating foreign instance.
     * @param {ObservablePoint} observablePoint - foreign instance that
     * has been passed to this instance through {Function} linkTo.
     * @returns {ObservablePoint} foreign instance if successful, or {null} if it wasn't on the list.
     */
    unlink(observablePoint)
    {
        observablePoint.removeChangeListener(this.set);
        const i = this._broadcasters.indexOf(observablePoint);

        if (i > -1)
        {
            return this._broadcasters.splice(i, 1).pop();
        }

        return null;
    }

    /**
     * Stops all foreign instances of {ObservablePoint} updating this object.
     * Does not cancel bilateral connections.
     * @returns {ObservablePoint} self
     */
    unlinkAll()
    {
        while (this._broadcasters.length)
        {
            this.unlink(this._broadcasters.pop());
        }

        return this;
    }

    /**
     * Removes all publicly subscribed listeners AND unlinks all foreign instances.
     * Cancels bilateral links unless foreign instance/s was/were unlinked before.
     * @returns {ObservablePoint} self
     */
    detach()
    {
        for (let i = 0, j = this._broadcasters.length; i < j; i++)
        {
            this._broadcasters[i].unlink(this);
        }
        this.purgeListeners();
        this.unlinkAll();

        return this;
    }
}
