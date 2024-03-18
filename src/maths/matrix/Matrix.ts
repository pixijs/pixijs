/* eslint-disable @typescript-eslint/no-use-before-define */
import { PI_2 } from '../misc/const';
import { Point } from '../point/Point';

import type { PointData } from '../point/PointData';

interface TransformableObject
{
    position: PointData;
    scale: PointData;
    pivot: PointData;
    skew: PointData;
    rotation: number;
}

/**
 * A fast matrix for 2D transformations.
 * ```js
 * | a | c | tx|
 * | b | d | ty|
 * | 0 | 0 | 1 |
 * ```
 * @memberof maths
 */
export class Matrix
{
    /** @default 1 */
    public a: number;

    /** @default 0 */
    public b: number;

    /** @default 0 */
    public c: number;

    /** @default 1 */
    public d: number;

    /** @default 0 */
    public tx: number;

    /** @default 0 */
    public ty: number;

    /** An array of the current matrix. Only populated when `toArray` is called */
    public array: Float32Array | null = null;

    /**
     * @param a - x scale
     * @param b - y skew
     * @param c - x skew
     * @param d - y scale
     * @param tx - x translation
     * @param ty - y translation
     */
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0)
    {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
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
     * @param array - The array that the matrix will be populated from.
     */
    public fromArray(array: number[]): void
    {
        this.a = array[0];
        this.b = array[1];
        this.c = array[3];
        this.d = array[4];
        this.tx = array[2];
        this.ty = array[5];
    }

    /**
     * Sets the matrix properties.
     * @param a - Matrix component
     * @param b - Matrix component
     * @param c - Matrix component
     * @param d - Matrix component
     * @param tx - Matrix component
     * @param ty - Matrix component
     * @returns This matrix. Good for chaining method calls.
     */
    public set(a: number, b: number, c: number, d: number, tx: number, ty: number): this
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
     * Creates an array from the current Matrix object.
     * @param transpose - Whether we need to transpose the matrix or not
     * @param [out=new Float32Array(9)] - If provided the array will be assigned to out
     * @returns The newly created array which contains the matrix
     */
    public toArray(transpose?: boolean, out?: Float32Array): Float32Array
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
     * Get a new position with the current transformation applied.
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     * @param pos - The origin
     * @param {Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @returns {Point} The new point, transformed through this matrix
     */
    public apply<P extends PointData = Point>(pos: PointData, newPos?: P): P
    {
        newPos = (newPos || new Point()) as P;

        const x = pos.x;
        const y = pos.y;

        newPos.x = (this.a * x) + (this.c * y) + this.tx;
        newPos.y = (this.b * x) + (this.d * y) + this.ty;

        return newPos;
    }

    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     * @param pos - The origin
     * @param {Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @returns {Point} The new point, inverse-transformed through this matrix
     */
    public applyInverse<P extends PointData = Point>(pos: PointData, newPos?: P): P
    {
        newPos = (newPos || new Point()) as P;

        const a = this.a;
        const b = this.b;
        const c = this.c;
        const d = this.d;
        const tx = this.tx;
        const ty = this.ty;

        const id = 1 / ((a * d) + (c * -b));

        const x = pos.x;
        const y = pos.y;

        newPos.x = (d * id * x) + (-c * id * y) + (((ty * c) - (tx * d)) * id);
        newPos.y = (a * id * y) + (-b * id * x) + (((-ty * a) + (tx * b)) * id);

        return newPos;
    }

    /**
     * Translates the matrix on the x and y.
     * @param x - How much to translate x by
     * @param y - How much to translate y by
     * @returns This matrix. Good for chaining method calls.
     */
    public translate(x: number, y: number): this
    {
        this.tx += x;
        this.ty += y;

        return this;
    }

    /**
     * Applies a scale transformation to the matrix.
     * @param x - The amount to scale horizontally
     * @param y - The amount to scale vertically
     * @returns This matrix. Good for chaining method calls.
     */
    public scale(x: number, y: number): this
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
     * Applies a rotation transformation to the matrix.
     * @param angle - The angle in radians.
     * @returns This matrix. Good for chaining method calls.
     */
    public rotate(angle: number): this
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
     * Appends the given Matrix to this Matrix.
     * @param matrix - The matrix to append.
     * @returns This matrix. Good for chaining method calls.
     */
    public append(matrix: Matrix): this
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
     * Appends two matrix's and sets the result to this matrix. AB = A * B
     * @param a - The matrix to append.
     * @param b - The matrix to append.
     * @returns This matrix. Good for chaining method calls.
     */
    public appendFrom(a: Matrix, b: Matrix): this
    {
        const a1 = a.a;
        const b1 = a.b;
        const c1 = a.c;
        const d1 = a.d;
        const tx = a.tx;
        const ty = a.ty;

        const a2 = b.a;
        const b2 = b.b;
        const c2 = b.c;
        const d2 = b.d;

        this.a = (a1 * a2) + (b1 * c2);
        this.b = (a1 * b2) + (b1 * d2);
        this.c = (c1 * a2) + (d1 * c2);
        this.d = (c1 * b2) + (d1 * d2);
        this.tx = (tx * a2) + (ty * c2) + b.tx;
        this.ty = (tx * b2) + (ty * d2) + b.ty;

        return this;
    }

    /**
     * Sets the matrix based on all the available properties
     * @param x - Position on the x axis
     * @param y - Position on the y axis
     * @param pivotX - Pivot on the x axis
     * @param pivotY - Pivot on the y axis
     * @param scaleX - Scale on the x axis
     * @param scaleY - Scale on the y axis
     * @param rotation - Rotation in radians
     * @param skewX - Skew on the x axis
     * @param skewY - Skew on the y axis
     * @returns This matrix. Good for chaining method calls.
     */
    public setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number,
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
     * Prepends the given Matrix to this Matrix.
     * @param matrix - The matrix to prepend
     * @returns This matrix. Good for chaining method calls.
     */
    public prepend(matrix: Matrix): this
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
     * Decomposes the matrix (x, y, scaleX, scaleY, and rotation) and sets the properties on to a transform.
     * @param transform - The transform to apply the properties to.
     * @returns The transform with the newly applied properties
     */
    public decompose(transform: TransformableObject): TransformableObject
    {
        // sort out rotation / skew..
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const d = this.d;
        const pivot = transform.pivot;

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
        transform.position.x = this.tx + ((pivot.x * a) + (pivot.y * c));
        transform.position.y = this.ty + ((pivot.x * b) + (pivot.y * d));

        return transform;
    }

    /**
     * Inverts this matrix
     * @returns This matrix. Good for chaining method calls.
     */
    public invert(): this
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

    /** Checks if this matrix is an identity matrix */
    public isIdentity(): boolean
    {
        return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0;
    }

    /**
     * Resets this Matrix to an identity (default) matrix.
     * @returns This matrix. Good for chaining method calls.
     */
    public identity(): this
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
     * Creates a new Matrix object with the same values as this one.
     * @returns A copy of this matrix. Good for chaining method calls.
     */
    public clone(): Matrix
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
     * Changes the values of the given matrix to be the same as the ones in this matrix
     * @param matrix - The matrix to copy to.
     * @returns The matrix given in parameter with its values updated.
     */
    public copyTo(matrix: Matrix): Matrix
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
     * Changes the values of the matrix to be the same as the ones in given matrix
     * @param matrix - The matrix to copy from.
     * @returns this
     */
    public copyFrom(matrix: Matrix): this
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
     * check to see if two matrices are the same
     * @param matrix - The matrix to compare to.
     */
    public equals(matrix: Matrix)
    {
        return matrix.a === this.a && matrix.b === this.b
            && matrix.c === this.c && matrix.d === this.d
            && matrix.tx === this.tx && matrix.ty === this.ty;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js:Matrix a=${this.a} b=${this.b} c=${this.c} d=${this.d} tx=${this.tx} ty=${this.ty}]`;
    }
    // #endif

    /**
     * A default (identity) matrix.
     *
     * This is a shared object, if you want to modify it consider creating a new `Matrix`
     * @readonly
     */
    static get IDENTITY(): Readonly<Matrix>
    {
        return identityMatrix.identity();
    }

    /**
     * A static Matrix that can be used to avoid creating new objects.
     * Will always ensure the matrix is reset to identity when requested.
     * Use this object for fast but temporary calculations, as it may be mutated later on.
     * This is a different object to the `IDENTITY` object and so can be modified without changing `IDENTITY`.
     * @readonly
     */
    static get shared(): Matrix
    {
        return tempMatrix.identity();
    }
}

const tempMatrix = new Matrix();
const identityMatrix = new Matrix();
