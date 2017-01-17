"use strict";

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 * An observable point is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 */
var ObservablePoint = function () {
    /**
     * @param {Function} cb - callback when changed
     * @param {object} scope - owner of callback
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */
    function ObservablePoint(cb, scope) {
        var x = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var y = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        _classCallCheck(this, ObservablePoint);

        this._x = x;
        this._y = y;

        this.cb = cb;
        this.scope = scope;
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     */


    ObservablePoint.prototype.set = function set(x, y) {
        var _x = x || 0;
        var _y = y || (y !== 0 ? _x : 0);

        if (this._x !== _x || this._y !== _y) {
            this._x = _x;
            this._y = _y;
            this.cb.call(this.scope);
        }
    };

    /**
     * Copies the data from another point
     *
     * @param {PIXI.Point|PIXI.ObservablePoint} point - point to copy from
     */


    ObservablePoint.prototype.copy = function copy(point) {
        if (this._x !== point.x || this._y !== point.y) {
            this._x = point.x;
            this._y = point.y;
            this.cb.call(this.scope);
        }
    };

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     */


    _createClass(ObservablePoint, [{
        key: "x",
        get: function get() {
            return this._x;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (this._x !== value) {
                this._x = value;
                this.cb.call(this.scope);
            }
        }

        /**
         * The position of the displayObject on the x axis relative to the local coordinates of the parent.
         *
         * @member {number}
         */

    }, {
        key: "y",
        get: function get() {
            return this._y;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (this._y !== value) {
                this._y = value;
                this.cb.call(this.scope);
            }
        }
    }]);

    return ObservablePoint;
}();

exports.default = ObservablePoint;
//# sourceMappingURL=ObservablePoint.js.map