import { Rectangle } from './Rectangle';

import type { ShapePrimitive } from './ShapePrimitive';

/**
 * The Ellipse object is used to help draw graphics and can also be used to specify a hit area for containers.
 * @example
 * ```ts
 * // Basic ellipse creation
 * const ellipse = new Ellipse(100, 100, 20, 10);
 *
 * // Use as a hit area
 * container.hitArea = new Ellipse(0, 0, 50, 25);
 *
 * // Check point containment
 * const isInside = ellipse.contains(mouseX, mouseY);
 *
 * // Get bounding box
 * const bounds = ellipse.getBounds();
 * ```
 * @remarks
 * - Defined by center (x,y) and half dimensions
 * - Total width = halfWidth * 2
 * - Total height = halfHeight * 2
 * @see {@link Rectangle} For rectangular shapes
 * @see {@link Circle} For circular shapes
 * @category maths
 * @standard
 */
export class Ellipse implements ShapePrimitive
{
    /**
     * The X coordinate of the center of this ellipse
     * @example
     * ```ts
     * // Basic x position
     * const ellipse = new Ellipse();
     * ellipse.x = 100;
     * ```
     * @default 0
     */
    public x: number;

    /**
     * The Y coordinate of the center of this ellipse
     * @example
     * ```ts
     * // Basic y position
     * const ellipse = new Ellipse();
     * ellipse.y = 200;
     * ```
     * @default 0
     */
    public y: number;

    /**
     * The half width of this ellipse
     * @example
     * ```ts
     * // Set half width
     * const ellipse = new Ellipse(100, 100);
     * ellipse.halfWidth = 50; // Total width will be 100
     * ```
     * @default 0
     */
    public halfWidth: number;

    /**
     * The half height of this ellipse
     * @example
     * ```ts
     * // Set half height
     * const ellipse = new Ellipse(100, 100);
     * ellipse.halfHeight = 25; // Total height will be 50
     * ```
     * @default 0
     */
    public halfHeight: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @example
     * ```ts
     * // Check shape type
     * const shape = new Ellipse(0, 0, 50, 25);
     * console.log(shape.type); // 'ellipse'
     *
     * // Use in type guards
     * if (shape.type === 'ellipse') {
     *     console.log(shape.halfWidth, shape.halfHeight);
     * }
     * ```
     * @readonly
     * @default 'ellipse'
     * @see {@link SHAPE_PRIMITIVE} For all shape types
     */
    public readonly type = 'ellipse';

    /**
     * @param x - The X coordinate of the center of this ellipse
     * @param y - The Y coordinate of the center of this ellipse
     * @param halfWidth - The half width of this ellipse
     * @param halfHeight - The half height of this ellipse
     */
    constructor(x = 0, y = 0, halfWidth = 0, halfHeight = 0)
    {
        this.x = x;
        this.y = y;
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }

