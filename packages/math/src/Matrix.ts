import { Point } from './Point';
import { PI_2 } from './const';

import type { Transform } from './Transform';
import type { IPoint } from './IPoint';

/**
 * The `Matrix` class represents an affine transformation that performs a linear
 * mapping from one 2D frame-of-reference to another 2D frame-of-reference. It preserves
 * straightness and parallelness of lines. It can be constructed to perform sequences of
 * translations, scales, rotations, and skews.
 *
 * ## Linear map
 * The transformation matrix for a `Matrix` object is:
 *
 * ```js
 * | a  | b  | 0 |
 * | c  | d  | 0 |
 * | tx | ty | 1 |
 * ```
 *
 * The output 2D coordinates (X,Y) for an input (x,y) is:
 * ```
 * X = a*x + c*y + tx
 * Y = b*x + d*y + ty
 * ```
 *
 * ## Order of transformations
 * Because matrix multiplication is not commutative, the order of simple transformations
 * applied on a matrix is relevant!
 *
 * ## Invertibility of transformation matrices
 * All matrix transforms are assumed to be invertible. This means that scaling an object
 * to zero width or height is illegal in pixi.js!
 *
 * ## Local transformation matrix
 * In the context of display objects, a local transformation will map a 2D point in a
 * display-object's reference frame to that of its parent. If a parent doesn't exist, it
 * will map the point to the canvas/render-target's reference frame.
 *
 * ## World transformation matrix
 * A world transformation will map a 2D point in a display-object's reference frame to the
 * canvas/render-target's reference frame. By definition, the local transformation of the
 * root display-object (or "stage") is equal to its world transformation.
 *
 * ## Other non-local transformation matrices
 * If the depth of a display-object in the scene graph is D, there are D - 1 ancestors for
 * which an additional transformation can be defined to map a point in the display-object's
 * reference frame to that ancestor's reference frame. These are called non-local transformations.
 * The world transformation is a special non-local transformation that maps a point to the
 * 0th ancestor (the canvas/render-target). `PIXI.Transform` caches the world transformation
 * for a display-object.
 *
 * @class
 * @memberof PIXI
 */
export class Matrix
{
    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public tx: number;
    public ty: number;

    public array: Float32Array|null = null;

