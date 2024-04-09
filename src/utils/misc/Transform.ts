import { Matrix } from '../../maths/matrix/Matrix';
import { ObservablePoint } from '../../maths/point/ObservablePoint';

import type { Observer } from '../../maths/point/ObservablePoint';

/**
 * Options for the {@link utils.Transform} constructor.
 * @memberof utils.Transform
 */
export interface TransformOptions
{
    /** The matrix to use. */
    matrix?: Matrix;
    /** The observer to use. */
    observer?: {_onUpdate: (transform: Transform) => void}
}

/**
 * The Transform class facilitates the manipulation of a 2D transformation matrix through
 * user-friendly properties: position, scale, rotation, skew, and pivot.
 * @memberof utils
 */
export class Transform
{
    /**
     * The local transformation matrix.
     * @internal
     * @private
     */
    public _matrix: Matrix;

    /** The coordinate of the object relative to the local coordinates of the parent. */
    public position: ObservablePoint;

    /** The scale factor of the object. */
    public scale: ObservablePoint;

    /** The pivot point of the container that it rotates around. */
    public pivot: ObservablePoint;

    /** The skew amount, on the x and y axis. */
    public skew: ObservablePoint;

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

    protected dirty = true;
    protected observer: Observer<Transform>;

    /**
     * @param options - Options for the transform.
     * @param options.matrix - The matrix to use.
     * @param options.observer - The observer to use.
     */
    constructor({ matrix, observer }: TransformOptions = {})
    {
        this._matrix = matrix ?? new Matrix();
        this.observer = observer;

        this.position = new ObservablePoint(this, 0, 0);
        this.scale = new ObservablePoint(this, 1, 1);
        this.pivot = new ObservablePoint(this, 0, 0);
        this.skew = new ObservablePoint(this, 0, 0);

        this._rotation = 0;
        this._cx = 1;
        this._sx = 0;
        this._cy = 0;
        this._sy = 1;
    }

    /**
     * This matrix is computed by combining this Transforms position, scale, rotation, skew, and pivot
     * properties into a single matrix.
     * @readonly
     */
    get matrix(): Matrix
    {
        const lt = this._matrix;

        if (!this.dirty) return lt;

        lt.a = this._cx * this.scale.x;
        lt.b = this._sx * this.scale.x;
        lt.c = this._cy * this.scale.y;
        lt.d = this._sy * this.scale.y;

        lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
        lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));

        this.dirty = false;

        return lt;
    }
    /**
     * Called when a value changes.
     * @param point
     * @internal
     * @private
     */
    public _onUpdate(point?: ObservablePoint): void
    {
        this.dirty = true;

        if (point === this.skew)
        {
            this.updateSkew();
        }

        this.observer?._onUpdate(this);
    }

    /** Called when the skew or the rotation changes. */
    protected updateSkew(): void
    {
        this._cx = Math.cos(this._rotation + this.skew.y);
        this._sx = Math.sin(this._rotation + this.skew.y);
        this._cy = -Math.sin(this._rotation - this.skew.x); // cos, added PI/2
        this._sy = Math.cos(this._rotation - this.skew.x); // sin, added PI/2

        this.dirty = true;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Transform `
            + `position=(${this.position.x}, ${this.position.y}) `
            + `rotation=${this.rotation} `
            + `scale=(${this.scale.x}, ${this.scale.y}) `
            + `skew=(${this.skew.x}, ${this.skew.y}) `
            + `]`;
    }
    // #endif

    /**
     * Decomposes a matrix and sets the transforms properties based on it.
     * @param matrix - The matrix to decompose
     */
    public setFromMatrix(matrix: Matrix): void
    {
        matrix.decompose(this);
        this.dirty = true;
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
            this._onUpdate(this.skew);
        }
    }
}
