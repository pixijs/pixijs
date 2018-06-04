import { SHAPES } from '../../const';

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its
 * top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 */
export default class RoundedRectangle
{
    /**
     * @param {number} [x=0] - The X coordinate of the upper-left corner of the rounded rectangle
     * @param {number} [y=0] - The Y coordinate of the upper-left corner of the rounded rectangle
     * @param {number} [width=0] - The overall width of this rounded rectangle
     * @param {number} [height=0] - The overall height of this rounded rectangle
     * @param {number} [radiusTL=20] - Controls the radius of the top left rounded corner
     * @param {number} [radiusTR=20] - Controls the radius of the top right rounded corner
     * @param {number} [radiusBR=20] - Controls the radius of the bottom right rounded corner
     * @param {number} [radiusBL=20] - Controls the radius of the bottom left rounded corner
     */
    constructor(x = 0, y = 0, width = 0, height = 0, radiusTL = 20, radiusTR = 20, radiusBR = 20, radiusBL = 20)
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
        this.radiusTL = radiusTL;

        /**
         * @member {number}
         * @default 20
         */
        this.radiusTR = radiusTR;

        /**
         * @member {number}
         * @default 20
         */
        this.radiusBR = radiusBR;

        /**
         * @member {number}
         * @default 20
         */
        this.radiusBL = radiusBL;

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
    clone()
    {
        return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radiusTL, this.radiusTR, this.radiusBR,
                                    this.radiusBL);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
     *
     * @param {number} x - The X coordinate of the point to test
     * @param {number} y - The Y coordinate of the point to test
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
                let rx1;
                let rx2;
                let ry1;
                let ry2;

                if (y < this.y + (this.height / 2))
                {
                    rx1 = this.radiusTL;
                    rx2 = this.radiusTR;
                }
                else
                {
                    rx1 = this.radiusBL;
                    rx2 = this.radiusBR;
                }

                if (x < this.x + (this.width / 2))
                {
                    ry1 = this.radiusTL;
                    ry2 = this.radiusBL;
                }
                else
                {
                    ry1 = this.radiusTR;
                    ry2 = this.radiusBR;
                }

                if ((y >= this.y + ry1 && y <= this.y + this.height - ry2)
                || (x >= this.x + rx1 && x <= this.x + this.width - rx2))
                {
                    return true;
                }

                let dx = x - (this.x + this.radiusTL);
                let dy = y - (this.y + this.radiusTL);

                if ((dx * dx) + (dy * dy) <= this.radiusTL * this.radiusTL)
                {
                    return true;
                }
                dx = x - (this.x + this.width - this.radiusTR);
                dy = y - (this.y + this.radiusTR);
                if ((dx * dx) + (dy * dy) <= this.radiusTR * this.radiusTR)
                {
                    return true;
                }
                dx = x - (this.x + this.width - this.radiusBR);
                dy = y - (this.y + this.height - this.radiusBR);
                if ((dx * dx) + (dy * dy) <= this.radiusBR * this.radiusBR)
                {
                    return true;
                }
                dx = x - (this.x + this.radiusBL);
                dy = y - (this.y + this.height - this.radiusBL);
                if ((dx * dx) + (dy * dy) <= this.radiusBL * this.radiusBL)
                {
                    return true;
                }
            }
        }

        return false;
    }
}