    /**
     * @param {number} [a=1] - x scale
     * @param {number} [b=0] - x skew
     * @param {number} [c=0] - y skew
     * @param {number} [d=1] - y scale
     * @param {number} [tx=0] - x translation
     * @param {number} [ty=0] - y translation
     */
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0)
    {
        /**
         * @member {number}
         * @default 1
         */
        this.a = a;

        /**
         * @member {number}
         * @default 0
         */
        this.b = b;

        /**
         * @member {number}
         * @default 0
         */
        this.c = c;

        /**
         * @member {number}
         * @default 1
         */
        this.d = d;

        /**
         * @member {number}
         * @default 0
         */
        this.tx = tx;

        /**
         * @member {number}
         * @default 0
         */
        this.ty = ty;
    }

    /**
     * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
     *
     * a = array[0]
     * b = array[1]
     * c = array[3]
     * d = array[4]
     * tx = array[2]
     * ty = array[5]
     *
     * @param {number[]} array - The array that the matrix will be populated from.
     */
    fromArray(array: number[]): void
    {
        this.a = array[0];
        this.b = array[1];
        this.c = array[3];
        this.d = array[4];
        this.tx = array[2];
        this.ty = array[5];
    }

    /**
     * Set the matrix coefficients directly to define a linear map (or transformation)
     * as follows:
     *
     * ```
     * X = a*x + b*y + tx
     * Y = c*x + d*y + ty
     * ```
     *
     * @param {number} a - matrix coefficient
     * @param {number} b - matrix coefficient
     * @param {number} c - matrix coefficient
     * @param {number} d - matrix coefficient
     * @param {number} tx - matrix coefficient
     * @param {number} ty - matrix coefficient
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    set(a: number, b: number, c: number, d: number, tx: number, ty: number): this
    {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;

        return this;
    }

    /**
     * Create an array of the matrix coefficients in this transform.
     *
     * By default, the array is built column-wise (coefficents in one column
     * are stored together). You can store the transposed matrix, which will insert
     * the coefficients row-wise (coefficients in one row are stored together) into
     * the array.
     *
     * @param {boolean} transpose - whether to write the tranposed form of this matrix. By default,
     *  the array is built column-wise.
     * @param {Float32Array} [out=new Float32Array(9)] - destination array
     * @return {number[]} the array containing the matrix coefficients
     */
    toArray(transpose: boolean, out?: Float32Array): Float32Array
    {
        if (!this.array)
        {
            this.array = new Float32Array(9);
        }

        const array = out || this.array;

        if (transpose)
        {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
        }
        else
        {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        }

        return array;
    }

    /**
     * Applies this transformation on the given 2D point. This is useful to go from a
     * display-object content's coordinate system to the world coordinate system.
     *
     * @param {PIXI.Point} pos - the point to transform
     * @param {PIXI.Point} [newPos] - the `Point` object into which the result is stored (may be same as input `pos`)
     * @return {PIXI.Point} the point after transformation
     */
    apply(pos: IPoint, newPos?: Point): Point
    {
        newPos = newPos || new Point();

        const x = pos.x;
        const y = pos.y;

        newPos.x = (this.a * x) + (this.c * y) + this.tx;
        newPos.y = (this.b * x) + (this.d * y) + this.ty;

        return newPos;
    }

    /**
     * Applies the inverse transformation for this matrix on the given 2D point. This is useful
     * to go from the world coordinate system to a display-object's coordinate system.
     *
     * If this transformation is applied on the returned 2D point, then the input point will
     * be received.
     *
     * @param {PIXI.Point} pos - the point to inverse transform
     * @param {PIXI.Point} [newPos] - the `Point` object into which the result is stored (may be same as input `pos`)
     * @return {PIXI.Point} the point after inverse transformation
     */
    applyInverse(pos: IPoint, newPos?: Point): Point
    {
        newPos = newPos || new Point();

        const id = 1 / ((this.a * this.d) + (this.c * -this.b));

        const x = pos.x;
        const y = pos.y;

        newPos.x = (this.d * id * x) + (-this.c * id * y) + (((this.ty * this.c) - (this.tx * this.d)) * id);
        newPos.y = (this.a * id * y) + (-this.b * id * x) + (((-this.ty * this.a) + (this.tx * this.b)) * id);

        return newPos;
    }

    /**
     * Appends a translation of (x, y) to this transformation.
     *
     * @param {number} x - translation in x-direction
     * @param {number} y - translation in y-direction
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    translate(x: number, y: number): this
    {
        this.tx += x;
        this.ty += y;

        return this;
    }

    /**
     * Appends a scaling transform to this matrix.
     *
     * @param {number} x - horizontal scaling/magnification/minification factor
     * @param {number} y - vertical scaling/magnification/minification factor
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    scale(x: number, y: number): this
    {
        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;

        return this;
    }

    /**
     * Appends a rotation to this transformation.
     *
     * @param {number} angle - the angle to rotate in radians.
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    rotate(angle: number): this
    {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const a1 = this.a;
        const c1 = this.c;
        const tx1 = this.tx;

        this.a = (a1 * cos) - (this.b * sin);
        this.b = (a1 * sin) + (this.b * cos);
        this.c = (c1 * cos) - (this.d * sin);
        this.d = (c1 * sin) + (this.d * cos);
        this.tx = (tx1 * cos) - (this.ty * sin);
        this.ty = (tx1 * sin) + (this.ty * cos);

        return this;
    }

    /**
     * Appends the transformations in the given matrix to this one.
     *
     * @param {PIXI.Matrix} matrix - the matrix to append.
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    append(matrix: Matrix): this
    {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;

        this.a = (matrix.a * a1) + (matrix.b * c1);
        this.b = (matrix.a * b1) + (matrix.b * d1);
        this.c = (matrix.c * a1) + (matrix.d * c1);
        this.d = (matrix.c * b1) + (matrix.d * d1);

        this.tx = (matrix.tx * a1) + (matrix.ty * c1) + this.tx;
        this.ty = (matrix.tx * b1) + (matrix.ty * d1) + this.ty;

        return this;
    }

    /**
     * Sets the transformation based on all the given properties
     *
     * @param {number} x - Position on the x axis
     * @param {number} y - Position on the y axis
     * @param {number} pivotX - Pivot on the x axis
     * @param {number} pivotY - Pivot on the y axis
     * @param {number} scaleX - Scale on the x axis
     * @param {number} scaleY - Scale on the y axis
     * @param {number} rotation - Rotation in radians
     * @param {number} skewX - Skew on the x axis
     * @param {number} skewY - Skew on the y axis
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number,
        scaleY: number, rotation: number, skewX: number, skewY: number): this
    {
        this.a = Math.cos(rotation + skewY) * scaleX;
        this.b = Math.sin(rotation + skewY) * scaleX;
        this.c = -Math.sin(rotation - skewX) * scaleY;
        this.d = Math.cos(rotation - skewX) * scaleY;

        this.tx = x - ((pivotX * this.a) + (pivotY * this.c));
        this.ty = y - ((pivotX * this.b) + (pivotY * this.d));

        return this;
    }

    /**
     * Prepends the transformation in the given matrix to this one. This is the
     * equivalent of appending this matrix to the given one.
     *
     * @param {PIXI.Matrix} matrix - the matrix to prepend
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    prepend(matrix: Matrix): this
    {
        const tx1 = this.tx;

        if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1)
        {
            const a1 = this.a;
            const c1 = this.c;

            this.a = (a1 * matrix.a) + (this.b * matrix.c);
            this.b = (a1 * matrix.b) + (this.b * matrix.d);
            this.c = (c1 * matrix.a) + (this.d * matrix.c);
            this.d = (c1 * matrix.b) + (this.d * matrix.d);
        }

        this.tx = (tx1 * matrix.a) + (this.ty * matrix.c) + matrix.tx;
        this.ty = (tx1 * matrix.b) + (this.ty * matrix.d) + matrix.ty;

        return this;
    }

    /**
     * Decomposes this matrix into its consitituent simple transformations (translation,
     * scale, rotation, and skew) and sets the corresponding properties on a `Transform`
     * object.
     *
     * This does loose the information related to order and multiple simple
     * transformations (a scale, translate, scale will turn into an equivalent translate, scale).
     *
     * @param {PIXI.Transform} transform - the transform to set the properties on
     * @return {PIXI.Transform} the transform with the newly set properties
     */
    decompose(transform: Transform): Transform
    {
        // sort out rotation / skew..
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const d = this.d;

        const skewX = -Math.atan2(-c, d);
        const skewY = Math.atan2(b, a);

        const delta = Math.abs(skewX + skewY);

        if (delta < 0.00001 || Math.abs(PI_2 - delta) < 0.00001)
        {
            transform.rotation = skewY;
            transform.skew.x = transform.skew.y = 0;
        }
        else
        {
            transform.rotation = 0;
            transform.skew.x = skewX;
            transform.skew.y = skewY;
        }

        // next set scale
        transform.scale.x = Math.sqrt((a * a) + (b * b));
        transform.scale.y = Math.sqrt((c * c) + (d * d));

        // next set position
        transform.position.x = this.tx;
        transform.position.y = this.ty;

        return transform;
    }

    /**
     * Inverts this matrix. It will map 2D points from the destination reference frame
     * of this matrix to the source reference frame of this matrix.
     *
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    invert(): this
    {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;
        const tx1 = this.tx;
        const n = (a1 * d1) - (b1 * c1);

        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = ((c1 * this.ty) - (d1 * tx1)) / n;
        this.ty = -((a1 * this.ty) - (b1 * tx1)) / n;

        return this;
    }

    /**
     * Resets this Matrix to an identity (default) matrix.
     *
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
     */
    identity(): this
    {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;

        return this;
    }

    /**
     * Create a new `Matrix` object with the same values as this one.
     *
     * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
     */
    clone(): Matrix
    {
        const matrix = new Matrix();

        matrix.a = this.a;
        matrix.b = this.b;
        matrix.c = this.c;
        matrix.d = this.d;
        matrix.tx = this.tx;
        matrix.ty = this.ty;

        return matrix;
    }

    /**
     * Changes the values of the given matrix to be the same as the ones in this matrix.
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy to.
     * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
     */
    copyTo(matrix: Matrix): Matrix
    {
        matrix.a = this.a;
        matrix.b = this.b;
        matrix.c = this.c;
        matrix.d = this.d;
        matrix.tx = this.tx;
        matrix.ty = this.ty;

        return matrix;
    }

    /**
     * Changes the values of the matrix to be the same as the ones in given matrix.
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy from.
     * @return {PIXI.Matrix} this
     */
    copyFrom(matrix: Matrix): this
    {
        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;

        return this;
    }

    /**
     * A default (identity) matrix. The identity matrix will map a 2D point to itself.
     *
     * @static
     * @const
     * @member {PIXI.Matrix}
     */
    static get IDENTITY(): Matrix
    {
        return new Matrix();
    }

    /**
     * A temporary matrix.
     *
     * @static
     * @const
     * @member {PIXI.Matrix}
     */
    static get TEMP_MATRIX(): Matrix
    {
        return new Matrix();
    }
}
