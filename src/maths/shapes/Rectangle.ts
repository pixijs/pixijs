// import { SHAPES } from '../const';
import { Point } from '../point/Point';

import type { Bounds } from '../../scene/container/bounds/Bounds';
import type { Matrix } from '../matrix/Matrix';
import type { SHAPE_PRIMITIVE } from '../misc/const';
import type { ShapePrimitive } from './ShapePrimitive';

const tempPoints = [new Point(), new Point(), new Point(), new Point()];

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface Rectangle extends PixiMixins.Rectangle { }

/**
 * The `Rectangle` object represents a rectangular area defined by its position and dimensions.
 * Used for hit testing, bounds calculation, and general geometric operations.
 * @example
 * ```ts
 * // Basic rectangle creation
 * const rect = new Rectangle(100, 100, 200, 150);
 *
 * // Use as container bounds
 * container.hitArea = new Rectangle(0, 0, 100, 100);
 *
 * // Check point containment
 * const isInside = rect.contains(mouseX, mouseY);
 *
 * // Manipulate dimensions
 * rect.width *= 2;
 * rect.height += 50;
 * ```
 * @remarks
 * - Position defined by top-left corner (x,y)
 * - Dimensions defined by width and height
 * - Supports point and rectangle containment
 * - Common in UI and layout calculations
 * @see {@link Circle} For circular shapes
 * @see {@link Polygon} For complex shapes
 * @see {@link RoundedRectangle} For rounded corners
 * @category maths
 * @standard
 */
export class Rectangle implements ShapePrimitive
{
    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @example
     * ```ts
     * // Check shape type
     * const shape = new Rectangle(0, 0, 100, 100);
     * console.log(shape.type); // 'rectangle'
     *
     * // Use in type guards
     * if (shape.type === 'rectangle') {
     *     console.log(shape.width, shape.height);
     * }
     * ```
     * @readonly
     * @default 'rectangle'
     * @see {@link SHAPE_PRIMITIVE} For all shape types
     */
    public readonly type: SHAPE_PRIMITIVE = 'rectangle';

    /**
     * The X coordinate of the upper-left corner of the rectangle
     * @example
     * ```ts
     * // Basic x position
     * const rect = new Rectangle();
     * rect.x = 100;
     * ```
     * @default 0
     */
    public x: number;

    /**
     * The Y coordinate of the upper-left corner of the rectangle
     * @example
     * ```ts
     * // Basic y position
     * const rect = new Rectangle();
     * rect.y = 100;
     * ```
     * @default 0
     */
    public y: number;

    /**
     * The overall width of this rectangle
     * @example
     * ```ts
     * // Basic width setting
     * const rect = new Rectangle();
     * rect.width = 200;
     * ```
     * @default 0
     */
    public width: number;

    /**
     * The overall height of this rectangle
     * @example
     * ```ts
     * // Basic height setting
     * const rect = new Rectangle();
     * rect.height = 150;
     * ```
     * @default 0
     */
    public height: number;

    /**
     * @param x - The X coordinate of the upper-left corner of the rectangle
     * @param y - The Y coordinate of the upper-left corner of the rectangle
     * @param width - The overall width of the rectangle
     * @param height - The overall height of the rectangle
     */
    constructor(x: string | number = 0, y: string | number = 0, width: string | number = 0, height: string | number = 0)
    {
        this.x = Number(x);
        this.y = Number(y);
        this.width = Number(width);
        this.height = Number(height);
    }

    /**
     * Returns the left edge (x-coordinate) of the rectangle.
     * @example
     * ```ts
     * // Get left edge position
     * const rect = new Rectangle(100, 100, 200, 150);
     * console.log(rect.left); // 100
     *
     * // Use in alignment calculations
     * sprite.x = rect.left + padding;
     *
     * // Compare positions
     * if (point.x > rect.left) {
     *     console.log('Point is right of rectangle');
     * }
     * ```
     * @readonly
     * @returns The x-coordinate of the left edge
     * @see {@link Rectangle.right} For right edge position
     * @see {@link Rectangle.x} For direct x-coordinate access
     */
    get left(): number
    {
        return this.x;
    }

