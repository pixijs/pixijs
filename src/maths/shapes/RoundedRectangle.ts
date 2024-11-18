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
 * The `RoundedRectangle` object is an area defined by its position, as indicated by its top-left corner
 * point (`x`, `y`) and by its `width` and its `height`, including a `radius` property that
 * defines the radius of the rounded corners.
 * @memberof maths
 */
export class RoundedRectangle implements ShapePrimitive
{
    /**
     * The X coordinate of the upper-left corner of the rounded rectangle
     * @default 0
     */
    public x: number;

    /**
     * The Y coordinate of the upper-left corner of the rounded rectangle
     * @default 0
     */
    public y: number;

    /**
     * The overall width of this rounded rectangle
     * @default 0
     */
    public width: number;

    /**
     * The overall height of this rounded rectangle
     * @default 0
     */
    public height: number;

    /**
     * Controls the radius of the rounded corners
     * @default 20
     */
    public radius: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     * @default 'roundedRectangle'
     */
    public readonly type = 'roundedRectangle';

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
     * @param out - optional rectangle to store the result
     * @returns The framing rectangle
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
     * @returns - A copy of the rounded rectangle.
     */
    public clone(): RoundedRectangle
    {
        return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
    }

    /**
     * Copies another rectangle to this one.
     * @param rectangle - The rectangle to copy from.
     * @returns Returns itself.
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
     * @param rectangle - The rectangle to copy to.
     * @returns Returns given parameter.
     */
    public copyTo(rectangle: RoundedRectangle): RoundedRectangle
    {
        rectangle.copyFrom(this);

        return rectangle;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     * @param x - The X coordinate of the point to test.
     * @param y - The Y coordinate of the point to test.
     * @returns - Whether the x/y coordinates are within this Rounded Rectangle.
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
     * @param pX - The X coordinate of the point to test
     * @param pY - The Y coordinate of the point to test
     * @param strokeWidth - The width of the line to check
     * @param alignment - The alignment of the stroke, 0.5 by default
     * @returns Whether the x/y coordinates are within this rectangle
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
