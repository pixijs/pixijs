import { SHAPES } from '../const';

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its
 * top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @memberof PIXI
 */
export class RoundedRectangle
{
    /** @default 0 */
    public x: number;

    /** @default 0 */
    public y: number;

    /** @default 0 */
    public width: number;

    /** @default 0 */
    public height: number;

    /** @default 20 */
    public radius: number;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @default PIXI.SHAPES.RREC
     * @see PIXI.SHAPES
     */
    public readonly type: SHAPES.RREC;

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
        this.type = SHAPES.RREC;
    }

    /**
     * Creates a clone of this Rounded Rectangle.
     *
     * @return - A copy of the rounded rectangle.
     */
    clone(): RoundedRectangle
    {
        return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     *
     * @param x - The X coordinate of the point to test.
     * @param y - The Y coordinate of the point to test.
     * @return - Whether the x/y coordinates are within this Rounded Rectangle.
     */
    contains(x: number, y: number): boolean
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

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:RoundedRectangle x=${this.x} y=${this.y}`
            + `width=${this.width} height=${this.height} radius=${this.radius}]`;
    }
    // #endif
}
