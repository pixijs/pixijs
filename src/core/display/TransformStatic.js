var math = require('../math');
var ObservablePoint = require('./ObservablePoint');

/**
 * Transform that takes care about its versions
 * This will be reworked in v4.1, please do not use it yet unless you know what are you doing!
 *
 * @class
 * @memberof PIXI
 */
function TransformStatic()
{
    /**
     * @member {PIXI.Matrix} The global matrix transform
     */
    this.worldTransform = new math.Matrix();
    /**
     * @member {PIXI.Matrix} The local matrix transform
     */
    this.localTransform = new math.Matrix();

     /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.position = new ObservablePoint(this,0.0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.scale = new ObservablePoint(this,1,1);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.ObservablePoint}
     */
    this.pivot = new ObservablePoint(this,0.0);

    /**
     * The skew amount, on the x and y axis.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.skew = new ObservablePoint(this,0.0);

    this._rotation = 0;
    this._sr = Math.sin(0);
    this._cr = Math.cos(0);

    this._dirtyLocal = 0;
    this._versionLocal = 0;
    this._versionGlobal = 0;
}

TransformStatic.prototype.constructor = TransformStatic;

/**
 * Updates the values of the object and applies the parent's transform.
 * @param parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
TransformStatic.prototype.updateTransform = function (parentTransform)
{
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    if(this._dirtyLocal !== this._versionLocal)
    {
        // get the matrix values of the displayobject based on its transform properties..
        lt.a  =  this._cr * this.scale._x;
        lt.b  =  this._sr * this.scale._x;
        lt.c  = -this._sr * this.scale._y;
        lt.d  =  this._cr * this.scale._y;
        lt.tx =  this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
        lt.ty =  this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
        this._dirtyLocal = this._versionLocal;
    }
    // concat the parent matrix with the objects transform.
    wt.a  = lt.a  * pt.a + lt.b  * pt.c;
    wt.b  = lt.a  * pt.b + lt.b  * pt.d;
    wt.c  = lt.c  * pt.a + lt.d  * pt.c;
    wt.d  = lt.c  * pt.b + lt.d  * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._versionGlobal++;
    this.updated = true;
};

TransformStatic.prototype.updateChildTransform = function (childTransform)
{
    childTransform.updateTransform(this);
    return childTransform;
};

Object.defineProperties(TransformStatic.prototype, {
    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    rotation: {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
            this._sr = Math.sin(value);
            this._cr = Math.cos(value);
        }
    }
});

module.exports = TransformStatic;
