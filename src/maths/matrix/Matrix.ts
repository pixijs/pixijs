/* eslint-disable @typescript-eslint/no-use-before-define */
import { PI_2 } from '../misc/const';
import { Point } from '../point/Point';

import type { PointData } from '../point/PointData';

/**
 * The data structure that contains the position, scale, pivot, skew and rotation of an object.
 * This is used by the {@link Matrix} class to decompose the matrix into its components.
 * @category maths
 * @advanced
 */
export interface TransformableObject
{
    /** The position of the object */
    position: PointData;
    /** The scale of the object */
    scale: PointData;
    /** The pivot of the object */
    pivot: PointData;
    /** The skew of the object */
    skew: PointData;
    /** The rotation of the object */
    rotation: number;
}

/**
 * A fast matrix for 2D transformations.
 * Represents a 3x3 transformation matrix:
 *
 * ```js
 * | a  c  tx |
 * | b  d  ty |
 * | 0  0  1  |
 * ```
 * @example
 * ```ts
 * // Create identity matrix
 * const matrix = new Matrix();
 *
 * // Create matrix with custom values
 * const transform = new Matrix(2, 0, 0, 2, 100, 100); // Scale 2x, translate 100,100
 *
 * // Transform a point
 * const point = { x: 10, y: 20 };
 * const transformed = transform.apply(point);
 *
 * // Chain transformations
 * matrix
 *     .translate(100, 50)
 *     .rotate(Math.PI / 4)
 *     .scale(2, 2);
 * ```
 * @remarks
 * - Used for transform hierarchies
 * - Supports scale, rotation, position
 * - Can be concatenated with append/prepend
 * - Efficient for batched transformations
 * @category maths
 * @standard
 */
export class Matrix
{
    /**
     * Scale on the x axis.
     * @default 1
     */
    public a: number;

    /**
     * Shear on the y axis.
     * @default 0
     */
    public b: number;

    /**
     * Shear on the x axis.
     * @default 0
     */
    public c: number;

    /**
     * Scale on the y axis.
     * @default 1
     */
    public d: number;

    /**
     * Translation on the x axis.
     * @default 0
     */
    public tx: number;

    /**
     * Translation on the y axis.
     * @default 0
     */
    public ty: number;

