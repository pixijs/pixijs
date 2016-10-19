import { ObservablePoint } from '../math';
import TransformBase from './TransformBase';

/**
 * Transform that takes care about its versions
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
export default class TransformStatic extends TransformBase
{
    /**
     *
     */
    constructor()
    {
        super();

         /**
         * The coordinate of the object relative to the local coordinates of the parent.
         *
         * @member {PIXI.ObservablePoint}
         */
        this.position = new ObservablePoint(this.onChange, this, 0, 0);

        /**
         * The scale factor of the object.
         *
         * @member {PIXI.ObservablePoint}
         */
        this.scale = new ObservablePoint(this.onChange, this, 1, 1);

        /**
         * The pivot point of the displayObject that it rotates around
         *
         * @member {PIXI.ObservablePoint}
         */
        this.pivot = new ObservablePoint(this.onChange, this, 0, 0);

        /**
         * The skew amount, on the x and y axis.
         *
         * @member {PIXI.ObservablePoint}
         */
        this.skew = new ObservablePoint(this.updateSkew, this, 0, 0);

        this._rotation = 0;

        this._sr = Math.sin(0);
        this._cr = Math.cos(0);
        this._cy = Math.cos(0);// skewY);
        this._sy = Math.sin(0);// skewY);
        this._nsx = Math.sin(0);// skewX);
        this._cx = Math.cos(0);// skewX);

        this._localID = 0;
        this._currentLocalID = 0;
    }

    /**
     * Called when a value changes.
     *
     * @private
     */
    onChange()
    {
        this._localID ++;
    }

    /**
     * Called when skew changes
     *
     * @private
     */
    updateSkew()
    {
        this._cy = Math.cos(this.skew._y);
        this._sy = Math.sin(this.skew._y);
        this._nsx = Math.sin(this.skew._x);
        this._cx = Math.cos(this.skew._x);

        this._localID ++;
    }

    /**
     * Updates only local matrix
     */
    updateLocalTransform()
    {
        const lt = this.localTransform;

        if (this._localID !== this._currentLocalID)
        {
            // get the matrix values of the displayobject based on its transform properties..
            const a  =  this._cr * this.scale._x;
            const b  =  this._sr * this.scale._x;
            const c  = -this._sr * this.scale._y;
            const d  =  this._cr * this.scale._y;

            lt.a = (this._cy * a) + (this._sy * c);
            lt.b = (this._cy * b) + (this._sy * d);
            lt.c = (this._nsx * a) + (this._cx * c);
            lt.d = (this._nsx * b) + (this._cx * d);

            lt.tx = this.position._x - ((this.pivot._x * lt.a) + (this.pivot._y * lt.c));
            lt.ty = this.position._y - ((this.pivot._x * lt.b) + (this.pivot._y * lt.d));
            this._currentLocalID = this._localID;

            // force an update..
            this._parentID = -1;
        }
    }

    /**
     * Updates the values of the object and applies the parent's transform.
     *
     * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
     */
    updateTransform(parentTransform)
    {
        const pt = parentTransform.worldTransform;
        const wt = this.worldTransform;
        const lt = this.localTransform;

        if (this._localID !== this._currentLocalID)
        {
            // get the matrix values of the displayobject based on its transform properties..
            const a  =  this._cr * this.scale._x;
            const b  =  this._sr * this.scale._x;
            const c  = -this._sr * this.scale._y;
            const d  =  this._cr * this.scale._y;

            lt.a = (this._cy * a) + (this._sy * c);
            lt.b = (this._cy * b) + (this._sy * d);
            lt.c = (this._nsx * a) + (this._cx * c);
            lt.d = (this._nsx * b) + (this._cx * d);

            lt.tx = this.position._x - ((this.pivot._x * lt.a) + (this.pivot._y * lt.c));
            lt.ty = this.position._y - ((this.pivot._x * lt.b) + (this.pivot._y * lt.d));
            this._currentLocalID = this._localID;

            // force an update..
            this._parentID = -1;
        }

        if (this._parentID !== parentTransform._worldID)
        {
            // concat the parent matrix with the objects transform.
            wt.a = (lt.a * pt.a) + (lt.b * pt.c);
            wt.b = (lt.a * pt.b) + (lt.b * pt.d);
            wt.c = (lt.c * pt.a) + (lt.d * pt.c);
            wt.d = (lt.c * pt.b) + (lt.d * pt.d);
            wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
            wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;

            this._parentID = parentTransform._worldID;

            // update the id of the transform..
            this._worldID ++;
        }
    }

    /**
     * Decomposes a matrix and sets the transforms properties based on it.
     *
     * @param {PIXI.Matrix} matrix - The matrix to decompose
     */
    setFromMatrix(matrix)
    {
        matrix.decompose(this);
        this._localID ++;
    }

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.TransformStatic#
     */
    get rotation()
    {
        return this._rotation;
    }

    /**
     * Sets the rotation of the transform.
     *
     * @param {number} value - The value to set to.
     */
    set rotation(value)
    {
        this._rotation = value;
        this._sr = Math.sin(value);
        this._cr = Math.cos(value);
        this._localID ++;
    }
}
