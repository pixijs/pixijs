import { SHAPES } from '../const';

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its
 * top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 */
export class RoundedRectangle
{
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public radius: number;
    public readonly type: SHAPES.RREC;

    /**
     * @param {number} [x=0] - The X coordinate of the upper-left corner of the rounded rectangle
     * @param {number} [y=0] - The Y coordinate of the upper-left corner of the rounded rectangle
     * @param {number} [width=0] - The overall width of this rounded rectangle
     * @param {number} [height=0] - The overall height of this rounded rectangle
     * @param {number} [radius=20] - Controls the radius of the rounded corners
     */
    constructor(x = 0, y = 0, width = 0, height = 0, radius = 20)
    {
        /**
         * @member {number}
         * @default 0
         */
        this.x = x;

        /**
         * @member {number}
         * @default 0
         */
        this.y = y;

        /**
         * @member {number}
         * @default 0
         */
        this.width = width;

        /**
         * @member {number}
         * @default 0
         */
        this.height = height;

        /**
         * @member {number}
         * @default 20
         */
        this.radius = radius;

        /**
         * The type of the object, mainly used to avoid `instanceof` checks
         *
         * @member {number}
         * @readonly
         * @default PIXI.SHAPES.RREC
         * @see PIXI.SHAPES
         */
        this.type = SHAPES.RREC;
    }

    /**
     * Creates a clone of this Rounded Rectangle
     *
     * @return {PIXI.RoundedRectangle} a copy of the rounded rectangle
     */
    clone(): RoundedRectangle
    {
        return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
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
