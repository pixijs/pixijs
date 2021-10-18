import { SHAPES } from '../const';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Rectangle extends GlobalMixins.Rectangle {}

/**
 * Size object, contains width and height
 *
 * @memberof PIXI
 * @typedef  ISize
 */

/**
 * Rectangle object is an area defined by its position, as indicated by its top-left corner
 * point (x, y) and by its width and its height.
 *
 * @memberof PIXI
 */
export class Rectangle
{
    /** @default 0 */
    public x: number;

    /** @default 0 */
    public y: number;
    
    /** @default 0 */
    public width: number;

    /** @default 0 */
    public height: number;

    /**
    * The type of the object, mainly used to avoid `instanceof` checks
    * @default PIXI.SHAPES.RECT
    * @see PIXI.SHAPES
    */
    public readonly type: SHAPES.RECT;

    /**
     * @param x - The X coordinate of the upper-left corner of the rectangle
     * @param y - The Y coordinate of the upper-left corner of the rectangle
     * @param width - The overall width of the rectangle
     * @param height - The overall height of the rectangle
     */
    constructor(x = 0, y = 0, width = 0, height = 0)
    {
        this.x = Number(x);
        this.y = Number(y);
        this.width = Number(width);
        this.height = Number(height);
        this.type = SHAPES.RECT;
    }

    /** returns the left edge of the rectangle */
    get left(): number
    {
        return this.x;
    }

    /** returns the right edge of the rectangle */
    get right(): number
    {
        return this.x + this.width;
    }

    /** returns the top edge of the rectangle */
    get top(): number
    {
        return this.y;
    }

    /** returns the bottom edge of the rectangle */
    get bottom(): number
    {
        return this.y + this.height;
    }

    /** A constant empty rectangle. */
    static get EMPTY(): Rectangle
    {
        return new Rectangle(0, 0, 0, 0);
    }

    /**
     * Creates a clone of this Rectangle
     *
     * @return a copy of the rectangle
     */
    clone(): Rectangle
    {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    /**
     * Copies another rectangle to this one.
     *
     * @param rectangle - The rectangle to copy from.
     * @return Returns itself.
     */
    copyFrom(rectangle: Rectangle): Rectangle
    {
        this.x = rectangle.x;
        this.y = rectangle.y;
        this.width = rectangle.width;
        this.height = rectangle.height;

        return this;
    }

    /**
     * Copies this rectangle to another one.
     *
     * @param rectangle - The rectangle to copy to.
     * @return Returns given parameter.
     */
    copyTo(rectangle: Rectangle): Rectangle
    {
        rectangle.x = this.x;
        rectangle.y = this.y;
        rectangle.width = this.width;
        rectangle.height = this.height;

        return rectangle;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     *
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @return Whether the x/y coordinates are within this Rectangle
     */
    contains(x: number, y: number): boolean
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
     * Pads the rectangle making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     *
     * @param paddingX - The horizontal padding amount.
     * @param paddingY - The vertical padding amount.
     * @return Returns itself.
     */
    pad(paddingX = 0, paddingY = paddingX): this
    {
        this.x -= paddingX;
        this.y -= paddingY;

        this.width += paddingX * 2;
        this.height += paddingY * 2;

        return this;
    }

    /**
     * Fits this rectangle around the passed one.
     *
     * @param rectangle - The rectangle to fit.
     * @return Returns itself.
     */
    fit(rectangle: Rectangle): this
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
     * Enlarges rectangle that way its corners lie on grid
     *
     * @param resolution - resolution
     * @param eps - precision
     * @return Returns itself.
     */
    ceil(resolution = 1, eps = 0.001): this
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
     *
     * @param rectangle - The rectangle to include.
     * @return Returns itself.
     */
    enlarge(rectangle: Rectangle): this
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

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/math:Rectangle x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`;
    }
    // #endif
}
