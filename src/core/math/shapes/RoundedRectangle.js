import CONST from '../../const';

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} The X coordinate of the upper-left corner of the rounded rectangle
 * @param [y=0] {number} The Y coordinate of the upper-left corner of the rounded rectangle
 * @param [width=0] {number} The overall width of this rounded rectangle
 * @param [height=0] {number} The overall height of this rounded rectangle
 * @param [radius=20] {number} Controls the radius of the rounded corners
 */
class RoundedRectangle
{
    constructor(x=0, y=0, width=0, height=0, radius=20)
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
         * @default CONST.SHAPES.RREC
         * @see PIXI.SHAPES
         */
        this.type = CONST.SHAPES.RREC;
    }

    /**
     * Creates a clone of this Rounded Rectangle
     *
     * @return {PIXI.RoundedRectangle} a copy of the rounded rectangle
     */
    clone()
    {
        return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     *
     * @param x {number} The X coordinate of the point to test
     * @param y {number} The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
     */
    contains(x, y)
    {
        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }

        if (x >= this.x && x <= this.x + this.width)
        {
            if (y >= this.y && y <= this.y + this.height)
            {
                return true;
            }
        }

        return false;
    }
}

export default RoundedRectangle;
