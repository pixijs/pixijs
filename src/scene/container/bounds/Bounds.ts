import { Matrix } from '../../../maths/matrix/Matrix';
import { Rectangle } from '../../../maths/shapes/Rectangle';

/**
 * A simple axis-aligned bounding box (AABB) data structure used to define rectangular boundaries.
 * Provides a clearer alternative to array-based bounds representation [minX, minY, maxX, maxY].
 * @example
 * ```ts
 * // Create bounds data
 * const bounds: BoundsData = {
 *     minX: 0,
 *     minY: 0,
 *     maxX: 100,
 *     maxY: 100
 * };
 *
 * // Calculate dimensions
 * const width = bounds.maxX - bounds.minX;
 * const height = bounds.maxY - bounds.minY;
 *
 * // Check if point is inside
 * const isInside = (x: number, y: number) =>
 *     x >= bounds.minX && x <= bounds.maxX &&
 *     y >= bounds.minY && y <= bounds.maxY;
 * ```
 * @see {@link Bounds} For full bounds implementation
 * @see {@link Container#getBounds} For getting bounds
 * @category rendering
 * @standard
 */
export interface BoundsData
{
    /** The minimum X coordinate of the bounds */
    minX: number;
    /** The minimum Y coordinate of the bounds */
    minY: number;
    /** The maximum X coordinate of the bounds */
    maxX: number;
    /** The maximum Y coordinate of the bounds */
    maxY: number;
}

const defaultMatrix = new Matrix();

// TODO optimisations
// 1 - get rectangle could use a dirty flag, rather than setting the data each time is called
// 2- getFrame ALWAYS assumes a matrix, could be optimised to avoid the matrix calculation if not needed

/**
 * A representation of an axis-aligned bounding box (AABB) used for efficient collision detection and culling.
 * Stores minimum and maximum coordinates to define a rectangular boundary.
 * @example
 * ```ts
 * // Create bounds
 * const bounds = new Bounds();
 *
 * // Add a rectangular frame
 * bounds.addFrame(0, 0, 100, 100);
 * console.log(bounds.width, bounds.height); // 100, 100
 *
 * // Transform bounds
 * const matrix = new Matrix()
 *     .translate(50, 50)
 *     .rotate(Math.PI / 4);
 * bounds.applyMatrix(matrix);
 *
 * // Check point intersection
 * if (bounds.containsPoint(75, 75)) {
 *     console.log('Point is inside bounds!');
 * }
 * ```
 * @category rendering
 * @standard
 */
export class Bounds
{
    /**
     * The minimum X coordinate of the bounds.
     * Represents the leftmost edge of the bounding box.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * // Set left edge
     * bounds.minX = 100;
     * ```
     * @default Infinity
     */
    public minX = Infinity;

    /**
     * The minimum Y coordinate of the bounds.
     * Represents the topmost edge of the bounding box.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * // Set top edge
     * bounds.minY = 100;
     * ```
     * @default Infinity
     */
    public minY = Infinity;

    /**
     * The maximum X coordinate of the bounds.
     * Represents the rightmost edge of the bounding box.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * // Set right edge
     * bounds.maxX = 200;
     * // Get width
     * const width = bounds.maxX - bounds.minX;
     * ```
     * @default -Infinity
     */
    public maxX = -Infinity;

    /**
     * The maximum Y coordinate of the bounds.
     * Represents the bottommost edge of the bounding box.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * // Set bottom edge
     * bounds.maxY = 200;
     * // Get height
     * const height = bounds.maxY - bounds.minY;
     * ```
     * @default -Infinity
     */
    public maxY = -Infinity;

