/**
 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 * @param cb {Function} callback when changed
 * @param scope {Object} owner of callback
 * @param [x=0] {number} The X coordinate of the upper-left corner of the rectangle
 * @param [y=0] {number} The Y coordinate of the upper-left corner of the rectangle
 * @param [width=1] {number} The overall width of this rectangle
 * @param [height=1] {number} The overall height of this rectangle
 */
function ObservableRect(cb, scope, x, y, width, height) {
    this._x = x || 0;
    this._y = y || 0;
    this._width = width || 1;
    this._height = height || 1;

    this.cb = cb;
    this.scope = scope;
}

ObservableRect.prototype.constructor = ObservableRect;
module.exports = ObservableRect;


Object.defineProperties(ObservableRect.prototype, {
    /**
     * The X coordinate of the upper-left corner of the rectangle
     *
     * @member {number}
     * @memberof PIXI.ObservableRect#
     */
    x: {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.cb.call(this.scope);
            }
        }
    },
    /**
     * The Y coordinate of the upper-left corner of the rectangle
     *
     * @member {number}
     * @memberof PIXI.ObservableRect#
     */
    y: {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.cb.call(this.scope);
            }
        }
    },
    /**
     * The overall width of this rectangle
     *
     * @member {number}
     * @memberof PIXI.ObservableRect#
     */
    width: {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.cb.call(this.scope);
            }
        }
    },
    /**
     * The overall height of this rectangle
     *
     * @member {number}
     * @memberof PIXI.ObservableRect#
     */
    height: {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
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
ObservableRect.prototype.set = function (x, y, width, height) {
    if (this._x !== x || this._y !== y || this._width !== width || this._height !== height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this.cb.call(this.scope);
    }
};

/**
 * Copies the data from another point
 *
 * @param point {PIXI.Point|{PIXI.ObservablePoint} point to copy from
 */
ObservableRect.prototype.copy = function (rect) {
    if (this._x !== rect.x || this._y !== rect.y || this._width !== rect.width || this._height !== rect.height) {
        this._x = rect.x;
        this._y = rect.y;
        this._width = rect.width;
        this._height = rect.height;
        this.cb.call(this.scope);
    }
};