    /**
     * Returns the right edge (x + width) of the rectangle.
     * @example
     * ```ts
     * // Get right edge position
     * const rect = new Rectangle(100, 100, 200, 150);
     * console.log(rect.right); // 300
     *
     * // Align to right edge
     * sprite.x = rect.right - sprite.width;
     *
     * // Check boundaries
     * if (point.x < rect.right) {
     *     console.log('Point is inside right bound');
     * }
     * ```
     * @readonly
     * @returns The x-coordinate of the right edge
     * @see {@link Rectangle.left} For left edge position
     * @see {@link Rectangle.width} For width value
     */
    get right(): number
    {
        return this.x + this.width;
    }

    /**
     * Returns the top edge (y-coordinate) of the rectangle.
     * @example
     * ```ts
     * // Get top edge position
     * const rect = new Rectangle(100, 100, 200, 150);
     * console.log(rect.top); // 100
     *
     * // Position above rectangle
     * sprite.y = rect.top - sprite.height;
     *
     * // Check vertical position
     * if (point.y > rect.top) {
     *     console.log('Point is below top edge');
     * }
     * ```
     * @readonly
     * @returns The y-coordinate of the top edge
     * @see {@link Rectangle.bottom} For bottom edge position
     * @see {@link Rectangle.y} For direct y-coordinate access
     */
    get top(): number
    {
        return this.y;
    }

    /**
     * Returns the bottom edge (y + height) of the rectangle.
     * @example
     * ```ts
     * // Get bottom edge position
     * const rect = new Rectangle(100, 100, 200, 150);
     * console.log(rect.bottom); // 250
     *
     * // Stack below rectangle
     * sprite.y = rect.bottom + margin;
     *
     * // Check vertical bounds
     * if (point.y < rect.bottom) {
     *     console.log('Point is above bottom edge');
     * }
     * ```
     * @readonly
     * @returns The y-coordinate of the bottom edge
     * @see {@link Rectangle.top} For top edge position
     * @see {@link Rectangle.height} For height value
     */
    get bottom(): number
    {
        return this.y + this.height;
    }

    /**
     * Determines whether the Rectangle is empty (has no area).
     * @example
     * ```ts
     * // Check zero dimensions
     * const rect = new Rectangle(100, 100, 0, 50);
     * console.log(rect.isEmpty()); // true
     * ```
     * @returns True if the rectangle has no area
     * @see {@link Rectangle.width} For width value
     * @see {@link Rectangle.height} For height value
     */
    public isEmpty(): boolean
    {
        return this.left === this.right || this.top === this.bottom;
    }

    /**
     * A constant empty rectangle. This is a new object every time the property is accessed.
     * @example
     * ```ts
     * // Get fresh empty rectangle
     * const empty = Rectangle.EMPTY;
     * console.log(empty.isEmpty()); // true
     * ```
     * @returns A new empty rectangle instance
     * @see {@link Rectangle.isEmpty} For empty state testing
     */
    static get EMPTY(): Rectangle
    {
        return new Rectangle(0, 0, 0, 0);
    }

