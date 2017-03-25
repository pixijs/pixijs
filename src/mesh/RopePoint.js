import { default as Point } from '../core/math/Point';

/**
 * The Rope Point object is a point with some info about normals
 *
 * @class
 * @memberof PIXI.mesh
 */
export default class RopePoint extends Point
{
    /**
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     * @param {number} [offset=0] - offsets the point by normal
     * @param {number} [scale=1.0] - scales the point by normal
     */
    constructor(x = 0, y = 0, offset = 0, scale = 1.0)
    {
        super(x, y);
        /**
         * @member {number} position of the
         * @default 0
         */
        this.offset = offset;
        /**
         * @member {number}
         * @default 1.0
         */
        this.scale = scale;
    }

    /**
     * Creates a clone of this point
     *
     * @return {PIXI.RopePoint} a copy of the point
     */
    clone()
    {
        return new Point(this.x, this.y, this.offset, this.scale);
    }

    /**
     * Copies everything from the given point
     *
     * @param {PIXI.Point | PIXI.RopePoint} p - The point to copy.
     */
    copy(p)
    {
        this.set(p.x, p.y, p.offset, p.scale);
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     * @param {number} [offset=0] - offsets the point by normal
     * @param {number} [scale=1.0] - scales the point by normal
     */
    set(x, y, offset, scale)
    {
        this.x = x || 0;
        this.y = y || ((y !== 0) ? this.x : 0);
        this.offset = offset || 0;
        this.scale = (scale !== undefined) ? scale : 1.0;
    }
}