    /**
     * The transformation matrix applied to this bounds object.
     * Used when calculating bounds with transforms.
     * @example
     * ```ts
     * const bounds = new Bounds();
     *
     * // Apply translation matrix
     * bounds.matrix = new Matrix()
     *     .translate(100, 100);
     *
     * // Combine transformations
     * bounds.matrix = new Matrix()
     *     .translate(50, 50)
     *     .rotate(Math.PI / 4)
     *     .scale(2, 2);
     *
     * // Use in bounds calculations
     * bounds.addFrame(0, 0, 100, 100); // Uses current matrix
     * bounds.addFrame(0, 0, 100, 100, customMatrix); // Override matrix
     * ```
     * @advanced
     */
    public matrix = defaultMatrix;

    private _rectangle: Rectangle;

    /**
     * Creates a new Bounds object.
     * @param minX - The minimum X coordinate of the bounds.
     * @param minY - The minimum Y coordinate of the bounds.
     * @param maxX - The maximum X coordinate of the bounds.
     * @param maxY - The maximum Y coordinate of the bounds.
     */
    constructor(minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity)
    {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    /**
     * Checks if bounds are empty, meaning either width or height is zero or negative.
     * Empty bounds occur when min values exceed max values on either axis.
     * @example
     * ```ts
     * const bounds = new Bounds();
     *
     * // Check if newly created bounds are empty
     * console.log(bounds.isEmpty()); // true, default bounds are empty
     *
     * // Add frame and check again
     * bounds.addFrame(0, 0, 100, 100);
     * console.log(bounds.isEmpty()); // false, bounds now have area
     *
     * // Clear bounds
     * bounds.clear();
     * console.log(bounds.isEmpty()); // true, bounds are empty again
     * ```
     * @returns True if bounds are empty (have no area)
     * @see {@link Bounds#clear} For resetting bounds
     * @see {@link Bounds#isValid} For checking validity
     */
    public isEmpty(): boolean
    {
        return this.minX > this.maxX || this.minY > this.maxY;
    }

    /**
     * The bounding rectangle representation of these bounds.
     * Lazily creates and updates a Rectangle instance based on the current bounds.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     *
     * // Get rectangle representation
     * const rect = bounds.rectangle;
     * console.log(rect.x, rect.y, rect.width, rect.height);
     *
     * // Use for hit testing
     * if (bounds.rectangle.contains(mouseX, mouseY)) {
     *     console.log('Mouse is inside bounds!');
     * }
     * ```
     * @see {@link Rectangle} For rectangle methods
     * @see {@link Bounds.isEmpty} For bounds validation
     */
    get rectangle(): Rectangle
    {
        if (!this._rectangle)
        {
            this._rectangle = new Rectangle();
        }

        const rectangle = this._rectangle;

        if (this.minX > this.maxX || this.minY > this.maxY)
        {
            rectangle.x = 0;
            rectangle.y = 0;
            rectangle.width = 0;
            rectangle.height = 0;
        }
        else
        {
            rectangle.copyFromBounds(this);
        }

        return rectangle;
    }

    /**
     * Clears the bounds and resets all coordinates to their default values.
     * Resets the transformation matrix back to identity.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * console.log(bounds.isEmpty()); // false
     * // Clear the bounds
     * bounds.clear();
     * console.log(bounds.isEmpty()); // true
     * ```
     * @returns This bounds object for chaining
     */
    public clear(): this
    {
        this.minX = Infinity;
        this.minY = Infinity;
        this.maxX = -Infinity;
        this.maxY = -Infinity;

        this.matrix = defaultMatrix;

        return this;
    }

    /**
     * Sets the bounds directly using coordinate values.
     * Provides a way to set all bounds values at once.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * bounds.set(0, 0, 100, 100);
     * ```
     * @param x0 - Left X coordinate of frame
     * @param y0 - Top Y coordinate of frame
     * @param x1 - Right X coordinate of frame
     * @param y1 - Bottom Y coordinate of frame
     * @see {@link Bounds#addFrame} For matrix-aware bounds setting
     * @see {@link Bounds#clear} For resetting bounds
     */
    public set(x0: number, y0: number, x1: number, y1: number)
    {
        this.minX = x0;
        this.minY = y0;
        this.maxX = x1;
        this.maxY = y1;
    }

    /**
     * Adds a rectangular frame to the bounds, optionally transformed by a matrix.
     * Updates the bounds to encompass the new frame coordinates.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * bounds.addFrame(0, 0, 100, 100);
     *
     * // Add transformed frame
     * const matrix = new Matrix()
     *     .translate(50, 50)
     *     .rotate(Math.PI / 4);
     * bounds.addFrame(0, 0, 100, 100, matrix);
     * ```
     * @param x0 - Left X coordinate of frame
     * @param y0 - Top Y coordinate of frame
     * @param x1 - Right X coordinate of frame
     * @param y1 - Bottom Y coordinate of frame
     * @param matrix - Optional transformation matrix
     * @see {@link Bounds#addRect} For adding Rectangle objects
     * @see {@link Bounds#addBounds} For adding other Bounds
     */
    public addFrame(x0: number, y0: number, x1: number, y1: number, matrix?: Matrix): void
    {
        matrix ||= this.matrix;

        const a = matrix.a;
        const b = matrix.b;
        const c = matrix.c;
        const d = matrix.d;
        const tx = matrix.tx;
        const ty = matrix.ty;

        let minX = this.minX;
        let minY = this.minY;
        let maxX = this.maxX;
        let maxY = this.maxY;

        let x = (a * x0) + (c * y0) + tx;
        let y = (b * x0) + (d * y0) + ty;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;

        x = (a * x1) + (c * y0) + tx;
        y = (b * x1) + (d * y0) + ty;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;

        x = (a * x0) + (c * y1) + tx;
        y = (b * x0) + (d * y1) + ty;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;

        x = (a * x1) + (c * y1) + tx;
        y = (b * x1) + (d * y1) + ty;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    /**
     * Adds a rectangle to the bounds, optionally transformed by a matrix.
     * Updates the bounds to encompass the given rectangle.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * // Add simple rectangle
     * const rect = new Rectangle(0, 0, 100, 100);
     * bounds.addRect(rect);
     *
     * // Add transformed rectangle
     * const matrix = new Matrix()
     *     .translate(50, 50)
     *     .rotate(Math.PI / 4);
     * bounds.addRect(rect, matrix);
     * ```
     * @param rect - The rectangle to be added
     * @param matrix - Optional transformation matrix
     * @see {@link Bounds#addFrame} For adding raw coordinates
     * @see {@link Bounds#addBounds} For adding other bounds
     */
    public addRect(rect: Rectangle, matrix?: Matrix)
    {
        this.addFrame(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height, matrix);
    }

    /**
     * Adds another bounds object to this one, optionally transformed by a matrix.
     * Expands the bounds to include the given bounds' area.
     * @example
     * ```ts
     * const bounds = new Bounds();
     *
     * // Add child bounds
     * const childBounds = sprite.getBounds();
     * bounds.addBounds(childBounds);
     *
     * // Add transformed bounds
     * const matrix = new Matrix()
     *     .scale(2, 2);
     * bounds.addBounds(childBounds, matrix);
     * ```
     * @param bounds - The bounds to be added
     * @param matrix - Optional transformation matrix
     * @see {@link Bounds#addFrame} For adding raw coordinates
     * @see {@link Bounds#addRect} For adding rectangles
     */
    public addBounds(bounds: BoundsData, matrix?: Matrix)
    {
        this.addFrame(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, matrix);
    }

    /**
     * Adds other Bounds as a mask, creating an intersection of the two bounds.
     * Only keeps the overlapping region between current bounds and mask bounds.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Create mask bounds
     * const mask = new Bounds();
     * mask.addFrame(50, 50, 150, 150);
     * // Apply mask - results in bounds of (50,50,100,100)
     * bounds.addBoundsMask(mask);
     * ```
     * @param mask - The Bounds to use as a mask
     * @see {@link Bounds#addBounds} For union operation
     * @see {@link Bounds#fit} For fitting to rectangle
     */
    public addBoundsMask(mask: Bounds): void
    {
        this.minX = this.minX > mask.minX ? this.minX : mask.minX;
        this.minY = this.minY > mask.minY ? this.minY : mask.minY;
        this.maxX = this.maxX < mask.maxX ? this.maxX : mask.maxX;
        this.maxY = this.maxY < mask.maxY ? this.maxY : mask.maxY;
    }

    /**
     * Applies a transformation matrix to the bounds, updating its coordinates.
     * Transforms all corners of the bounds using the given matrix.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Apply translation
     * const translateMatrix = new Matrix()
     *     .translate(50, 50);
     * bounds.applyMatrix(translateMatrix);
     * ```
     * @param matrix - The matrix to apply to the bounds
     * @see {@link Matrix} For matrix operations
     * @see {@link Bounds#addFrame} For adding transformed frames
     */
    public applyMatrix(matrix: Matrix): void
    {
        const minX = this.minX;
        const minY = this.minY;
        const maxX = this.maxX;
        const maxY = this.maxY;

        // multiple bounds by matrix
        const { a, b, c, d, tx, ty } = matrix;

        let x = (a * minX) + (c * minY) + tx;
        let y = (b * minX) + (d * minY) + ty;

        this.minX = x;
        this.minY = y;
        this.maxX = x;
        this.maxY = y;

        x = (a * maxX) + (c * minY) + tx;
        y = (b * maxX) + (d * minY) + ty;
        this.minX = x < this.minX ? x : this.minX;
        this.minY = y < this.minY ? y : this.minY;
        this.maxX = x > this.maxX ? x : this.maxX;
        this.maxY = y > this.maxY ? y : this.maxY;

        x = (a * minX) + (c * maxY) + tx;
        y = (b * minX) + (d * maxY) + ty;
        this.minX = x < this.minX ? x : this.minX;
        this.minY = y < this.minY ? y : this.minY;
        this.maxX = x > this.maxX ? x : this.maxX;
        this.maxY = y > this.maxY ? y : this.maxY;

        x = (a * maxX) + (c * maxY) + tx;
        y = (b * maxX) + (d * maxY) + ty;
        this.minX = x < this.minX ? x : this.minX;
        this.minY = y < this.minY ? y : this.minY;
        this.maxX = x > this.maxX ? x : this.maxX;
        this.maxY = y > this.maxY ? y : this.maxY;
    }

    /**
     * Resizes the bounds object to fit within the given rectangle.
     * Clips the bounds if they extend beyond the rectangle's edges.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 200, 200);
     * // Fit within viewport
     * const viewport = new Rectangle(50, 50, 100, 100);
     * bounds.fit(viewport);
     * // bounds are now (50, 50, 150, 150)
     * ```
     * @param rect - The rectangle to fit within
     * @returns This bounds object for chaining
     * @see {@link Bounds#addBoundsMask} For intersection
     * @see {@link Bounds#pad} For expanding bounds
     */
    public fit(rect: Rectangle): this
    {
        if (this.minX < rect.left) this.minX = rect.left;
        if (this.maxX > rect.right) this.maxX = rect.right;

        if (this.minY < rect.top) this.minY = rect.top;
        if (this.maxY > rect.bottom) this.maxY = rect.bottom;

        return this;
    }

    /**
     * Resizes the bounds object to include the given bounds.
     * Similar to fit() but works with raw coordinate values instead of a Rectangle.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 200, 200);
     * // Fit to specific coordinates
     * bounds.fitBounds(50, 150, 50, 150);
     * // bounds are now (50, 50, 150, 150)
     * ```
     * @param left - The left value of the bounds
     * @param right - The right value of the bounds
     * @param top - The top value of the bounds
     * @param bottom - The bottom value of the bounds
     * @returns This bounds object for chaining
     * @see {@link Bounds#fit} For fitting to Rectangle
     * @see {@link Bounds#addBoundsMask} For intersection
     */
    public fitBounds(left: number, right: number, top: number, bottom: number): this
    {
        if (this.minX < left) this.minX = left;
        if (this.maxX > right) this.maxX = right;

        if (this.minY < top) this.minY = top;
        if (this.maxY > bottom) this.maxY = bottom;

        return this;
    }

    /**
     * Pads bounds object, making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     *
     * // Add equal padding
     * bounds.pad(10);
     * // bounds are now (-10, -10, 110, 110)
     *
     * // Add different padding for x and y
     * bounds.pad(20, 10);
     * // bounds are now (-30, -20, 130, 120)
     * ```
     * @param paddingX - The horizontal padding amount
     * @param paddingY - The vertical padding amount
     * @returns This bounds object for chaining
     * @see {@link Bounds#fit} For constraining bounds
     * @see {@link Bounds#scale} For uniform scaling
     */
    public pad(paddingX: number, paddingY: number = paddingX): this
    {
        this.minX -= paddingX;
        this.maxX += paddingX;

        this.minY -= paddingY;
        this.maxY += paddingY;

        return this;
    }

    /**
     * Ceils the bounds by rounding up max values and rounding down min values.
     * Useful for pixel-perfect calculations and avoiding fractional pixels.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * bounds.set(10.2, 10.9, 50.1, 50.8);
     *
     * // Round to whole pixels
     * bounds.ceil();
     * // bounds are now (10, 10, 51, 51)
     * ```
     * @returns This bounds object for chaining
     * @see {@link Bounds#scale} For size adjustments
     * @see {@link Bounds#fit} For constraining bounds
     */
    public ceil(): this
    {
        this.minX = Math.floor(this.minX);
        this.minY = Math.floor(this.minY);
        this.maxX = Math.ceil(this.maxX);
        this.maxY = Math.ceil(this.maxY);

        return this;
    }

    /**
     * Creates a new Bounds instance with the same values.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     *
     * // Create a copy
     * const copy = bounds.clone();
     *
     * // Original and copy are independent
     * bounds.pad(10);
     * console.log(copy.width === bounds.width); // false
     * ```
     * @returns A new Bounds instance with the same values
     * @see {@link Bounds#copyFrom} For reusing existing bounds
     */
    public clone(): Bounds
    {
        return new Bounds(this.minX, this.minY, this.maxX, this.maxY);
    }

    /**
     * Scales the bounds by the given values, adjusting all edges proportionally.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     *
     * // Scale uniformly
     * bounds.scale(2);
     * // bounds are now (0, 0, 200, 200)
     *
     * // Scale non-uniformly
     * bounds.scale(0.5, 2);
     * // bounds are now (0, 0, 100, 400)
     * ```
     * @param x - The X value to scale by
     * @param y - The Y value to scale by (defaults to x)
     * @returns This bounds object for chaining
     * @see {@link Bounds#pad} For adding padding
     * @see {@link Bounds#fit} For constraining size
     */
    public scale(x: number, y: number = x): this
    {
        this.minX *= x;
        this.minY *= y;
        this.maxX *= x;
        this.maxY *= y;

        return this;
    }

    /**
     * The x position of the bounds in local space.
     * Setting this value will move the bounds while maintaining its width.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Get x position
     * console.log(bounds.x); // 0
     *
     * // Move bounds horizontally
     * bounds.x = 50;
     * console.log(bounds.minX, bounds.maxX); // 50, 150
     *
     * // Width stays the same
     * console.log(bounds.width); // Still 100
     * ```
     */
    get x(): number
    {
        return this.minX;
    }
    set x(value: number)
    {
        const width = this.maxX - this.minX;

        this.minX = value;
        this.maxX = value + width;
    }

    /**
     * The y position of the bounds in local space.
     * Setting this value will move the bounds while maintaining its height.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Get y position
     * console.log(bounds.y); // 0
     *
     * // Move bounds vertically
     * bounds.y = 50;
     * console.log(bounds.minY, bounds.maxY); // 50, 150
     *
     * // Height stays the same
     * console.log(bounds.height); // Still 100
     * ```
     */
    get y(): number
    {
        return this.minY;
    }

    set y(value: number)
    {
        const height = this.maxY - this.minY;

        this.minY = value;
        this.maxY = value + height;
    }

    /**
     * The width value of the bounds.
     * Represents the distance between minX and maxX coordinates.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Get width
     * console.log(bounds.width); // 100
     * // Resize width
     * bounds.width = 200;
     * console.log(bounds.maxX - bounds.minX); // 200
     * ```
     */
    get width(): number
    {
        return this.maxX - this.minX;
    }

    set width(value: number)
    {
        this.maxX = this.minX + value;
    }

    /**
     * The height value of the bounds.
     * Represents the distance between minY and maxY coordinates.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Get height
     * console.log(bounds.height); // 100
     * // Resize height
     * bounds.height = 150;
     * console.log(bounds.maxY - bounds.minY); // 150
     * ```
     */
    get height(): number
    {
        return this.maxY - this.minY;
    }

    set height(value: number)
    {
        this.maxY = this.minY + value;
    }

    /**
     * The left edge coordinate of the bounds.
     * Alias for minX.
     * @example
     * ```ts
     * const bounds = new Bounds(50, 0, 150, 100);
     * console.log(bounds.left); // 50
     * console.log(bounds.left === bounds.minX); // true
     * ```
     * @readonly
     */
    get left(): number
    {
        return this.minX;
    }

    /**
     * The right edge coordinate of the bounds.
     * Alias for maxX.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * console.log(bounds.right); // 100
     * console.log(bounds.right === bounds.maxX); // true
     * ```
     * @readonly
     */
    get right(): number
    {
        return this.maxX;
    }

    /**
     * The top edge coordinate of the bounds.
     * Alias for minY.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 25, 100, 125);
     * console.log(bounds.top); // 25
     * console.log(bounds.top === bounds.minY); // true
     * ```
     * @readonly
     */
    get top(): number
    {
        return this.minY;
    }

    /**
     * The bottom edge coordinate of the bounds.
     * Alias for maxY.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 200);
     * console.log(bounds.bottom); // 200
     * console.log(bounds.bottom === bounds.maxY); // true
     * ```
     * @readonly
     */
    get bottom(): number
    {
        return this.maxY;
    }

    /**
     * Whether the bounds has positive width and height.
     * Checks if both dimensions are greater than zero.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Check if bounds are positive
     * console.log(bounds.isPositive); // true
     *
     * // Negative bounds
     * bounds.maxX = bounds.minX;
     * console.log(bounds.isPositive); // false, width is 0
     * ```
     * @readonly
     * @see {@link Bounds#isEmpty} For checking empty state
     * @see {@link Bounds#isValid} For checking validity
     */
    get isPositive(): boolean
    {
        return (this.maxX - this.minX > 0) && (this.maxY - this.minY > 0);
    }

    /**
     * Whether the bounds has valid coordinates.
     * Checks if the bounds has been initialized with real values.
     * @example
     * ```ts
     * const bounds = new Bounds();
     * console.log(bounds.isValid); // false, default state
     *
     * // Set valid bounds
     * bounds.addFrame(0, 0, 100, 100);
     * console.log(bounds.isValid); // true
     * ```
     * @readonly
     * @see {@link Bounds#isEmpty} For checking empty state
     * @see {@link Bounds#isPositive} For checking dimensions
     */
    get isValid(): boolean
    {
        return (this.minX + this.minY !== Infinity);
    }

    /**
     * Adds vertices from a Float32Array to the bounds, optionally transformed by a matrix.
     * Used for efficiently updating bounds from raw vertex data.
     * @example
     * ```ts
     * const bounds = new Bounds();
     *
     * // Add vertices from geometry
     * const vertices = new Float32Array([
     *     0, 0,    // Vertex 1
     *     100, 0,  // Vertex 2
     *     100, 100 // Vertex 3
     * ]);
     * bounds.addVertexData(vertices, 0, 6);
     *
     * // Add transformed vertices
     * const matrix = new Matrix()
     *     .translate(50, 50)
     *     .rotate(Math.PI / 4);
     * bounds.addVertexData(vertices, 0, 6, matrix);
     *
     * // Add subset of vertices
     * bounds.addVertexData(vertices, 2, 4); // Only second vertex
     * ```
     * @param vertexData - The array of vertices to add
     * @param beginOffset - Starting index in the vertex array
     * @param endOffset - Ending index in the vertex array (excluded)
     * @param matrix - Optional transformation matrix
     * @see {@link Bounds#addFrame} For adding rectangular frames
     * @see {@link Matrix} For transformation details
     */
    public addVertexData(vertexData: Float32Array, beginOffset: number, endOffset: number, matrix?: Matrix): void
    {
        let minX = this.minX;
        let minY = this.minY;
        let maxX = this.maxX;
        let maxY = this.maxY;

        matrix ||= this.matrix;

        const a = matrix.a;
        const b = matrix.b;
        const c = matrix.c;
        const d = matrix.d;
        const tx = matrix.tx;
        const ty = matrix.ty;

        for (let i = beginOffset; i < endOffset; i += 2)
        {
            const localX = vertexData[i];
            const localY = vertexData[i + 1];

            const x = (a * localX) + (c * localY) + tx;
            const y = (b * localX) + (d * localY) + ty;

            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;
            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
        }

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    /**
     * Checks if a point is contained within the bounds.
     * Returns true if the point's coordinates fall within the bounds' area.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * // Basic point check
     * console.log(bounds.containsPoint(50, 50)); // true
     * console.log(bounds.containsPoint(150, 150)); // false
     *
     * // Check edges
     * console.log(bounds.containsPoint(0, 0));   // true, includes edges
     * console.log(bounds.containsPoint(100, 100)); // true, includes edges
     * ```
     * @param x - x coordinate to check
     * @param y - y coordinate to check
     * @returns True if the point is inside the bounds
     * @see {@link Bounds#isPositive} For valid bounds check
     * @see {@link Bounds#rectangle} For Rectangle representation
     */
    public containsPoint(x: number, y: number): boolean
    {
        if (this.minX <= x && this.minY <= y && this.maxX >= x && this.maxY >= y)
        {
            return true;
        }

        return false;
    }

    /**
     * Returns a string representation of the bounds.
     * Useful for debugging and logging bounds information.
     * @example
     * ```ts
     * const bounds = new Bounds(0, 0, 100, 100);
     * console.log(bounds.toString()); // "[pixi.js:Bounds minX=0 minY=0 maxX=100 maxY=100 width=100 height=100]"
     * ```
     * @returns A string describing the bounds
     * @see {@link Bounds#copyFrom} For copying bounds
     * @see {@link Bounds#clone} For creating a new instance
     */
    public toString(): string
    {
        // eslint-disable-next-line max-len
        return `[pixi.js:Bounds minX=${this.minX} minY=${this.minY} maxX=${this.maxX} maxY=${this.maxY} width=${this.width} height=${this.height}]`;
    }

    /**
     * Copies the bounds from another bounds object.
     * Useful for reusing bounds objects and avoiding allocations.
     * @example
     * ```ts
     * const sourceBounds = new Bounds(0, 0, 100, 100);
     * // Copy bounds
     * const targetBounds = new Bounds();
     * targetBounds.copyFrom(sourceBounds);
     * ```
     * @param bounds - The bounds to copy from
     * @returns This bounds object for chaining
     * @see {@link Bounds#clone} For creating new instances
     */
    public copyFrom(bounds: Bounds): this
    {
        this.minX = bounds.minX;
        this.minY = bounds.minY;
        this.maxX = bounds.maxX;
        this.maxY = bounds.maxY;

        return this;
    }
}

