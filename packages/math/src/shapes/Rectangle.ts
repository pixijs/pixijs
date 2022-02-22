import { SHAPES } from '../const';
import { Matrix } from '../Matrix';
import { Point } from '../Point';

const tempPoints = [new Point(), new Point(), new Point(), new Point()];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Rectangle extends GlobalMixins.Rectangle {}

/**
 * Size object, contains width and height
 *
 * @memberof PIXI
 * @typedef {object} ISize
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

    /** Returns the left edge of the rectangle. */
    get left(): number
    {
        return this.x;
    }

    /** Returns the right edge of the rectangle. */
    get right(): number
    {
        return this.x + this.width;
    }

    /** Returns the top edge of the rectangle. */
    get top(): number
    {
        return this.y;
    }

    /** Returns the bottom edge of the rectangle. */
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
     * Determines whether the `other` Rectangle transformed by `transform` intersects with `this` Rectangle object.
     * Returns true only if the area of the intersection is >0, this means that Rectangles
     * sharing a side are not overlapping. Another side effect is that an arealess rectangle
     * (width or height equal to zero) can't intersect any other rectangle.
     *
     * @param {Rectangle} other - The Rectangle to intersect with `this`.
     * @param {Matrix} transform - The transformation matrix of `other`.
     * @returns {boolean} A value of `true` if the transformed `other` Rectangle intersects with `this`; otherwise `false`.
     */
    intersects(other: Rectangle, transform?: Matrix): boolean
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
