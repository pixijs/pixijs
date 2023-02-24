/**
 * A rectangular bounding box describing the boundary of an area.
 * @memberof PIXI.utils
 * @since 7.1.0
 */
export class BoundingBox
{
    /** The left coordinate value of the bounding box. */
    left: number;
    /** The top coordinate value of the bounding box. */
    top: number;
    /** The right coordinate value of the bounding box. */
    right: number;
    /** The bottom coordinate value of the bounding box. */
    bottom: number;

    /**
     * @param left - The left coordinate value of the bounding box.
     * @param top - The top coordinate value of the bounding box.
     * @param right - The right coordinate value of the bounding box.
     * @param bottom - The bottom coordinate value of the bounding box.
     */
    constructor(left: number, top: number, right: number, bottom: number)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    /** The width of the bounding box. */
    get width(): number { return this.right - this.left; }
    /** The height of the bounding box. */
    get height(): number { return this.bottom - this.top; }

    /** Determines whether the BoundingBox is empty. */
    isEmpty(): boolean
    {
        return this.left === this.right || this.top === this.bottom;
    }

    /**
     * An empty BoundingBox.
     * @type {PIXI.utils.BoundingBox}
     */
    public static readonly EMPTY = new BoundingBox(0, 0, 0, 0);
}