    /**
     * Creates a clone of this Rectangle
     * @example
     * ```ts
     * // Basic cloning
     * const original = new Rectangle(100, 100, 200, 150);
     * const copy = original.clone();
     *
     * // Clone and modify
     * const modified = original.clone();
     * modified.width *= 2;
     * modified.height += 50;
     *
     * // Verify independence
     * console.log(original.width);  // 200
     * console.log(modified.width);  // 400
     * ```
     * @returns A copy of the rectangle
     * @see {@link Rectangle.copyFrom} For copying into existing rectangle
     * @see {@link Rectangle.copyTo} For copying to another rectangle
     */
    public clone(): Rectangle
    {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    /**
     * Converts a Bounds object to a Rectangle object.
     * @example
     * ```ts
     * // Convert bounds to rectangle
     * const bounds = container.getBounds();
     * const rect = new Rectangle().copyFromBounds(bounds);
     * ```
     * @param bounds - The bounds to copy and convert to a rectangle
     * @returns Returns itself
     * @see {@link Bounds} For bounds object structure
     * @see {@link Rectangle.getBounds} For getting rectangle bounds
     */
    public copyFromBounds(bounds: Bounds): this
    {
        this.x = bounds.minX;
        this.y = bounds.minY;
        this.width = bounds.maxX - bounds.minX;
        this.height = bounds.maxY - bounds.minY;

        return this;
    }

    /**
     * Copies another rectangle to this one.
     * @example
     * ```ts
     * // Basic copying
     * const source = new Rectangle(100, 100, 200, 150);
     * const target = new Rectangle();
     * target.copyFrom(source);
     *
     * // Chain with other operations
     * const rect = new Rectangle()
     *     .copyFrom(source)
     *     .pad(10);
     * ```
     * @param rectangle - The rectangle to copy from
     * @returns Returns itself
     * @see {@link Rectangle.copyTo} For copying to another rectangle
     * @see {@link Rectangle.clone} For creating new rectangle copy
     */
    public copyFrom(rectangle: Rectangle): Rectangle
    {
        this.x = rectangle.x;
        this.y = rectangle.y;
        this.width = rectangle.width;
        this.height = rectangle.height;

        return this;
    }

    /**
     * Copies this rectangle to another one.
     * @example
     * ```ts
     * // Basic copying
     * const source = new Rectangle(100, 100, 200, 150);
     * const target = new Rectangle();
     * source.copyTo(target);
     *
     * // Chain with other operations
     * const result = source
     *     .copyTo(new Rectangle())
     *     .getBounds();
     * ```
     * @param rectangle - The rectangle to copy to
     * @returns Returns given parameter
     * @see {@link Rectangle.copyFrom} For copying from another rectangle
     * @see {@link Rectangle.clone} For creating new rectangle copy
     */
    public copyTo(rectangle: Rectangle): Rectangle
    {
        rectangle.copyFrom(this);

        return rectangle;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     * @example
     * ```ts
     * // Basic containment check
     * const rect = new Rectangle(100, 100, 200, 150);
     * const isInside = rect.contains(150, 125); // true
     * // Check edge cases
     * console.log(rect.contains(100, 100)); // true (on edge)
     * console.log(rect.contains(300, 250)); // false (outside)
     * ```
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @returns Whether the x/y coordinates are within this Rectangle
     * @see {@link Rectangle.containsRect} For rectangle containment
     * @see {@link Rectangle.strokeContains} For checking stroke intersection
     */
    public contains(x: number, y: number): boolean
    {
        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }

        if (x >= this.x && x < this.x + this.width)
        {
            if (y >= this.y && y < this.y + this.height)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this rectangle including the stroke.
     * @example
     * ```ts
     * // Basic stroke check
     * const rect = new Rectangle(100, 100, 200, 150);
     * const isOnStroke = rect.strokeContains(150, 100, 4); // 4px line width
     *
     * // Check with different alignments
     * const innerStroke = rect.strokeContains(150, 100, 4, 1);   // Inside
     * const centerStroke = rect.strokeContains(150, 100, 4, 0.5); // Centered
     * const outerStroke = rect.strokeContains(150, 100, 4, 0);   // Outside
     * ```
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @param strokeWidth - The width of the line to check
     * @param alignment - The alignment of the stroke (1 = inner, 0.5 = centered, 0 = outer)
     * @returns Whether the x/y coordinates are within this rectangle's stroke
     * @see {@link Rectangle.contains} For checking fill containment
     * @see {@link Rectangle.getBounds} For getting stroke bounds
     */
    public strokeContains(x: number, y: number, strokeWidth: number, alignment: number = 0.5): boolean
    {
        const { width, height } = this;

        if (width <= 0 || height <= 0) return false;

        const _x = this.x;
        const _y = this.y;

        const strokeWidthOuter = strokeWidth * (1 - alignment);
        const strokeWidthInner = strokeWidth - strokeWidthOuter;

        const outerLeft = _x - strokeWidthOuter;
        const outerRight = _x + width + strokeWidthOuter;
        const outerTop = _y - strokeWidthOuter;
        const outerBottom = _y + height + strokeWidthOuter;

        const innerLeft = _x + strokeWidthInner;
        const innerRight = _x + width - strokeWidthInner;
        const innerTop = _y + strokeWidthInner;
        const innerBottom = _y + height - strokeWidthInner;

        return (x >= outerLeft && x <= outerRight && y >= outerTop && y <= outerBottom)
            && !(x > innerLeft && x < innerRight && y > innerTop && y < innerBottom);
    }
    /**
     * Determines whether the `other` Rectangle transformed by `transform` intersects with `this` Rectangle object.
     * Returns true only if the area of the intersection is >0, this means that Rectangles
     * sharing a side are not overlapping. Another side effect is that an arealess rectangle
     * (width or height equal to zero) can't intersect any other rectangle.
     * @param {Rectangle} other - The Rectangle to intersect with `this`.
     * @param {Matrix} transform - The transformation matrix of `other`.
     * @returns {boolean} A value of `true` if the transformed `other` Rectangle intersects with `this`; otherwise `false`.
     */
    /**
     * Determines whether the `other` Rectangle transformed by `transform` intersects with `this` Rectangle object.
     *
     * Returns true only if the area of the intersection is greater than 0.
     * This means that rectangles sharing only a side are not considered intersecting.
     * @example
     * ```ts
     * // Basic intersection check
     * const rect1 = new Rectangle(0, 0, 100, 100);
     * const rect2 = new Rectangle(50, 50, 100, 100);
     * console.log(rect1.intersects(rect2)); // true
     *
     * // With transformation matrix
     * const matrix = new Matrix();
     * matrix.rotate(Math.PI / 4); // 45 degrees
     * console.log(rect1.intersects(rect2, matrix)); // Checks with rotation
     *
     * // Edge cases
     * const zeroWidth = new Rectangle(0, 0, 0, 100);
     * console.log(rect1.intersects(zeroWidth)); // false (no area)
     * ```
     * @remarks
     * - Returns true only if intersection area is > 0
     * - Rectangles sharing only a side are not intersecting
     * - Zero-area rectangles cannot intersect anything
     * - Supports optional transformation matrix
     * @param other - The Rectangle to intersect with `this`
     * @param transform - Optional transformation matrix of `other`
     * @returns True if the transformed `other` Rectangle intersects with `this`
     * @see {@link Rectangle.containsRect} For containment testing
     * @see {@link Rectangle.contains} For point testing
     */
    public intersects(other: Rectangle, transform?: Matrix): boolean
    {
        if (!transform)
        {
            const x0 = this.x < other.x ? other.x : this.x;
            const x1 = this.right > other.right ? other.right : this.right;

            if (x1 <= x0)
            {
                return false;
            }

            const y0 = this.y < other.y ? other.y : this.y;
            const y1 = this.bottom > other.bottom ? other.bottom : this.bottom;

            return y1 > y0;
        }

        const x0 = this.left;
        const x1 = this.right;
        const y0 = this.top;
        const y1 = this.bottom;

        if (x1 <= x0 || y1 <= y0)
        {
            return false;
        }

        const lt = tempPoints[0].set(other.left, other.top);
        const lb = tempPoints[1].set(other.left, other.bottom);
        const rt = tempPoints[2].set(other.right, other.top);
        const rb = tempPoints[3].set(other.right, other.bottom);

        if (rt.x <= lt.x || lb.y <= lt.y)
        {
            return false;
        }

        const s = Math.sign((transform.a * transform.d) - (transform.b * transform.c));

        if (s === 0)
        {
            return false;
        }

        transform.apply(lt, lt);
        transform.apply(lb, lb);
        transform.apply(rt, rt);
        transform.apply(rb, rb);

        if (Math.max(lt.x, lb.x, rt.x, rb.x) <= x0
            || Math.min(lt.x, lb.x, rt.x, rb.x) >= x1
            || Math.max(lt.y, lb.y, rt.y, rb.y) <= y0
            || Math.min(lt.y, lb.y, rt.y, rb.y) >= y1)
        {
            return false;
        }

        const nx = s * (lb.y - lt.y);
        const ny = s * (lt.x - lb.x);
        const n00 = (nx * x0) + (ny * y0);
        const n10 = (nx * x1) + (ny * y0);
        const n01 = (nx * x0) + (ny * y1);
        const n11 = (nx * x1) + (ny * y1);

        if (Math.max(n00, n10, n01, n11) <= (nx * lt.x) + (ny * lt.y)
            || Math.min(n00, n10, n01, n11) >= (nx * rb.x) + (ny * rb.y))
        {
            return false;
        }

        const mx = s * (lt.y - rt.y);
        const my = s * (rt.x - lt.x);
        const m00 = (mx * x0) + (my * y0);
        const m10 = (mx * x1) + (my * y0);
        const m01 = (mx * x0) + (my * y1);
        const m11 = (mx * x1) + (my * y1);

        if (Math.max(m00, m10, m01, m11) <= (mx * lt.x) + (my * lt.y)
            || Math.min(m00, m10, m01, m11) >= (mx * rb.x) + (my * rb.y))
        {
            return false;
        }

        return true;
    }

    /**
     * Pads the rectangle making it grow in all directions.
     *
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     * @example
     * ```ts
     * // Basic padding
     * const rect = new Rectangle(100, 100, 200, 150);
     * rect.pad(10); // Adds 10px padding on all sides
     *
     * // Different horizontal and vertical padding
     * const uiRect = new Rectangle(0, 0, 100, 50);
     * uiRect.pad(20, 10); // 20px horizontal, 10px vertical
     * ```
     * @remarks
     * - Adjusts x/y by subtracting padding
     * - Increases width/height by padding * 2
     * - Common in UI layout calculations
     * - Chainable with other methods
     * @param paddingX - The horizontal padding amount
     * @param paddingY - The vertical padding amount
     * @returns Returns itself
     * @see {@link Rectangle.enlarge} For growing to include another rectangle
     * @see {@link Rectangle.fit} For shrinking to fit within another rectangle
     */
    public pad(paddingX = 0, paddingY = paddingX): this
    {
        this.x -= paddingX;
        this.y -= paddingY;

        this.width += paddingX * 2;
        this.height += paddingY * 2;

        return this;
    }

    /**
     * Fits this rectangle around the passed one.
     * @example
     * ```ts
     * // Basic fitting
     * const container = new Rectangle(0, 0, 100, 100);
     * const content = new Rectangle(25, 25, 200, 200);
     * content.fit(container); // Clips to container bounds
     * ```
     * @param rectangle - The rectangle to fit around
     * @returns Returns itself
     * @see {@link Rectangle.enlarge} For growing to include another rectangle
     * @see {@link Rectangle.pad} For adding padding around the rectangle
     */
    public fit(rectangle: Rectangle): this
    {
        const x1 = Math.max(this.x, rectangle.x);
        const x2 = Math.min(this.x + this.width, rectangle.x + rectangle.width);
        const y1 = Math.max(this.y, rectangle.y);
        const y2 = Math.min(this.y + this.height, rectangle.y + rectangle.height);

        this.x = x1;
        this.width = Math.max(x2 - x1, 0);
        this.y = y1;
        this.height = Math.max(y2 - y1, 0);

        return this;
    }

    /**
     * Enlarges rectangle so that its corners lie on a grid defined by resolution.
     * @example
     * ```ts
     * // Basic grid alignment
     * const rect = new Rectangle(10.2, 10.6, 100.8, 100.4);
     * rect.ceil(); // Aligns to whole pixels
     *
     * // Custom resolution grid
     * const uiRect = new Rectangle(5.3, 5.7, 50.2, 50.8);
     * uiRect.ceil(0.5); // Aligns to half pixels
     *
     * // Use with precision value
     * const preciseRect = new Rectangle(20.001, 20.999, 100.001, 100.999);
     * preciseRect.ceil(1, 0.01); // Handles small decimal variations
     * ```
     * @param resolution - The grid size to align to (1 = whole pixels)
     * @param eps - Small number to prevent floating point errors
     * @returns Returns itself
     * @see {@link Rectangle.fit} For constraining to bounds
     * @see {@link Rectangle.enlarge} For growing dimensions
     */
    public ceil(resolution = 1, eps = 0.001): this
    {
        const x2 = Math.ceil((this.x + this.width - eps) * resolution) / resolution;
        const y2 = Math.ceil((this.y + this.height - eps) * resolution) / resolution;

        this.x = Math.floor((this.x + eps) * resolution) / resolution;
        this.y = Math.floor((this.y + eps) * resolution) / resolution;

        this.width = x2 - this.x;
        this.height = y2 - this.y;

        return this;
    }

    /**
     * Enlarges this rectangle to include the passed rectangle.
     * @example
     * ```ts
     * // Basic enlargement
     * const rect = new Rectangle(50, 50, 100, 100);
     * const other = new Rectangle(0, 0, 200, 75);
     * rect.enlarge(other);
     * // rect is now: x=0, y=0, width=200, height=150
     *
     * // Use for bounding box calculation
     * const bounds = new Rectangle();
     * objects.forEach((obj) => {
     *     bounds.enlarge(obj.getBounds());
     * });
     * ```
     * @param rectangle - The rectangle to include
     * @returns Returns itself
     * @see {@link Rectangle.fit} For shrinking to fit within another rectangle
     * @see {@link Rectangle.pad} For adding padding around the rectangle
     */
    public enlarge(rectangle: Rectangle): this
    {
        const x1 = Math.min(this.x, rectangle.x);
        const x2 = Math.max(this.x + this.width, rectangle.x + rectangle.width);
        const y1 = Math.min(this.y, rectangle.y);
        const y2 = Math.max(this.y + this.height, rectangle.y + rectangle.height);

        this.x = x1;
        this.width = x2 - x1;
        this.y = y1;
        this.height = y2 - y1;

        return this;
    }

    /**
     * Returns the framing rectangle of the rectangle as a Rectangle object
     * @example
     * ```ts
     * // Basic bounds retrieval
     * const rect = new Rectangle(100, 100, 200, 150);
     * const bounds = rect.getBounds();
     *
     * // Reuse existing rectangle
     * const out = new Rectangle();
     * rect.getBounds(out);
     * ```
     * @param out - Optional rectangle to store the result
     * @returns The framing rectangle
     * @see {@link Rectangle.copyFrom} For direct copying
     * @see {@link Rectangle.clone} For creating new copy
     */
    public getBounds(out?: Rectangle): Rectangle
    {
        out ||= new Rectangle();
        out.copyFrom(this);

        return out;
    }

    /**
     * Determines whether another Rectangle is fully contained within this Rectangle.
     *
     * Rectangles that occupy the same space are considered to be containing each other.
     *
     * Rectangles without area (width or height equal to zero) can't contain anything,
     * not even other arealess rectangles.
     * @example
     * ```ts
     * // Check if one rectangle contains another
     * const container = new Rectangle(0, 0, 100, 100);
     * const inner = new Rectangle(25, 25, 50, 50);
     *
     * console.log(container.containsRect(inner)); // true
     *
     * // Check overlapping rectangles
     * const partial = new Rectangle(75, 75, 50, 50);
     * console.log(container.containsRect(partial)); // false
     *
     * // Zero-area rectangles
     * const empty = new Rectangle(0, 0, 0, 100);
     * console.log(container.containsRect(empty)); // false
     * ```
     * @param other - The Rectangle to check for containment
     * @returns True if other is fully contained within this Rectangle
     * @see {@link Rectangle.contains} For point containment
     * @see {@link Rectangle.intersects} For overlap testing
     */
    public containsRect(other: Rectangle): boolean
    {
        if (this.width <= 0 || this.height <= 0) return false;

        const x1 = other.x;
        const y1 = other.y;
        const x2 = other.x + other.width;
        const y2 = other.y + other.height;

        return x1 >= this.x && x1 < this.x + this.width
            && y1 >= this.y && y1 < this.y + this.height
            && x2 >= this.x && x2 < this.x + this.width
            && y2 >= this.y && y2 < this.y + this.height;
    }

    /**
     * Sets the position and dimensions of the rectangle.
     * @example
     * ```ts
     * // Basic usage
     * const rect = new Rectangle();
     * rect.set(100, 100, 200, 150);
     *
     * // Chain with other operations
     * const bounds = new Rectangle()
     *     .set(0, 0, 100, 100)
     *     .pad(10);
     * ```
     * @param x - The X coordinate of the upper-left corner of the rectangle
     * @param y - The Y coordinate of the upper-left corner of the rectangle
     * @param width - The overall width of the rectangle
     * @param height - The overall height of the rectangle
     * @returns Returns itself for method chaining
     * @see {@link Rectangle.copyFrom} For copying from another rectangle
     * @see {@link Rectangle.clone} For creating a new copy
     */
    public set(x: number, y: number, width: number, height: number): this
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        return this;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Rectangle x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`;
    }
    // #endif
}
