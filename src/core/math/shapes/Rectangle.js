import CONST from '../../const';

/**
 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rectangle
 * @param width {number} The overall width of this rectangle
 * @param height {number} The overall height of this rectangle
 */
class Rectangle
{
    constructor(x, y, width, height)
    {
        /**
         * @member {number}
         * @default 0
         */
        this.x = x || 0;

        /**
         * @member {number}
         * @default 0
         */
        this.y = y || 0;

        /**
         * @member {number}
         * @default 0
         */
        this.width = width || 0;

        /**
         * @member {number}
         * @default 0
         */
        this.height = height || 0;

        /**
         * The type of the object, mainly used to avoid `instanceof` checks
         *
         * @member {number}
         * @readOnly
         * @default CONST.SHAPES.RECT
         * @see PIXI.SHAPES
         */
        this.type = CONST.SHAPES.RECT;
    }

    /**
     * A constant empty rectangle.
     *
     * @static
     * @constant
     */
    static get EMPTY() {
        return new Rectangle(0, 0, 0, 0);
    }

    /**
     * Creates a clone of this Rectangle
     *
     * @return {PIXI.Rectangle} a copy of the rectangle
     */
    clone()
    {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    copy(rectangle)
    {
        this.x = rectangle.x;
        this.y = rectangle.y;
        this.width = rectangle.width;
        this.height = rectangle.height;

        return this;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     *
     * @param x {number} The X coordinate of the point to test
     * @param y {number} The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Rectangle
     */
    contains(x, y)
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

    pad(paddingX, paddingY)
    {
        paddingX = paddingX || 0;
        paddingY = paddingY || ( (paddingY !== 0) ? paddingX : 0 );

        this.x -= paddingX;
        this.y -= paddingY;

        this.width += paddingX * 2;
        this.height += paddingY * 2;
    }

    fit(rectangle)
    {
        if (this.x < rectangle.x)
        {
            this.width += this.x;
            if(this.width < 0) {
              this.width = 0;
            }

            this.x = rectangle.x;
        }

        if (this.y < rectangle.y)
        {
            this.height += this.y;
            if(this.height < 0) {
              this.height = 0;
            }
            this.y = rectangle.y;
        }

        if ( this.x + this.width > rectangle.x + rectangle.width )
        {
            this.width = rectangle.width - this.x;
            if(this.width < 0) {
              this.width = 0;
            }
        }

        if ( this.y + this.height > rectangle.y + rectangle.height )
        {
            this.height = rectangle.height - this.y;
            if(this.height < 0) {
              this.height = 0;
            }
        }
    }

    enlarge(rect)
    {

        if (rect === Rectangle.EMPTY)
        {
            return;
        }

        let x1 = Math.min(this.x, rect.x);
        let x2 = Math.max(this.x + this.width, rect.x + rect.width);
        let y1 = Math.min(this.y, rect.y);
        let y2 = Math.max(this.y + this.height, rect.y + rect.height);
        this.x = x1;
        this.width = x2 - x1;
        this.y = y1;
        this.height = y2 - y1;
    }
}

export default Rectangle;