    /**
     * Array representation of the matrix.
     * Only populated when `toArray()` is called.
     * @default null
     * @see {@link Matrix.toArray} For filling this array
     */
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
     * Creates a Matrix object based on the given array.
     * Populates matrix components from a flat array in column-major order.
     *
     * > [!NOTE] Array mapping order:
     * > ```
     * > array[0] = a  (x scale)
     * > array[1] = b  (y skew)
     * > array[2] = tx (x translation)
     * > array[3] = c  (x skew)
     * > array[4] = d  (y scale)
     * > array[5] = ty (y translation)
     * > ```
     * @example
     * ```ts
     * // Create matrix from array
     * const matrix = new Matrix();
     * matrix.fromArray([
     *     2, 0,  100,  // a, b, tx
     *     0, 2,  100   // c, d, ty
     * ]);
     *
     * // Create matrix from typed array
     * const float32Array = new Float32Array([
     *     1, 0, 0,     // Scale x1, no skew
     *     0, 1, 0      // No skew, scale x1
     * ]);
     * matrix.fromArray(float32Array);
     * ```
     * @param array - The array to populate the matrix from
     * @see {@link Matrix.toArray} For converting matrix to array
     * @see {@link Matrix.set} For setting values directly
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
     * Sets the matrix properties directly.
     * All matrix components can be set in one call.
     * @example
     * ```ts
     * // Set to identity matrix
     * matrix.set(1, 0, 0, 1, 0, 0);
     *
     * // Set to scale matrix
     * matrix.set(2, 0, 0, 2, 0, 0); // Scale 2x
     *
     * // Set to translation matrix
     * matrix.set(1, 0, 0, 1, 100, 50); // Move 100,50
     * ```
     * @param a - Scale on x axis
     * @param b - Shear on y axis
     * @param c - Shear on x axis
     * @param d - Scale on y axis
     * @param tx - Translation on x axis
     * @param ty - Translation on y axis
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.identity} For resetting to identity
     * @see {@link Matrix.fromArray} For setting from array
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
     *
     * > [!NOTE] The array format is:
     * > ```
     * > Non-transposed:
     * > [a, c, tx,
     * > b, d, ty,
     * > 0, 0, 1]
     * >
     * > Transposed:
     * > [a, b, 0,
     * > c, d, 0,
     * > tx,ty,1]
     * > ```
     * @example
     * ```ts
     * // Basic array conversion
     * const matrix = new Matrix(2, 0, 0, 2, 100, 100);
     * const array = matrix.toArray();
     *
     * // Using existing array
     * const float32Array = new Float32Array(9);
     * matrix.toArray(false, float32Array);
     *
     * // Get transposed array
     * const transposed = matrix.toArray(true);
     * ```
     * @param transpose - Whether to transpose the matrix
     * @param out - Optional Float32Array to store the result
     * @returns The array containing the matrix values
     * @see {@link Matrix.fromArray} For creating matrix from array
     * @see {@link Matrix.array} For cached array storage
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
     *
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     * @example
     * ```ts
     * // Basic point transformation
     * const matrix = new Matrix().translate(100, 50).rotate(Math.PI / 4);
     * const point = new Point(10, 20);
     * const transformed = matrix.apply(point);
     *
     * // Reuse existing point
     * const output = new Point();
     * matrix.apply(point, output);
     * ```
     * @param pos - The origin point to transform
     * @param newPos - Optional point to store the result
     * @returns The transformed point
     * @see {@link Matrix.applyInverse} For inverse transformation
     * @see {@link Point} For point operations
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
     *
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     * @example
     * ```ts
     * // Basic inverse transformation
     * const matrix = new Matrix().translate(100, 50).rotate(Math.PI / 4);
     * const worldPoint = new Point(150, 100);
     * const localPoint = matrix.applyInverse(worldPoint);
     *
     * // Reuse existing point
     * const output = new Point();
     * matrix.applyInverse(worldPoint, output);
     *
     * // Convert mouse position to local space
     * const mousePoint = new Point(mouseX, mouseY);
     * const localMouse = matrix.applyInverse(mousePoint);
     * ```
     * @param pos - The origin point to inverse-transform
     * @param newPos - Optional point to store the result
     * @returns The inverse-transformed point
     * @see {@link Matrix.apply} For forward transformation
     * @see {@link Matrix.invert} For getting inverse matrix
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
     * Translates the matrix on the x and y axes.
     * Adds to the position values while preserving scale, rotation and skew.
     * @example
     * ```ts
     * // Basic translation
     * const matrix = new Matrix();
     * matrix.translate(100, 50); // Move right 100, down 50
     *
     * // Chain with other transformations
     * matrix
     *     .scale(2, 2)
     *     .translate(100, 0)
     *     .rotate(Math.PI / 4);
     * ```
     * @param x - How much to translate on the x axis
     * @param y - How much to translate on the y axis
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.set} For setting position directly
     * @see {@link Matrix.setTransform} For complete transform setup
     */
    public translate(x: number, y: number): this
    {
        this.tx += x;
        this.ty += y;

        return this;
    }

    /**
     * Applies a scale transformation to the matrix.
     * Multiplies the scale values with existing matrix components.
     * @example
     * ```ts
     * // Basic scaling
     * const matrix = new Matrix();
     * matrix.scale(2, 3); // Scale 2x horizontally, 3x vertically
     *
     * // Chain with other transformations
     * matrix
     *     .translate(100, 100)
     *     .scale(2, 2)     // Scales after translation
     *     .rotate(Math.PI / 4);
     * ```
     * @param x - The amount to scale horizontally
     * @param y - The amount to scale vertically
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.setTransform} For setting scale directly
     * @see {@link Matrix.append} For combining transformations
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
     *
     * Rotates around the origin (0,0) by the given angle in radians.
     * @example
     * ```ts
     * // Basic rotation
     * const matrix = new Matrix();
     * matrix.rotate(Math.PI / 4); // Rotate 45 degrees
     *
     * // Chain with other transformations
     * matrix
     *     .translate(100, 100) // Move to rotation center
     *     .rotate(Math.PI)     // Rotate 180 degrees
     *     .scale(2, 2);        // Scale after rotation
     *
     * // Common angles
     * matrix.rotate(Math.PI / 2);  // 90 degrees
     * matrix.rotate(Math.PI);      // 180 degrees
     * matrix.rotate(Math.PI * 2);  // 360 degrees
     * ```
     * @remarks
     * - Rotates around origin point (0,0)
     * - Affects position if translation was set
     * - Uses counter-clockwise rotation
     * - Order of operations matters when chaining
     * @param angle - The angle in radians
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.setTransform} For setting rotation directly
     * @see {@link Matrix.append} For combining transformations
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
     * Combines two matrices by multiplying them together: this = this * matrix
     * @example
     * ```ts
     * // Basic matrix combination
     * const matrix = new Matrix();
     * const other = new Matrix().translate(100, 0).rotate(Math.PI / 4);
     * matrix.append(other);
     * ```
     * @remarks
     * - Order matters: A.append(B) !== B.append(A)
     * - Modifies current matrix
     * - Preserves transformation order
     * - Commonly used for combining transforms
     * @param matrix - The matrix to append
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.prepend} For prepending transformations
     * @see {@link Matrix.appendFrom} For appending two external matrices
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
     * Appends two matrices and sets the result to this matrix.
     * Performs matrix multiplication: this = A * B
     * @example
     * ```ts
     * // Basic matrix multiplication
     * const result = new Matrix();
     * const matrixA = new Matrix().scale(2, 2);
     * const matrixB = new Matrix().rotate(Math.PI / 4);
     * result.appendFrom(matrixA, matrixB);
     * ```
     * @remarks
     * - Order matters: A * B !== B * A
     * - Creates a new transformation from two others
     * - More efficient than append() for multiple operations
     * - Does not modify input matrices
     * @param a - The first matrix to multiply
     * @param b - The second matrix to multiply
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.append} For single matrix combination
     * @see {@link Matrix.prepend} For reverse order multiplication
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
     * Sets the matrix based on all the available properties.
     * Combines position, scale, rotation, skew and pivot in a single operation.
     * @example
     * ```ts
     * // Basic transform setup
     * const matrix = new Matrix();
     * matrix.setTransform(
     *     100, 100,    // position
     *     0, 0,        // pivot
     *     2, 2,        // scale
     *     Math.PI / 4, // rotation (45 degrees)
     *     0, 0         // skew
     * );
     * ```
     * @remarks
     * - Updates all matrix components at once
     * - More efficient than separate transform calls
     * - Uses radians for rotation and skew
     * - Pivot affects rotation center
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
     * @see {@link Matrix.decompose} For extracting transform properties
     * @see {@link TransformableObject} For transform data structure
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
     * Combines two matrices by multiplying them together: this = matrix * this
     * @example
     * ```ts
     * // Basic matrix prepend
     * const matrix = new Matrix().scale(2, 2);
     * const other = new Matrix().translate(100, 0);
     * matrix.prepend(other); // Translation happens before scaling
     * ```
     * @remarks
     * - Order matters: A.prepend(B) !== B.prepend(A)
     * - Modifies current matrix
     * - Reverses transformation order compared to append()
     * @param matrix - The matrix to prepend
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.append} For appending transformations
     * @see {@link Matrix.appendFrom} For combining external matrices
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
     * Decomposes the matrix into its individual transform components.
     * Extracts position, scale, rotation and skew values from the matrix.
     * @example
     * ```ts
     * // Basic decomposition
     * const matrix = new Matrix()
     *     .translate(100, 100)
     *     .rotate(Math.PI / 4)
     *     .scale(2, 2);
     *
     * const transform = {
     *     position: new Point(),
     *     scale: new Point(),
     *     pivot: new Point(),
     *     skew: new Point(),
     *     rotation: 0
     * };
     *
     * matrix.decompose(transform);
     * console.log(transform.position); // Point(100, 100)
     * console.log(transform.rotation); // ~0.785 (PI/4)
     * console.log(transform.scale); // Point(2, 2)
     * ```
     * @remarks
     * - Handles combined transformations
     * - Accounts for pivot points
     * - Chooses between rotation/skew based on transform type
     * - Uses radians for rotation and skew
     * @param transform - The transform object to store the decomposed values
     * @returns The transform with the newly applied properties
     * @see {@link Matrix.setTransform} For composing from components
     * @see {@link TransformableObject} For transform structure
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
     * Inverts this matrix.
     * Creates the matrix that when multiplied with this matrix results in an identity matrix.
     * @example
     * ```ts
     * // Basic matrix inversion
     * const matrix = new Matrix()
     *     .translate(100, 50)
     *     .scale(2, 2);
     *
     * matrix.invert(); // Now transforms in opposite direction
     *
     * // Verify inversion
     * const point = new Point(50, 50);
     * const transformed = matrix.apply(point);
     * const original = matrix.invert().apply(transformed);
     * // original ≈ point
     * ```
     * @remarks
     * - Modifies the current matrix
     * - Useful for reversing transformations
     * - Cannot invert matrices with zero determinant
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.identity} For resetting to identity
     * @see {@link Matrix.applyInverse} For inverse transformations
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

    /**
     * Checks if this matrix is an identity matrix.
     *
     * An identity matrix has no transformations applied (default state).
     * @example
     * ```ts
     * // Check if matrix is identity
     * const matrix = new Matrix();
     * console.log(matrix.isIdentity()); // true
     *
     * // Check after transformations
     * matrix.translate(100, 0);
     * console.log(matrix.isIdentity()); // false
     *
     * // Reset and verify
     * matrix.identity();
     * console.log(matrix.isIdentity()); // true
     * ```
     * @remarks
     * - Verifies a = 1, d = 1 (no scale)
     * - Verifies b = 0, c = 0 (no skew)
     * - Verifies tx = 0, ty = 0 (no translation)
     * @returns True if matrix has no transformations
     * @see {@link Matrix.identity} For resetting to identity
     * @see {@link Matrix.IDENTITY} For constant identity matrix
     */
    public isIdentity(): boolean
    {
        return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0;
    }

    /**
     * Resets this Matrix to an identity (default) matrix.
     * Sets all components to their default values: scale=1, no skew, no translation.
     * @example
     * ```ts
     * // Reset transformed matrix
     * const matrix = new Matrix()
     *     .scale(2, 2)
     *     .rotate(Math.PI / 4);
     * matrix.identity(); // Back to default state
     *
     * // Chain after reset
     * matrix
     *     .identity()
     *     .translate(100, 100)
     *     .scale(2, 2);
     *
     * // Compare with identity constant
     * const isDefault = matrix.equals(Matrix.IDENTITY);
     * ```
     * @remarks
     * - Sets a=1, d=1 (default scale)
     * - Sets b=0, c=0 (no skew)
     * - Sets tx=0, ty=0 (no translation)
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.IDENTITY} For constant identity matrix
     * @see {@link Matrix.isIdentity} For checking identity state
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
     * Creates a new Matrix object with the same values as this one.
     * @param matrix
     * @example
     * ```ts
     * // Basic matrix cloning
     * const matrix = new Matrix()
     *     .translate(100, 100)
     *     .rotate(Math.PI / 4);
     * const copy = matrix.clone();
     *
     * // Clone and modify
     * const modified = matrix.clone()
     *     .scale(2, 2);
     *
     * // Compare matrices
     * console.log(matrix.equals(copy));     // true
     * console.log(matrix.equals(modified)); // false
     * ```
     * @returns A copy of this matrix. Good for chaining method calls.
     * @see {@link Matrix.copyTo} For copying to existing matrix
     * @see {@link Matrix.copyFrom} For copying from another matrix
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
     * Changes the values of the matrix to be the same as the ones in given matrix.
     * @example
     * ```ts
     * // Basic matrix copying
     * const source = new Matrix()
     *     .translate(100, 100)
     *     .rotate(Math.PI / 4);
     * const target = new Matrix();
     * target.copyFrom(source);
     * ```
     * @param matrix - The matrix to copy from
     * @returns This matrix. Good for chaining method calls.
     * @see {@link Matrix.clone} For creating new matrix copy
     * @see {@link Matrix.copyTo} For copying to another matrix
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
     * Checks if this matrix equals another matrix.
     * Compares all components for exact equality.
     * @example
     * ```ts
     * // Basic equality check
     * const m1 = new Matrix();
     * const m2 = new Matrix();
     * console.log(m1.equals(m2)); // true
     *
     * // Compare transformed matrices
     * const transform = new Matrix()
     *     .translate(100, 100)
     * const clone = new Matrix()
     *     .scale(2, 2);
     * console.log(transform.equals(clone)); // false
     * ```
     * @param matrix - The matrix to compare to
     * @returns True if matrices are identical
     * @see {@link Matrix.copyFrom} For copying matrix values
     * @see {@link Matrix.isIdentity} For identity comparison
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
     * A default (identity) matrix with no transformations applied.
     *
     * > [!IMPORTANT] This is a shared read-only object. Create a new Matrix if you need to modify it.
     * @example
     * ```ts
     * // Get identity matrix reference
     * const identity = Matrix.IDENTITY;
     * console.log(identity.isIdentity()); // true
     *
     * // Compare with identity
     * const matrix = new Matrix();
     * console.log(matrix.equals(Matrix.IDENTITY)); // true
     *
     * // Create new matrix instead of modifying IDENTITY
     * const transform = new Matrix()
     *     .copyFrom(Matrix.IDENTITY)
     *     .translate(100, 100);
     * ```
     * @readonly
     * @returns A read-only identity matrix
     * @see {@link Matrix.shared} For temporary calculations
     * @see {@link Matrix.identity} For resetting matrices
     */
    static get IDENTITY(): Readonly<Matrix>
    {
        return identityMatrix.identity();
    }

    /**
     * A static Matrix that can be used to avoid creating new objects.
     * Will always ensure the matrix is reset to identity when requested.
     *
     * > [!IMPORTANT] This matrix is shared and temporary. Do not store references to it.
     * @example
     * ```ts
     * // Use for temporary calculations
     * const tempMatrix = Matrix.shared;
     * tempMatrix.translate(100, 100).rotate(Math.PI / 4);
     * const point = tempMatrix.apply({ x: 10, y: 20 });
     *
     * // Will be reset to identity on next access
     * const fresh = Matrix.shared; // Back to identity
     * ```
     * @remarks
     * - Always returns identity matrix
     * - Safe to modify temporarily
     * - Not safe to store references
     * - Useful for one-off calculations
     * @readonly
     * @returns A fresh identity matrix for temporary use
     * @see {@link Matrix.IDENTITY} For immutable identity matrix
     * @see {@link Matrix.identity} For resetting matrices
     */
    static get shared(): Matrix
    {
        return tempMatrix.identity();
    }
}

const tempMatrix = new Matrix();
const identityMatrix = new Matrix();
