var math = require('../math'),
    ObservablePoint = require('./ObservablePoint');


/**
 * Generic class to deal with traditional 2D matrix transforms
 * This will be reworked in v4.1, please do not use it yet unless you know what are you doing!
 *
 * @class
 * @memberof PIXI
 */
function Transform()
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
     * @member {PIXI.Point}
     */
    this.position = new math.Point(0.0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    this.scale = new math.Point(1,1);


    this.skew = new ObservablePoint(this.updateSkew, this, 0,0);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    this.pivot = new math.Point(0.0);


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

    this._dirty = false;
    this.updated = true;
}

Transform.prototype.constructor = Transform;

Transform.prototype.updateSkew = function ()
{
    this._cy  = Math.cos(this.skew.y);
    this._sy  = Math.sin(this.skew.y);
    this._nsx = -Math.sin(this.skew.x);
    this._cx  = Math.cos(this.skew.x);
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
Transform.prototype.updateTransform = function (parentTransform)
{
    var wt = this.worldTransform;
    var pt = parentTransform.worldTransform;
    var lt = this.localTransform;
    lt.setTransform(this.position.x, this.position.y, this.pivot.x, this.pivot.y, this.scale.x, this.scale.y,
        this._cr, this._sr, this._cx, this._nsx, this._cy, this._sy);
    wt.copyAppend(lt, pt);
};

/**
 * This method can be overriden if user wants its own transform type
 * @param childTransform
 * @returns {*}
 */
Transform.prototype.updateChildTransform = function (childTransform)
{
    childTransform.updateTransform(this);
    return childTransform;
};

Object.defineProperties(Transform.prototype, {
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

module.exports = Transform;
