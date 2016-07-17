var math = require('../math');


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @memberof PIXI
 */
function TransformBase()
{
    /**
     * The global matrix transform. It can be swapped temporarily by some functions like getLocalBounds()
     *
     * @member {PIXI.Matrix}
     */
    this.worldTransform = new math.Matrix();
    /**
     * The local matrix transform
     * 
     * @member {PIXI.Matrix}
     */
    this.localTransform = new math.Matrix();

    this._worldID = 0;
}

TransformBase.prototype.constructor = TransformBase;

/**
 * TransformBase does not have decomposition, so this function wont do anything
 */
TransformBase.prototype.updateLocalTransform = function() { // jshint unused:false

};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.TransformBase} The transform of the parent of this object
 *
 */
TransformBase.prototype.updateTransform = function (parentTransform)
{
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    // concat the parent matrix with the objects transform.
    wt.a  = lt.a  * pt.a + lt.b  * pt.c;
    wt.b  = lt.a  * pt.b + lt.b  * pt.d;
    wt.c  = lt.c  * pt.a + lt.d  * pt.c;
    wt.d  = lt.c  * pt.b + lt.d  * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._worldID ++;
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
TransformBase.prototype.updateWorldTransform = TransformBase.prototype.updateTransform;

TransformBase.IDENTITY = new TransformBase();

module.exports = TransformBase;