    /**
     * Creates a clone of this Ellipse instance.
     * @example
     * ```ts
     * // Basic cloning
     * const original = new Ellipse(100, 100, 50, 25);
     * const copy = original.clone();
     *
     * // Clone and modify
     * const modified = original.clone();
     * modified.halfWidth *= 2;
     * modified.halfHeight *= 2;
     *
     * // Verify independence
     * console.log(original.halfWidth);  // 50
     * console.log(modified.halfWidth);  // 100
     * ```
     * @returns A copy of the ellipse
     * @see {@link Ellipse.copyFrom} For copying into existing ellipse
     * @see {@link Ellipse.copyTo} For copying to another ellipse
     */
    public clone(): Ellipse
    {
        return new Ellipse(this.x, this.y, this.halfWidth, this.halfHeight);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this ellipse.
     * Uses normalized coordinates and the ellipse equation to determine containment.
     * @example
     * ```ts
     * // Basic containment check
     * const ellipse = new Ellipse(100, 100, 50, 25);
     * const isInside = ellipse.contains(120, 110);
     * ```
     * @remarks
     * - Uses ellipse equation (x²/a² + y²/b² ≤ 1)
     * - Returns false if dimensions are 0 or negative
     * - Normalized to center (0,0) for calculation
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @returns Whether the x/y coords are within this ellipse
     * @see {@link Ellipse.strokeContains} For checking stroke intersection
     * @see {@link Ellipse.getBounds} For getting containing rectangle
     */
    public contains(x: number, y: number): boolean
    {
        if (this.halfWidth <= 0 || this.halfHeight <= 0)
        {
            return false;
        }

        // normalize the coords to an ellipse with center 0,0
        let normx = ((x - this.x) / this.halfWidth);
        let normy = ((y - this.y) / this.halfHeight);

        normx *= normx;
        normy *= normy;

        return (normx + normy <= 1);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this ellipse including stroke.
     * @example
     * ```ts
     * // Basic stroke check
     * const ellipse = new Ellipse(100, 100, 50, 25);
     * const isOnStroke = ellipse.strokeContains(150, 100, 4); // 4px line width
     *
     * // Check with different alignments
     * const innerStroke = ellipse.strokeContains(150, 100, 4, 1);   // Inside
     * const centerStroke = ellipse.strokeContains(150, 100, 4, 0.5); // Centered
     * const outerStroke = ellipse.strokeContains(150, 100, 4, 0);   // Outside
     * ```
     * @remarks
     * - Uses normalized ellipse equations
     * - Considers stroke alignment
     * - Returns false if dimensions are 0
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @param strokeWidth - The width of the line to check
     * @param alignment - The alignment of the stroke (1 = inner, 0.5 = centered, 0 = outer)
     * @returns Whether the x/y coords are within this ellipse's stroke
     * @see {@link Ellipse.contains} For checking fill containment
     * @see {@link Ellipse.getBounds} For getting stroke bounds
     */
    public strokeContains(x: number, y: number, strokeWidth: number, alignment: number = 0.5): boolean
    {
        const { halfWidth, halfHeight } = this;

        if (halfWidth <= 0 || halfHeight <= 0)
        {
            return false;
        }

        const strokeOuterWidth = strokeWidth * (1 - alignment);
        const strokeInnerWidth = strokeWidth - strokeOuterWidth;

        const innerHorizontal = halfWidth - strokeInnerWidth;
        const innerVertical = halfHeight - strokeInnerWidth;

        const outerHorizontal = halfWidth + strokeOuterWidth;
        const outerVertical = halfHeight + strokeOuterWidth;

        const normalizedX = x - this.x;
        const normalizedY = y - this.y;

        const innerEllipse = ((normalizedX * normalizedX) / (innerHorizontal * innerHorizontal))
            + ((normalizedY * normalizedY) / (innerVertical * innerVertical));

        const outerEllipse = ((normalizedX * normalizedX) / (outerHorizontal * outerHorizontal))
            + ((normalizedY * normalizedY) / (outerVertical * outerVertical));

        return innerEllipse > 1 && outerEllipse <= 1;
    }

    /**
     * Returns the framing rectangle of the ellipse as a Rectangle object.
     * @example
     * ```ts
     * // Basic bounds calculation
     * const ellipse = new Ellipse(100, 100, 50, 25);
     * const bounds = ellipse.getBounds();
     * // bounds: x=50, y=75, width=100, height=50
     *
     * // Reuse existing rectangle
     * const rect = new Rectangle();
     * ellipse.getBounds(rect);
     * ```
     * @remarks
     * - Creates Rectangle if none provided
     * - Top-left is (x-halfWidth, y-halfHeight)
     * - Width is halfWidth * 2
     * - Height is halfHeight * 2
     * @param out - Optional Rectangle object to store the result
     * @returns The framing rectangle
     * @see {@link Rectangle} For rectangle properties
     * @see {@link Ellipse.contains} For checking if a point is inside
     */
    public getBounds(out?: Rectangle): Rectangle
    {
        out ||= new Rectangle();

        out.x = this.x - this.halfWidth;
        out.y = this.y - this.halfHeight;
        out.width = this.halfWidth * 2;
        out.height = this.halfHeight * 2;

        return out;
    }

    /**
     * Copies another ellipse to this one.
     * @example
     * ```ts
     * // Basic copying
     * const source = new Ellipse(100, 100, 50, 25);
     * const target = new Ellipse();
     * target.copyFrom(source);
     * ```
     * @param ellipse - The ellipse to copy from
     * @returns Returns itself
     * @see {@link Ellipse.copyTo} For copying to another ellipse
     * @see {@link Ellipse.clone} For creating new ellipse copy
     */
    public copyFrom(ellipse: Ellipse): this
    {
        this.x = ellipse.x;
        this.y = ellipse.y;
        this.halfWidth = ellipse.halfWidth;
        this.halfHeight = ellipse.halfHeight;

        return this;
    }

    /**
     * Copies this ellipse to another one.
     * @example
     * ```ts
     * // Basic copying
     * const source = new Ellipse(100, 100, 50, 25);
     * const target = new Ellipse();
     * source.copyTo(target);
     * ```
     * @param ellipse - The ellipse to copy to
     * @returns Returns given parameter
     * @see {@link Ellipse.copyFrom} For copying from another ellipse
     * @see {@link Ellipse.clone} For creating new ellipse copy
     */
    public copyTo(ellipse: Ellipse): Ellipse
    {
        ellipse.copyFrom(this);

        return ellipse;
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:Ellipse x=${this.x} y=${this.y} halfWidth=${this.halfWidth} halfHeight=${this.halfHeight}]`;
    }
    // #endif
}
