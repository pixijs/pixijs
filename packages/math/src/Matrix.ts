import { Point } from './Point';
import { PI_2 } from './const';

import type { Transform } from './Transform';
import type { IPointData } from './IPointData';

/**
 * This class implements fast operations for transform matrix.
 *
 * A Matrix instance is represented as:
 * ```js
 * | a | c | tx|
 * | b | d | ty|
 * | 0 | 0 | 1 |
 * ```
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
     * @param {number} [b=0] - y skew
     * @param {number} [c=0] - x skew
     * @param {number} [d=1] - y scale
     * @param {number} [tx=0] - x translation
     * @param {number} [ty=0] - y translation
     */
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0)
    {
        this.set(a, b, c, d, tx, ty);
    }

    /**
     * Updates this Matrix based on given array; component mapping order:
     *
     * a = array[0]
     * b = array[1]
     * c = array[3]
     * d = array[4]
     * tx = array[2]
     * ty = array[5]
     *
     * @param {number[]} array - The array which this Matrix will be populated from.
     */
    fromArray(array: number[]): void
    {
        this.set(
        /* A */array[0],
        /* B */array[1],
        /* C */array[3],
        /* D */array[4],
        /* TX */array[2],
        /* TY */array[5],
        );
    }

    /**
     * Updates this Matrix with given component values.
     *
     * @param {number} a - Matrix component
     * @param {number} b - Matrix component
     * @param {number} c - Matrix component
     * @param {number} d - Matrix component
     * @param {number} tx - Matrix component
     * @param {number} ty - Matrix component
     *
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    set(a: number, b: number, c: number, d: number, tx: number, ty: number): this
    {
        return this.assign([a, b, c, d, tx, ty]);
    }

    /**
     * Creates an array with data from this Matrix.
     *
     * @param {boolean} transpose - Whether we need to transpose the matrix or not
     * @param {Float32Array} [out=new Float32Array(9)] - If provided the array will be assigned to out
     * @return {number[]} Newly created array containing data from this Matrix
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
     * Get a new position with the current transformation applied.
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     *
     * @param {PIXI.IPointData} pos - The origin point
     * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @return {PIXI.Point} The new Point, transformed through this Matrix
     */
    apply<P extends IPointData = Point>(pos: IPointData, newPos?: P): P
    {
        newPos = (newPos || new Point()) as P;

        const { x, y } = pos;

        newPos.x = (this.a * x) + (this.c * y) + this.tx;
        newPos.y = (this.b * x) + (this.d * y) + this.ty;

        return newPos;
    }

    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     *
     * @param {PIXI.IPointData} pos - The origin
     * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
     * @return {PIXI.Point} The new Point, inverse-transformed through this Matrix
     */
    applyInverse<P extends IPointData = Point>(pos: IPointData, newPos?: P): P
    {
        newPos = (newPos || new Point()) as P;

        const id = 1 / ((this.a * this.d) + (this.c * -this.b));

        const { x, y } = pos;

        newPos.x = (this.d * id * x) + (-this.c * id * y) + (((this.ty * this.c) - (this.tx * this.d)) * id);
        newPos.y = (this.a * id * y) + (-this.b * id * x) + (((-this.ty * this.a) + (this.tx * this.b)) * id);

        return newPos;
    }

    /**
     * Translates this Matrix along X and Y.
     *
     * @param {number} x - How much to translate horizontally
     * @param {number} y - How much to translate vertically
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    translate(x: number, y: number): this
    {
        this.tx += x;
        this.ty += y;

        return this;
    }

    /**
     * Applies a scale transformation to this Matrix.
     *
     * @param {number} x - How much to scale horizontally
     * @param {number} y - How much to scale vertically
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
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
     * Applies a rotation transform to this Matrix.
     *
     * @param {number} angle - The angle in radians.
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    rotate(angle: number): this
    {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const a1 = this.a;
        const c1 = this.c;
        const tx1 = this.tx;

        return this.set(
        /* A */(a1 * cos) - (this.b * sin),
        /* B */(a1 * sin) + (this.b * cos),
        /* C */(c1 * cos) - (this.d * sin),
        /* D */(c1 * sin) + (this.d * cos),
        /* TX */(tx1 * cos) - (this.ty * sin),
        /* TY */(tx1 * sin) + (this.ty * cos),
        );
    }

    /**
     * Appends given Matrix to this Matrix.
     *
     * @param {PIXI.Matrix} matrix - The Matrix to append.
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    append(matrix: Matrix): this
    {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;

        return this.set(
        /* A */(matrix.a * a1) + (matrix.b * c1),
        /* B */(matrix.a * b1) + (matrix.b * d1),
        /* C */(matrix.c * a1) + (matrix.d * c1),
        /* D */(matrix.c * b1) + (matrix.d * d1),

        /* TX */(matrix.tx * a1) + (matrix.ty * c1) + this.tx,
        /* TY */(matrix.tx * b1) + (matrix.ty * d1) + this.ty,
        );
    }

    /**
     * Updates this Matrix based on given properties.
     *
     * @param {number} x - Position on the X axis
     * @param {number} y - Position on the Y axis
     * @param {number} pivotX - Pivot on the X axis
     * @param {number} pivotY - Pivot on the Y axis
     * @param {number} scaleX - Scale on the X axis
     * @param {number} scaleY - Scale on the Y axis
     * @param {number} rotation - Rotation in radians
     * @param {number} skewX - Skew on the X axis
     * @param {number} skewY - Skew on the Y axis
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    setTransform(x: number, y: number, pivotX: number, pivotY: number, scaleX: number,
        scaleY: number, rotation: number, skewX: number, skewY: number): this
    {
        return this.set(
        /* A */Math.cos(rotation + skewY) * scaleX,
        /* B */Math.sin(rotation + skewY) * scaleX,
        /* C */-Math.sin(rotation - skewX) * scaleY,
        /* D */Math.cos(rotation - skewX) * scaleY,

        /* TX */x - ((pivotX * this.a) + (pivotY * this.c)),
        /* TY */y - ((pivotX * this.b) + (pivotY * this.d)),
        );
    }

    /**
     * Prepends given Matrix to this Matrix.
     *
     * @param {PIXI.Matrix} matrix - The matrix to prepend
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
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
     * Decomposes this Matrix (x, y, scaleX, scaleY, and rotation) into given Transform.
     *
     * @param {PIXI.Transform} transform - The Transform to apply the properties to.
     * @return {PIXI.Transform} The Transform with the newly applied properties
     */
    decompose(transform: Transform): Transform
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
     * Inverts this Matrix.
     *
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    invert(): this
    {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;
        const tx1 = this.tx;
        const n = (a1 * d1) - (b1 * c1);

        return this.set(
        /* A */d1 / n,
        /* B */-b1 / n,
        /* C */-c1 / n,
        /* D */a1 / n,
        /* TX */((c1 * this.ty) - (d1 * tx1)) / n,
        /* TY */-((a1 * this.ty) - (b1 * tx1)) / n,
        );
    }

    /**
     * Resets this Matrix to an identity (default) matrix.
     *
     * @return {PIXI.Matrix} This matrix. Good for chaining method calls
     */
    identity(): this
    {
        return this.set(
        /* A */1,
        /* B */0,
        /* C */0,
        /* D */1,
        /* TX */0,
        /* TY */0,
        );
    }

    /**
     * A new array with the values of this Matrix instance.
     *
     * @return {number[]} newly created array with the matrix values
     */
    get raw(): number[]
    {
        return [this.a, this.b, this.c, this.d, this.tx, this.ty];
    }

    /**
     * Assigns all components of this Matrix with elements of given array, in order.
     *
     * @param {number[]} array - The array which this Matrix will be assigned from.
     *
     * @return {PIXI.Matrix} This Matrix. Good for chaining method calls
     */
    assign(array: number[]): this
    {
        [
            this.a,
            this.b,
            this.c,
            this.d,
            this.tx,
            this.ty,
        ] = array;

        return this;
    }

    /**
     * Creates a new Matrix object with the same values as this one.
     *
     * @return {PIXI.Matrix} A copy of this matrix.
     */
    clone(): Matrix
    {
        return Matrix.assemble(this.raw);
    }

    /**
     * Changes the values of the given matrix to be the same as the ones in this matrix
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy to.
     * @return {PIXI.Matrix} The matrix given as parameter with its values updated.
     */
    copyTo(matrix: Matrix): Matrix
    {
        return matrix.assign(this.raw);
    }

    /**
     * Changes the values of the matrix to be the same as the ones in given matrix
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy from.
     * @return {PIXI.Matrix} this
     */
    copyFrom(matrix: Matrix): this
    {
        return this.assign(matrix.raw);
    }

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:Matrix a=${this.a} b=${this.b} c=${this.c} d=${this.d} tx=${this.tx} ty=${this.ty}]`;
    }
    // #endif

    /**
     * Creates new Matrix from given array.
     *
     * @param {number[]} array - The array which the new Matrix will be populated from.
     */
    static assemble(array: number[]): Matrix
    {
        const [
            A,
            B,
            C,
            D,
            TX,
            TY,
        ] = array;

        return new Matrix(
            A,
            B,
            C,
            D,
            TX,
            TY,            
        );
    }

    /**
     * A default (identity) Matrix
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
     * A temporary Matrix
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
