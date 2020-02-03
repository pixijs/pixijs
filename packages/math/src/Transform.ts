import { ObservablePoint } from './ObservablePoint';
import { Matrix } from './Matrix';

/**
 * Transform that takes care about its versions
 *
 * @class
 * @memberof PIXI
 */
export class Transform
{
    /**
     * A default (identity) transform
     *
     * @static
     * @constant
     * @member {PIXI.Transform}
     */
    public static readonly IDENTITY = new Transform();

    public worldTransform: Matrix;
    public localTransform: Matrix;
    public position: ObservablePoint;
    public scale: ObservablePoint;
    public pivot: ObservablePoint;
    public skew: ObservablePoint;
    public _parentID: number;
    _worldID: number;

    protected _rotation: number;
    protected _cx: number;
    protected _sx: number;
    protected _cy: number;
    protected _sy: number;
    protected _localID: number;
    protected _currentLocalID: number;

    constructor()
    {
        /**
         * The world transformation matrix.
         *
         * @member {PIXI.Matrix}
         */
        this.worldTransform = new Matrix();

        /**
         * The local transformation matrix.
         *
         * @member {PIXI.Matrix}
         */
        this.localTransform = new Matrix();

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
         * The pivot point of the displayObject that it rotates around.
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

        /**
         * The rotation amount.
         *
         * @protected
         * @member {number}
         */
        this._rotation = 0;

        /**
         * The X-coordinate value of the normalized local X axis,
         * the first column of the local transformation matrix without a scale.
         *
         * @protected
         * @member {number}
         */
        this._cx = 1;

        /**
         * The Y-coordinate value of the normalized local X axis,
         * the first column of the local transformation matrix without a scale.
         *
         * @protected
         * @member {number}
         */
        this._sx = 0;

        /**
         * The X-coordinate value of the normalized local Y axis,
         * the second column of the local transformation matrix without a scale.
         *
         * @protected
         * @member {number}
         */
        this._cy = 0;

        /**
         * The Y-coordinate value of the normalized local Y axis,
         * the second column of the local transformation matrix without a scale.
         *
         * @protected
         * @member {number}
         */
        this._sy = 1;

        /**
         * The locally unique ID of the local transform.
         *
         * @protected
         * @member {number}
         */
        this._localID = 0;

        /**
         * The locally unique ID of the local transform
         * used to calculate the current local transformation matrix.
         *
         * @protected
         * @member {number}
         */
        this._currentLocalID = 0;

        /**
         * The locally unique ID of the world transform.
         *
         * @protected
         * @member {number}
         */
        this._worldID = 0;

        /**
         * The locally unique ID of the parent's world transform
         * used to calculate the current world transformation matrix.
         *
         * @protected
         * @member {number}
         */
        this._parentID = 0;
    }

    /**
     * Called when a value changes.
     *
     * @protected
     */
    protected onChange(): void
    {
        this._localID++;
    }

    /**
     * Called when the skew or the rotation changes.
     *
     * @protected
     */
    protected updateSkew(): void
    {
        this._cx = Math.cos(this._rotation + this.skew.y);
        this._sx = Math.sin(this._rotation + this.skew.y);
        this._cy = -Math.sin(this._rotation - this.skew.x); // cos, added PI/2
        this._sy = Math.cos(this._rotation - this.skew.x); // sin, added PI/2

        this._localID++;
    }

    /**
     * Updates the local transformation matrix.
     */
    updateLocalTransform(): void
    {
        const lt = this.localTransform;

        if (this._localID !== this._currentLocalID)
        {
            // get the matrix values of the displayobject based on its transform properties..
            lt.a = this._cx * this.scale.x;
            lt.b = this._sx * this.scale.x;
            lt.c = this._cy * this.scale.y;
            lt.d = this._sy * this.scale.y;

            lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
            lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));
            this._currentLocalID = this._localID;

            // force an update..
            this._parentID = -1;
        }
    }

    /**
     * Updates the local and the world transformation matrices.
     *
     * @param {PIXI.Transform} parentTransform - The parent transform
     */
    updateTransform(parentTransform: Transform): void
    {
        const lt = this.localTransform;

        if (this._localID !== this._currentLocalID)
        {
            // get the matrix values of the displayobject based on its transform properties..
            lt.a = this._cx * this.scale.x;
            lt.b = this._sx * this.scale.x;
            lt.c = this._cy * this.scale.y;
            lt.d = this._sy * this.scale.y;

            lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
            lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));
            this._currentLocalID = this._localID;

            // force an update..
            this._parentID = -1;
        }

        if (this._parentID !== parentTransform._worldID)
        {
            // concat the parent matrix with the objects transform.
            const pt = parentTransform.worldTransform;
            const wt = this.worldTransform;

            wt.a = (lt.a * pt.a) + (lt.b * pt.c);
            wt.b = (lt.a * pt.b) + (lt.b * pt.d);
            wt.c = (lt.c * pt.a) + (lt.d * pt.c);
            wt.d = (lt.c * pt.b) + (lt.d * pt.d);
            wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
            wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;

            this._parentID = parentTransform._worldID;

            // update the id of the transform..
            this._worldID++;
        }
    }

    /**
     * Decomposes a matrix and sets the transforms properties based on it.
     *
     * @param {PIXI.Matrix} matrix - The matrix to decompose
     */
    setFromMatrix(matrix: Matrix): void
    {
        matrix.decompose(this);
        this._localID++;
    }

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    get rotation(): number
    {
        return this._rotation;
    }

    set rotation(value) // eslint-disable-line require-jsdoc
    {
        if (this._rotation !== value)
        {
            this._rotation = value;
            this.updateSkew();
        }
    }
}
