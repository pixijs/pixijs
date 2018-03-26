import { Matrix } from '../math';

/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @memberof PIXI
 */
export default class TransformBase
{
    /**
     *
     */
    constructor()
    {
        /**
         * The global matrix transform. It can be swapped temporarily by some functions like getLocalBounds()
         *
         * @member {PIXI.Matrix}
         */
        this.worldTransform = new Matrix();

        /**
         * The local matrix transform
         *
         * @member {PIXI.Matrix}
         */
        this.localTransform = new Matrix();

        this._worldID = 0;
        this._parentID = 0;
    }

    /**
     * TransformBase does not have decomposition, so this function wont do anything
     */
    updateLocalTransform()
    {
        // empty
    }

    /**
     * Updates the values of the object and applies the parent's transform.
     *
     * @param {PIXI.TransformBase} parentTransform - The transform of the parent of this object
     */
    updateTransform(parentTransform)
    {
        const pt = parentTransform.worldTransform;
        const wt = this.worldTransform;
        const lt = this.localTransform;

        // concat the parent matrix with the objects transform.
        wt.a = (lt.a * pt.a) + (lt.b * pt.c);
        wt.b = (lt.a * pt.b) + (lt.b * pt.d);
        wt.c = (lt.c * pt.a) + (lt.d * pt.c);
        wt.d = (lt.c * pt.b) + (lt.d * pt.d);
        wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
        wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;

        this._worldID ++;
    }

}

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
TransformBase.prototype.updateWorldTransform = TransformBase.prototype.updateTransform;

TransformBase.IDENTITY = new TransformBase();
