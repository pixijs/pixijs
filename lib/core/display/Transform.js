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
 * Generic class to deal with traditional 2D matrix transforms
 * local transformation is calculated from position,scale,skew and rotation
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
var Transform = function (_TransformBase) {
  _inherits(Transform, _TransformBase);

  /**
   *
   */
  function Transform() {
    _classCallCheck(this, Transform);

    /**
    * The coordinate of the object relative to the local coordinates of the parent.
    *
    * @member {PIXI.Point}
    */
    var _this = _possibleConstructorReturn(this, _TransformBase.call(this));

    _this.position = new _math.Point(0, 0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    _this.scale = new _math.Point(1, 1);

    /**
     * The skew amount, on the x and y axis.
     *
     * @member {PIXI.ObservablePoint}
     */
    _this.skew = new _math.ObservablePoint(_this.updateSkew, _this, 0, 0);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    _this.pivot = new _math.Point(0, 0);

    /**
     * The rotation value of the object, in radians
     *
     * @member {Number}
     * @private
     */
    _this._rotation = 0;

    _this._sr = Math.sin(0);
    _this._cr = Math.cos(0);
    _this._cy = Math.cos(0); // skewY);
    _this._sy = Math.sin(0); // skewY);
    _this._nsx = Math.sin(0); // skewX);
    _this._cx = Math.cos(0); // skewX);
    return _this;
  }

  /**
   * Updates the skew values when the skew changes.
   *
   * @private
   */


  Transform.prototype.updateSkew = function updateSkew() {
    this._cy = Math.cos(this.skew.y);
    this._sy = Math.sin(this.skew.y);
    this._nsx = Math.sin(this.skew.x);
    this._cx = Math.cos(this.skew.x);
  };

  /**
   * Updates only local matrix
   */


  Transform.prototype.updateLocalTransform = function updateLocalTransform() {
    var lt = this.localTransform;
    var a = this._cr * this.scale.x;
    var b = this._sr * this.scale.x;
    var c = -this._sr * this.scale.y;
    var d = this._cr * this.scale.y;

    lt.a = this._cy * a + this._sy * c;
    lt.b = this._cy * b + this._sy * d;
    lt.c = this._nsx * a + this._cx * c;
    lt.d = this._nsx * b + this._cx * d;
  };

  /**
   * Updates the values of the object and applies the parent's transform.
   *
   * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
   */


  Transform.prototype.updateTransform = function updateTransform(parentTransform) {
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    var a = this._cr * this.scale.x;
    var b = this._sr * this.scale.x;
    var c = -this._sr * this.scale.y;
    var d = this._cr * this.scale.y;

    lt.a = this._cy * a + this._sy * c;
    lt.b = this._cy * b + this._sy * d;
    lt.c = this._nsx * a + this._cx * c;
    lt.d = this._nsx * b + this._cx * d;

    lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
    lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);

    // concat the parent matrix with the objects transform.
    wt.a = lt.a * pt.a + lt.b * pt.c;
    wt.b = lt.a * pt.b + lt.b * pt.d;
    wt.c = lt.c * pt.a + lt.d * pt.c;
    wt.d = lt.c * pt.b + lt.d * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._worldID++;
  };

  /**
   * Decomposes a matrix and sets the transforms properties based on it.
   *
   * @param {PIXI.Matrix} matrix - The matrix to decompose
   */


  Transform.prototype.setFromMatrix = function setFromMatrix(matrix) {
    matrix.decompose(this);
  };

  /**
   * The rotation of the object in radians.
   *
   * @member {number}
   * @memberof PIXI.Transform#
   */


  _createClass(Transform, [{
    key: 'rotation',
    get: function get() {
      return this._rotation;
    }

    /**
     * Set the rotation of the transform.
     *
     * @param {number} value - The value to set to.
     */
    ,
    set: function set(value) {
      this._rotation = value;
      this._sr = Math.sin(value);
      this._cr = Math.cos(value);
    }
  }]);

  return Transform;
}(_TransformBase3.default);

exports.default = Transform;
//# sourceMappingURL=Transform.js.map