var math = require('../math'),
    ObservablePoint = require('../display/ObservablePoint'),
    ComputedTransform2d = require('./ComputedTransform2d'),
    utils = require('../utils');


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function Transform2d(isStatic)
{
    /**
     * @member {PIXI.Matrix} The global matrix transform
     */
    this.matrix2d = new math.Matrix();

    this.isStatic = !!isStatic;

     /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    this.position = isStatic ? new ObservablePoint(this.makeDirty, this, 0,0) : new math.Point(0,0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    this.scale = isStatic ? new ObservablePoint(this.makeDirty, this, 1,1) : new math.Point(1,1);


    this.skew = new ObservablePoint(this.updateSkew, this, 0,0);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    this.pivot = isStatic ? new ObservablePoint(this.makeDirty, this, 0,0) : new math.Point(0,0);


    /**
     * The rotation value of the object, in radians
     *
     * @member {Number}
     */
    this._rotation = 0;

    this._sr = Math.sin(0);
    this._cr = Math.cos(0);
    this._cy  = Math.cos(0);//skewY);
    this._sy  = Math.sin(0);//skewY);
    this._nsx = Math.sin(0);//skewX);
    this._cx  = Math.cos(0);//skewX);

    this._dirtyVersion = 0;
    this.version = 0;
    this.is3d = false;

    /**
     * whether or not this matrix has only position & pivot
     * 0 for everything, 1 for translation, 2 for identity
     * @type {boolean}
     */
    this.operType = 0;

    this.uid = utils.incTransform();
}

Transform2d.prototype.constructor = Transform2d;

Transform2d.prototype.updateSkew = function ()
{
    this._cy  = Math.cos(this.skew.y);
    this._sy  = Math.sin(this.skew.y);
    this._nsx = Math.sin(this.skew.x);
    this._cx  = Math.cos(this.skew.x);
    this._dirtyVersion++;
};

Transform2d.prototype.makeDirty = function() {
    this._dirtyVersion++;
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
Transform2d.prototype.update = function ()
{
    if (this.isStatic &&
        this.version === this._dirtyVersion) {
        return false;
    }

    var lt = this.matrix2d;
    var a, b, c, d;

    a  =  this._cr * this.scale.x;
    b  =  this._sr * this.scale.x;
    c  = -this._sr * this.scale.y;
    d  =  this._cr * this.scale.y;

    lt.a  = this._cy * a + this._sy * c;
    lt.b  = this._cy * b + this._sy * d;
    lt.c  = this._nsx * a + this._cx * c;
    lt.d  = this._nsx * b + this._cx * d;

    lt.tx =  this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
    lt.ty =  this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);

    if (lt.a === 1.0 && lt.b === 0.0 && lt.c === 0.0 && lt.d === 1.0) {
        if (lt.tx === 0.0 && lt.ty === 0.0) {
            this.operType = 2;
        } else {
            this.operType = 1;
        }
    } else {
        this.operType = 0;
    }

    this.version = ++this._dirtyVersion;
    return true;
};

/**
 * Decomposes a matrix and sets the transforms properties based on it.
 * @param {Matrix}
 */
Transform2d.prototype.setFromMatrix = function (matrix)
{
    matrix.decompose(this);
    this.updateSkew();
};

Transform2d.prototype.makeComputedTransform = function(computedTransform) {
    if (!computedTransform || computedTransform._dirtyLocalUid !== this.uid) {
        computedTransform = new ComputedTransform2d();
    }
    computedTransform.matrix2d = this.matrix2d;
    computedTransform.version = this.version;
    return computedTransform;
};

Transform2d.prototype.destroy = function() {
    this.skew.destroy();
    if (this.isStatic) {
        this.position.destroy();
        this.scale.destroy();
        this.pivot.destroy();
    }

    this.position = null;
    this.scale = null;
    this.pivot = null;
    this.skew = null;
};

Object.defineProperties(Transform2d.prototype, {
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
            if (this._rotation !== value) {
                this._rotation = value;
                this._sr = Math.sin(value);
                this._cr = Math.cos(value);
                this._dirtyVersion++;
            }
        }
    },
    matrix: {
        get: function() {
            return this.matrix2d;
        }
    }
});

module.exports = Transform2d;
