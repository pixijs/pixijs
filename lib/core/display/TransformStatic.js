'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _math = require('../math');

var _TransformBase2 = require('./TransformBase');

var _TransformBase3 = _interopRequireDefault(_TransformBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Transform that takes care about its versions
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
var TransformStatic = function (_TransformBase) {
    _inherits(TransformStatic, _TransformBase);

    /**
     *
     */
    function TransformStatic() {
        _classCallCheck(this, TransformStatic);

        /**
        * The coordinate of the object relative to the local coordinates of the parent.
        *
        * @member {PIXI.ObservablePoint}
        */
        var _this = _possibleConstructorReturn(this, _TransformBase.call(this));

        _this.position = new _math.ObservablePoint(_this.onChange, _this, 0, 0);

        /**
         * The scale factor of the object.
         *
         * @member {PIXI.ObservablePoint}
         */
        _this.scale = new _math.ObservablePoint(_this.onChange, _this, 1, 1);

        /**
         * The pivot point of the displayObject that it rotates around
         *
         * @member {PIXI.ObservablePoint}
         */
        _this.pivot = new _math.ObservablePoint(_this.onChange, _this, 0, 0);

        /**
         * The skew amount, on the x and y axis.
         *
         * @member {PIXI.ObservablePoint}
         */
        _this.skew = new _math.ObservablePoint(_this.updateSkew, _this, 0, 0);

        _this._rotation = 0;

        _this._cx = 1; // cos rotation + skewY;
        _this._sx = 0; // sin rotation + skewY;
        _this._cy = 0; // cos rotation + Math.PI/2 - skewX;
        _this._sy = 1; // sin rotation + Math.PI/2 - skewX;

        _this._localID = 0;
        _this._currentLocalID = 0;
        return _this;
    }

    /**
     * Called when a value changes.
     *
     * @private
     */


    TransformStatic.prototype.onChange = function onChange() {
        this._localID++;
    };

    /**
     * Called when skew or rotation changes
     *
     * @private
     */


    TransformStatic.prototype.updateSkew = function updateSkew() {
        this._cx = Math.cos(this._rotation + this.skew._y);
        this._sx = Math.sin(this._rotation + this.skew._y);
        this._cy = -Math.sin(this._rotation - this.skew._x); // cos, added PI/2
        this._sy = Math.cos(this._rotation - this.skew._x); // sin, added PI/2

        this._localID++;
    };

    /**
     * Updates only local matrix
     */


    TransformStatic.prototype.updateLocalTransform = function updateLocalTransform() {
        var lt = this.localTransform;

        if (this._localID !== this._currentLocalID) {
            // get the matrix values of the displayobject based on its transform properties..
            lt.a = this._cx * this.scale._x;
            lt.b = this._sx * this.scale._x;
            lt.c = this._cy * this.scale._y;
            lt.d = this._sy * this.scale._y;

            lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
            lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
            this._currentLocalID = this._localID;

            // force an update..
            this._parentID = -1;
        }
    };

    /**
     * Updates the values of the object and applies the parent's transform.
     *
     * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
     */


    TransformStatic.prototype.updateTransform = function updateTransform(parentTransform) {
        var lt = this.localTransform;

        if (this._localID !== this._currentLocalID) {
            // get the matrix values of the displayobject based on its transform properties..
            lt.a = this._cx * this.scale._x;
            lt.b = this._sx * this.scale._x;
            lt.c = this._cy * this.scale._y;
            lt.d = this._sy * this.scale._y;

            lt.tx = this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
            lt.ty = this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
            this._currentLocalID = this._localID;

            // force an update..
            this._parentID = -1;
        }

        if (this._parentID !== parentTransform._worldID) {
            // concat the parent matrix with the objects transform.
            var pt = parentTransform.worldTransform;
            var wt = this.worldTransform;

            wt.a = lt.a * pt.a + lt.b * pt.c;
            wt.b = lt.a * pt.b + lt.b * pt.d;
            wt.c = lt.c * pt.a + lt.d * pt.c;
            wt.d = lt.c * pt.b + lt.d * pt.d;
            wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
            wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

            this._parentID = parentTransform._worldID;

            // update the id of the transform..
            this._worldID++;
        }
    };

    /**
     * Decomposes a matrix and sets the transforms properties based on it.
     *
     * @param {PIXI.Matrix} matrix - The matrix to decompose
     */


    TransformStatic.prototype.setFromMatrix = function setFromMatrix(matrix) {
        matrix.decompose(this);
        this._localID++;
    };

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */


    _createClass(TransformStatic, [{
        key: 'rotation',
        get: function get() {
            return this._rotation;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._rotation = value;
            this.updateSkew();
        }
    }]);

    return TransformStatic;
}(_TransformBase3.default);

exports.default = TransformStatic;
//# sourceMappingURL=TransformStatic.js.map