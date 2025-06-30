import { Matrix } from '../../maths/matrix/Matrix';
import { ObservablePoint } from '../../maths/point/ObservablePoint';

import type { Observer } from '../../maths/point/ObservablePoint';

/**
 * Options for the {@link Transform} constructor.
 * @category utils
 * @advanced
 */
export interface TransformOptions
{
    /** The matrix to use. */
    matrix?: Matrix;
    /**
     * The observer to use.
     * @advanced
     */
    observer?: {_onUpdate: (transform: Transform) => void}
}

/**
 * The Transform class facilitates the manipulation of a 2D transformation matrix through
 * user-friendly properties: position, scale, rotation, skew, and pivot.
 * @example
 * ```ts
 * // Basic transform usage
 * const transform = new Transform();
 * transform.position.set(100, 100);
 * transform.rotation = Math.PI / 4; // 45 degrees
 * transform.scale.set(2, 2);
 *
 * // With pivot point
 * transform.pivot.set(50, 50);
 * transform.rotation = Math.PI; // Rotate around pivot
 *
 * // Matrix manipulation
 * const matrix = transform.matrix;
 * const position = { x: 0, y: 0 };
 * matrix.apply(position); // Transform point
 * ```
 * @remarks
 * - Manages 2D transformation properties
 * - Auto-updates matrix on changes
 * - Supports observable changes
 * - Common in display objects
 * @category utils
 * @standard
 * @see {@link Matrix} For direct matrix operations
 * @see {@link ObservablePoint} For point properties
 */
export class Transform
{
    /**
     * The local transformation matrix.
     * @internal
     */
    public _matrix: Matrix;

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * @example
     * ```ts
     * // Basic position setting
     * transform.position.set(100, 100);
     *
     * // Individual coordinate access
     * transform.position.x = 50;
     * transform.position.y = 75;
     * ```
     */
    public position: ObservablePoint;

    /**
     * The scale factor of the object.
     * @example
     * ```ts
     * // Uniform scaling
     * transform.scale.set(2, 2);
     *
     * // Non-uniform scaling
     * transform.scale.x = 2; // Stretch horizontally
     * transform.scale.y = 0.5; // Compress vertically
     * ```
     */
    public scale: ObservablePoint;

    /**
     * The pivot point of the container that it rotates around.
     * @example
     * ```ts
     * // Center pivot
     * transform.pivot.set(sprite.width / 2, sprite.height / 2);
     *
     * // Corner rotation
     * transform.pivot.set(0, 0);
     * transform.rotation = Math.PI / 4; // 45 degrees
     * ```
     */
    public pivot: ObservablePoint;

    /**
     * The skew amount, on the x and y axis.
     * @example
     * ```ts
     * // Apply horizontal skew
     * transform.skew.x = Math.PI / 6; // 30 degrees
     *
     * // Apply both skews
     * transform.skew.set(Math.PI / 6, Math.PI / 8);
     * ```
     */
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
     * The transformation matrix computed from the transform's properties.
     * Combines position, scale, rotation, skew, and pivot into a single matrix.
     * @example
     * ```ts
     * // Get current matrix
     * const matrix = transform.matrix;
     * console.log(matrix.toString());
     * ```
     * @readonly
     * @see {@link Matrix} For matrix operations
     * @see {@link Transform.setFromMatrix} For setting transform from matrix
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
     * @example
     * ```ts
     * // Basic matrix decomposition
     * const transform = new Transform();
     * const matrix = new Matrix()
     *     .translate(100, 100)
     *     .rotate(Math.PI / 4)
     *     .scale(2, 2);
     *
     * transform.setFromMatrix(matrix);
     * console.log(transform.position.x); // 100
     * console.log(transform.rotation); // ~0.785 (π/4)
     * ```
     * @param matrix - The matrix to decompose
     * @see {@link Matrix#decompose} For the decomposition logic
     * @see {@link Transform#matrix} For getting the current matrix
     */
    public setFromMatrix(matrix: Matrix): void
    {
        matrix.decompose(this);
        this.dirty = true;
    }

    /**
     * The rotation of the object in radians.
     * @example
     * ```ts
     * // Basic rotation
     * transform.rotation = Math.PI / 4; // 45 degrees
     *
     * // Rotate around pivot point
     * transform.pivot.set(50, 50);
     * transform.rotation = Math.PI; // 180 degrees around pivot
     *
     * // Animate rotation
     * app.ticker.add(() => {
     *     transform.rotation += 0.1;
     * });
     * ```
     * @see {@link Transform#pivot} For rotation point
     * @see {@link Transform#skew} For skew effects
     */
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
