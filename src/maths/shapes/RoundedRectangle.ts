import { type SHAPE_PRIMITIVE } from '../misc/const';
import { Rectangle } from './Rectangle';

import type { ShapePrimitive } from './ShapePrimitive';

const isCornerWithinStroke = (
    pX: number,
    pY: number,
    cornerX: number,
    cornerY: number,
    radius: number,
    strokeWidthInner: number,
    strokeWidthOuter: number
) =>
{
    const dx = pX - cornerX;
    const dy = pY - cornerY;
    const distance = Math.sqrt((dx * dx) + (dy * dy));

    return distance >= radius - strokeWidthInner && distance <= radius + strokeWidthOuter;
};

/**
 * The `RoundedRectangle` object represents a rectangle with rounded corners.
 * Defined by position, dimensions and corner radius.
 * @example
 * ```ts
 * // Basic rectangle creation
 * const rect = new RoundedRectangle(100, 100, 200, 150, 20);
 * // Use as container hit area
 * container.hitArea = new RoundedRectangle(0, 0, 100, 100, 10);
 * // Check point containment
 * const isInside = rect.contains(mouseX, mouseY);
 * // Get bounds
 * const bounds = rect.getBounds();
 * ```
 * @remarks
 * - Position defined by top-left corner
 * - Radius clamped to half smallest dimension
 * - Common in UI elements
 * @see {@link Rectangle} For non-rounded rectangles
 * @category maths
 * @standard
 */
export class RoundedRectangle implements ShapePrimitive
{
    /**
     * The X coordinate of the upper-left corner of the rounded rectangle
     * @example
     * ```ts
     * // Basic x position
     * const rect = new RoundedRectangle();
     * rect.x = 100;
     * ```
     * @default 0
     */
    public x: number;

    /**
     * The Y coordinate of the upper-left corner of the rounded rectangle
     * @example
     * ```ts
     * // Basic y position
     * const rect = new RoundedRectangle();
     * rect.y = 100;
     * ```
     * @default 0
     */
    public y: number;

    /**
     * The overall width of this rounded rectangle
     * @example
     * ```ts
     * // Basic width setting
     * const rect = new RoundedRectangle();
     * rect.width = 200; // Total width will be 200
     * ```
     * @default 0
     */
    public width: number;

    /**
     * The overall height of this rounded rectangle
     * @example
     * ```ts
     * // Basic height setting
     * const rect = new RoundedRectangle();
     * rect.height = 150; // Total height will be 150
     * ```
     * @default 0
     */
    public height: number;

    /**
     * Controls the radius of the rounded corners
     * @example
     * ```ts
     * // Basic radius setting
     * const rect = new RoundedRectangle(0, 0, 200, 150);
     * rect.radius = 20;
     *
     * // Clamp to maximum safe radius
     * rect.radius = Math.min(rect.width, rect.height) / 2;
     *
     * // Create pill shape
     * rect.radius = rect.height / 2;
     * ```
     * @remarks
     * - Automatically clamped to half of smallest dimension
     * - Common values: 0-20 for UI elements
     * - Higher values create more rounded corners
     * @default 20
     */
    public radius: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @example
     * ```ts
     * // Check shape type
     * const shape = new RoundedRectangle(0, 0, 100, 100, 20);
     * console.log(shape.type); // 'roundedRectangle'
     *
     * // Use in type guards
     * if (shape.type === 'roundedRectangle') {
     *     console.log(shape.radius);
     * }
     * ```
     * @readonly
     * @default 'roundedRectangle'
     * @see {@link SHAPE_PRIMITIVE} For all shape types
     */
    public readonly type: SHAPE_PRIMITIVE = 'roundedRectangle';

