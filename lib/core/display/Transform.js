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

    _this._cx = 1; // cos rotation + skewY;
    _this._sx = 0; // sin rotation + skewY;
    _this._cy = 0; // cos rotation + Math.PI/2 - skewX;
    _this._sy = 1; // sin rotation + Math.PI/2 - skewX;
    return _this;
  }

  /**
   * Updates the skew values when the skew or rotation changes.
   *
   * @private
   */


  Transform.prototype.updateSkew = function updateSkew() {
    this._cx = Math.cos(this._rotation + this.skew._y);
    this._sx = Math.sin(this._rotation + this.skew._y);
    this._cy = -Math.sin(this._rotation - this.skew._x); // cos, added PI/2
    this._sy = Math.cos(this._rotation - this.skew._x); // sin, added PI/2
  };

  /**
   * Updates only local matrix
   */


  Transform.prototype.updateLocalTransform = function updateLocalTransform() {
    var lt = this.localTransform;

    lt.a = this._cx * this.scale.x;
    lt.b = this._sx * this.scale.x;
    lt.c = this._cy * this.scale.y;
    lt.d = this._sy * this.scale.y;

    lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
    lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);
  };

  /**
   * Updates the values of the object and applies the parent's transform.
   *
   * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
   */


  Transform.prototype.updateTransform = function updateTransform(parentTransform) {
    var lt = this.localTransform;

    lt.a = this._cx * this.scale.x;
    lt.b = this._sx * this.scale.x;
    lt.c = this._cy * this.scale.y;
    lt.d = this._sy * this.scale.y;

    lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
    lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);

    // concat the parent matrix with the objects transform.
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;

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
   */


  _createClass(Transform, [{
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

  return Transform;
}(_TransformBase3.default);

exports.default = Transform;
//# sourceMappingURL=Transform.js.map