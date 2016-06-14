var math = require('../math');


/**
 * Generic class to deal with traditional 2D matrix transforms
 * This will be reworked in v4.1, please do not use it yet unless you know what are you doing!
 *
 * @class
 * @memberof PIXI
 */
function TransformManual()
{
    /**
     * @member {PIXI.Matrix} The global matrix transform
     */
    this.worldTransform = new math.Matrix();
    /**
     * @member {PIXI.Matrix} The local matrix transform
     */
    this.localTransform = new math.Matrix();

    this._worldID = 0;
}

TransformManual.prototype.constructor = TransformManual;

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
TransformManual.prototype.updateTransform = function (parentTransform)
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

module.exports = TransformManual;