    /**
     * @param x - The X coordinate of the upper-left corner of the rounded rectangle
     * @param y - The Y coordinate of the upper-left corner of the rounded rectangle
     * @param width - The overall width of this rounded rectangle
     * @param height - The overall height of this rounded rectangle
     * @param radius - Controls the radius of the rounded corners
     */
    constructor(x = 0, y = 0, width = 0, height = 0, radius = 20)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.radius = radius;
    }

    /**
     * Returns the framing rectangle of the rounded rectangle as a Rectangle object
     * @example
     * ```ts
     * // Basic bounds calculation
     * const rect = new RoundedRectangle(100, 100, 200, 150, 20);
     * const bounds = rect.getBounds();
     * // bounds: x=100, y=100, width=200, height=150
     *
     * // Reuse existing rectangle
     * const out = new Rectangle();
     * rect.getBounds(out);
     * ```
     * @remarks
     * - Rectangle matches outer dimensions
     * - Ignores corner radius
     * @param out - Optional rectangle to store the result
     * @returns The framing rectangle
     * @see {@link Rectangle} For rectangle properties
     * @see {@link RoundedRectangle.contains} For checking if a point is inside
     */
    public getBounds(out?: Rectangle): Rectangle
    {
        out ||= new Rectangle();

        out.x = this.x;
        out.y = this.y;
        out.width = this.width;
        out.height = this.height;

        return out;
    }

    /**
     * Creates a clone of this Rounded Rectangle.
     * @example
     * ```ts
     * // Basic cloning
     * const original = new RoundedRectangle(100, 100, 200, 150, 20);
     * const copy = original.clone();
     *
     * // Clone and modify
     * const modified = original.clone();
     * modified.radius = 30;
     * modified.width *= 2;
     *
     * // Verify independence
     * console.log(original.radius);  // 20
     * console.log(modified.radius);  // 30
     * ```
     * @returns A copy of the rounded rectangle
     * @see {@link RoundedRectangle.copyFrom} For copying into existing rectangle
     * @see {@link RoundedRectangle.copyTo} For copying to another rectangle
     */
    public clone(): RoundedRectangle
    {
        return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
    }

    /**
     * Copies another rectangle to this one.
     * @example
     * ```ts
     * // Basic copying
     * const source = new RoundedRectangle(100, 100, 200, 150, 20);
     * const target = new RoundedRectangle();
     * target.copyFrom(source);
     *
     * // Chain with other operations
     * const rect = new RoundedRectangle()
     *     .copyFrom(source)
     *     .getBounds(rect);
     * ```
     * @param rectangle - The rectangle to copy from
     * @returns Returns itself
     * @see {@link RoundedRectangle.copyTo} For copying to another rectangle
     * @see {@link RoundedRectangle.clone} For creating new rectangle copy
     */
    public copyFrom(rectangle: RoundedRectangle): this
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
     * const source = new RoundedRectangle(100, 100, 200, 150, 20);
     * const target = new RoundedRectangle();
     * source.copyTo(target);
     *
     * // Chain with other operations
     * const result = source
     *     .copyTo(new RoundedRectangle())
     *     .getBounds();
     * ```
     * @param rectangle - The rectangle to copy to
     * @returns Returns given parameter
     * @see {@link RoundedRectangle.copyFrom} For copying from another rectangle
     * @see {@link RoundedRectangle.clone} For creating new rectangle copy
     */
    public copyTo(rectangle: RoundedRectangle): RoundedRectangle
    {
        rectangle.copyFrom(this);

        return rectangle;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     * @example
     * ```ts
     * // Basic containment check
     * const rect = new RoundedRectangle(100, 100, 200, 150, 20);
     * const isInside = rect.contains(150, 125); // true
     * // Check corner radius
     * const corner = rect.contains(100, 100); // false if within corner curve
     * ```
     * @remarks
     * - Returns false if width/height is 0 or negative
     * - Handles rounded corners with radius check
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @returns Whether the x/y coordinates are within this Rounded Rectangle
     * @see {@link RoundedRectangle.strokeContains} For checking stroke intersection
     * @see {@link RoundedRectangle.getBounds} For getting containing rectangle
     */
    public contains(x: number, y: number): boolean
    {
        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }
        if (x >= this.x && x <= this.x + this.width)
        {
            if (y >= this.y && y <= this.y + this.height)
            {
                const radius = Math.max(0, Math.min(this.radius, Math.min(this.width, this.height) / 2));

                if ((y >= this.y + radius && y <= this.y + this.height - radius)
                    || (x >= this.x + radius && x <= this.x + this.width - radius))
                {
                    return true;
                }
                let dx = x - (this.x + radius);
                let dy = y - (this.y + radius);
                const radius2 = radius * radius;

                if ((dx * dx) + (dy * dy) <= radius2)
                {
                    return true;
                }
                dx = x - (this.x + this.width - radius);
                if ((dx * dx) + (dy * dy) <= radius2)
                {
                    return true;
                }
                dy = y - (this.y + this.height - radius);
                if ((dx * dx) + (dy * dy) <= radius2)
                {
                    return true;
                }
                dx = x - (this.x + radius);
                if ((dx * dx) + (dy * dy) <= radius2)
                {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this rectangle including the stroke.
     * @example
     * ```ts
     * // Basic stroke check
     * const rect = new RoundedRectangle(100, 100, 200, 150, 20);
     * const isOnStroke = rect.strokeContains(150, 100, 4); // 4px line width
     *
     * // Check with different alignments
     * const innerStroke = rect.strokeContains(150, 100, 4, 1);   // Inside
     * const centerStroke = rect.strokeContains(150, 100, 4, 0.5); // Centered
     * const outerStroke = rect.strokeContains(150, 100, 4, 0);   // Outside
     * ```
     * @param pX - The X coordinate of the point to test
     * @param pY - The Y coordinate of the point to test
     * @param strokeWidth - The width of the line to check
     * @param alignment - The alignment of the stroke (1 = inner, 0.5 = centered, 0 = outer)
     * @returns Whether the x/y coordinates are within this rectangle's stroke
     * @see {@link RoundedRectangle.contains} For checking fill containment
     * @see {@link RoundedRectangle.getBounds} For getting stroke bounds
     */
    public strokeContains(pX: number, pY: number, strokeWidth: number, alignment: number = 0.5): boolean
    {
        const { x, y, width, height, radius } = this;

        const strokeWidthOuter = strokeWidth * (1 - alignment);
        const strokeWidthInner = strokeWidth - strokeWidthOuter;

        const innerX = x + radius;
        const innerY = y + radius;
        const innerWidth = width - (radius * 2);
        const innerHeight = height - (radius * 2);
        const rightBound = x + width;
        const bottomBound = y + height;

        // Check if point is within the vertical edges (excluding corners)
        if (((pX >= x - strokeWidthOuter && pX <= x + strokeWidthInner)
            || (pX >= rightBound - strokeWidthInner && pX <= rightBound + strokeWidthOuter))
            && pY >= innerY && pY <= innerY + innerHeight)
        {
            return true;
        }

        // Check if point is within the horizontal edges (excluding corners)
        if (((pY >= y - strokeWidthOuter && pY <= y + strokeWidthInner)
            || (pY >= bottomBound - strokeWidthInner && pY <= bottomBound + strokeWidthOuter))
            && pX >= innerX && pX <= innerX + innerWidth)
        {
            return true;
        }

        // Top-left, top-right, bottom-right, bottom-left corners
        return (
            // Top-left
            (pX < innerX && pY < innerY
                && isCornerWithinStroke(pX, pY, innerX, innerY,
                    radius, strokeWidthInner, strokeWidthOuter))
            //  top-right
            || (pX > rightBound - radius && pY < innerY
                && isCornerWithinStroke(pX, pY, rightBound - radius, innerY,
                    radius, strokeWidthInner, strokeWidthOuter))
            // bottom-right
            || (pX > rightBound - radius && pY > bottomBound - radius
                && isCornerWithinStroke(pX, pY, rightBound - radius, bottomBound - radius,
                    radius, strokeWidthInner, strokeWidthOuter))
            // bottom-left
            || (pX < innerX && pY > bottomBound - radius
                && isCornerWithinStroke(pX, pY, innerX, bottomBound - radius,
                    radius, strokeWidthInner, strokeWidthOuter)));
    }

    // #if _DEBUG
    public toString(): string
    {
        return `[pixi.js/math:RoundedRectangle x=${this.x} y=${this.y}`
            + `width=${this.width} height=${this.height} radius=${this.radius}]`;
    }
    // #endif
}
