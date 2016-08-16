var math = require('../math'),
    TransformBase = require('./TransformBase');

/**
 * Transform that takes care about its versions
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
function TransformStatic()
{
    TransformBase.call(this);
     /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.position = new math.ObservablePoint(this.onChange, this,0,0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.scale = new math.ObservablePoint(this.onChange, this,1,1);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.ObservablePoint}
     */
    this.pivot = new math.ObservablePoint(this.onChange, this,0, 0);

    /**
     * The skew amount, on the x and y axis.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.skew = new math.ObservablePoint(this.updateSkew, this,0, 0);

    this._rotation = 0;

    this._sr = Math.sin(0);
    this._cr = Math.cos(0);
    this._cy  = Math.cos(0);//skewY);
    this._sy  = Math.sin(0);//skewY);
    this._nsx = Math.sin(0);//skewX);
    this._cx  = Math.cos(0);//skewX);

    this._localID = 0;
    this._currentLocalID = 0;
}

TransformStatic.prototype = Object.create(TransformBase.prototype);
TransformStatic.prototype.constructor = TransformStatic;

TransformStatic.prototype.onChange = function ()
{
    this._localID ++;
};

TransformStatic.prototype.updateSkew = function ()
{
    this._cy  = Math.cos(this.skew._y);
    this._sy  = Math.sin(this.skew._y);
    this._nsx = Math.sin(this.skew._x);
    this._cx  = Math.cos(this.skew._x);

    this._localID ++;
};

/**
 * Updates only local matrix
 */
TransformStatic.prototype.updateLocalTransform = function() {
    var lt = this.localTransform;
    if(this._localID !== this._currentLocalID)
    {
        // get the matrix values of the displayobject based on its transform properties..
        var a,b,c,d;

        a  =  this._cr * this.scale._x;
        b  =  this._sr * this.scale._x;
        c  = -this._sr * this.scale._y;
        d  =  this._cr * this.scale._y;

        lt.a  = this._cy * a + this._sy * c;
        lt.b  = this._cy * b + this._sy * d;
        lt.c  = this._nsx * a + this._cx * c;
        lt.d  = this._nsx * b + this._cx * d;

        lt.tx =  this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
        lt.ty =  this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
        this._currentLocalID = this._localID;

        // force an update..
        this._parentID = -1;
    }
};

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

    if(this._localID !== this._currentLocalID)
    {
        // get the matrix values of the displayobject based on its transform properties..
        var a,b,c,d;

        a  =  this._cr * this.scale._x;
        b  =  this._sr * this.scale._x;
        c  = -this._sr * this.scale._y;
        d  =  this._cr * this.scale._y;

        lt.a  = this._cy * a + this._sy * c;
        lt.b  = this._cy * b + this._sy * d;
        lt.c  = this._nsx * a + this._cx * c;
        lt.d  = this._nsx * b + this._cx * d;

        lt.tx =  this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
        lt.ty =  this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
        this._currentLocalID = this._localID;

        // force an update..
        this._parentID = -1;
    }

    if(this._parentID !== parentTransform._worldID)
    {
        // concat the parent matrix with the objects transform.
        wt.a  = lt.a  * pt.a + lt.b  * pt.c;
        wt.b  = lt.a  * pt.b + lt.b  * pt.d;
        wt.c  = lt.c  * pt.a + lt.d  * pt.c;
        wt.d  = lt.c  * pt.b + lt.d  * pt.d;
        wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
        wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

        this._parentID = parentTransform._worldID;

        // update the id of the transform..
        this._worldID ++;
    }
};

/**
 * Decomposes a matrix and sets the transforms properties based on it.
 * @param {PIXI.Matrix} The matrix to decompose
 */
TransformStatic.prototype.setFromMatrix = function (matrix)
{
    matrix.decompose(this);
    this._localID ++;
};

Object.defineProperties(TransformStatic.prototype, {
    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.TransformStatic#
     */
    rotation: {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
            this._sr = Math.sin(value);
            this._cr = Math.cos(value);
            this._localID ++;
        }
    }
});

module.exports = TransformStatic;
