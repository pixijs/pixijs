var math = require('../math');


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
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
    this.rotation = 0;
    this._sr = Math.sin(0);
    this._cr = Math.cos(0);


    this.updated = true;
}

Transform.prototype.constructor = Transform;

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
Transform.prototype.updateTransform = function (parentTransform)
{
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    // get the matrix values of the displayobject based on its transform properties..
    lt.a  =  this._cr * this.scale.x;
    lt.b  =  this._sr * this.scale.x;
    lt.c  = -this._sr * this.scale.y;
    lt.d  =  this._cr * this.scale.y;
    lt.tx =  this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
    lt.ty =  this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);
    // concat the parent matrix with the objects transform.
    wt.a  = lt.a  * pt.a + lt.b  * pt.c;
    wt.b  = lt.a  * pt.b + lt.b  * pt.d;
    wt.c  = lt.c  * pt.a + lt.d  * pt.c;
    wt.d  = lt.c  * pt.b + lt.d  * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

}

module.exports = Transform;
