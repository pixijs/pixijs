import { ObservablePoint } from './ObservablePoint';
import { Matrix } from './Matrix';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Transform extends GlobalMixins.Transform {}

/**
 * Transform that takes care about its versions.
 *
 * @memberof PIXI
 */
export class Transform
{
    /** A default (identity) transform. */
    public static readonly IDENTITY = new Transform();

    /** The world transformation matrix. */
    public worldTransform: Matrix;

    /** The local transformation matrix. */
    public localTransform: Matrix;

    /** The coordinate of the object relative to the local coordinates of the parent. */
    public position: ObservablePoint;

    /** The scale factor of the object. */
    public scale: ObservablePoint;

    /** The pivot point of the displayObject that it rotates around. */
    public pivot: ObservablePoint;

    /** The skew amount, on the x and y axis. */
    public skew: ObservablePoint;

    /**
     * The locally unique ID of the parent's world transform
     * used to calculate the current world transformation matrix.
     */
    public _parentID: number;

    /** The locally unique ID of the world transform. */
    _worldID: number;

    /** The rotation amount. */
    protected _rotation: number;

    /**
     * The X-coordinate value of the normalized local X axis,
     * the first column of the local transformation matrix without a scale.
     */
    protected _cx: number;

    /**
     * The Y-coordinate value of the normalized local X axis,
     * the first column of the local transformation matrix without a scale.
     */
    protected _sx: number;

    /**
     * The X-coordinate value of the normalized local Y axis,
     * the second column of the local transformation matrix without a scale.
     */
    protected _cy: number;

    /**
     * The Y-coordinate value of the normalized local Y axis,
     * the second column of the local transformation matrix without a scale.
     */
    protected _sy: number;

    /** The locally unique ID of the local transform. */
    protected _localID: number;

    /**
     * The locally unique ID of the local transform
     * used to calculate the current local transformation matrix.
     */
    protected _currentLocalID: number;

    constructor()
    {
        this.worldTransform = new Matrix();
        this.localTransform = new Matrix();
        this.position = new ObservablePoint(this.onChange, this, 0, 0);
        this.scale = new ObservablePoint(this.onChange, this, 1, 1);
        this.pivot = new ObservablePoint(this.onChange, this, 0, 0);
        this.skew = new ObservablePoint(this.updateSkew, this, 0, 0);

        this._rotation = 0;
        this._cx = 1;
        this._sx = 0;
        this._cy = 0;
        this._sy = 1;
        this._localID = 0;
        this._currentLocalID = 0;

        this._worldID = 0;
        this._parentID = 0;
    }

    /** Called when a value changes. */
    protected onChange(): void
    {
        this._localID++;
    }

    /** Called when the skew or the rotation changes. */
    protected updateSkew(): void
    {
        this._cx = Math.cos(this._rotation + this.skew.y);
        this._sx = Math.sin(this._rotation + this.skew.y);
        this._cy = -Math.sin(this._rotation - this.skew.x); // cos, added PI/2
        this._sy = Math.cos(this._rotation - this.skew.x); // sin, added PI/2

        this._localID++;
    }

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:Transform `
            + `position=(${this.position.x}, ${this.position.y}) `
            + `rotation=${this.rotation} `
            + `scale=(${this.scale.x}, ${this.scale.y}) `
            + `skew=(${this.skew.x}, ${this.skew.y}) `
            + `]`;
    }
    // #endif

    /** Updates the local transformation matrix. */
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
     * @param parentTransform - The parent transform
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
     * @param matrix - The matrix to decompose
     */
    setFromMatrix(matrix: Matrix): void
    {
        matrix.decompose(this);
        this._localID++;
    }

    /** The rotation of the object in radians. */
    get rotation(): number
    {
        return this._rotation;
    }

    set rotation(value: number)
    {
        if (this._rotation !== value)
        {
            this._rotation = value;
            this.updateSkew();
        }
    }
}
