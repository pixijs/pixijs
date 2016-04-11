var CONST = require('../../const');

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
function Rectangle(x, y, width, height)
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
     */
    this.type = CONST.SHAPES.RECT;
}

Rectangle.prototype.constructor = Rectangle;
module.exports = Rectangle;

/**
 * A constant empty rectangle.
 *
 * @static
 * @constant
 */
Rectangle.EMPTY = new Rectangle(0, 0, 0, 0);


/**
 * Creates a clone of this Rectangle
 *
 * @return {PIXI.Rectangle} a copy of the rectangle
 */
Rectangle.prototype.clone = function ()
{
    return new Rectangle(this.x, this.y, this.width, this.height);
};

Rectangle.prototype.copy = function (rectangle)
{
    this.x = rectangle.x;
    this.y = rectangle.y;
    this.width = rectangle.width;
    this.height = rectangle.height;

    return this;
};

/**
 * Checks whether the x and y coordinates given are contained within this Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rectangle
 */
Rectangle.prototype.contains = function (x, y)
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
};

Rectangle.prototype.pad = function (paddingX, paddingY)
{
    paddingX = paddingX || 0;
    paddingY = paddingY || ( (paddingY !== 0) ? paddingX : 0 );

    this.x -= paddingX;
    this.y -= paddingY;

    this.width += paddingX * 2;
    this.height += paddingY * 2;
};

Rectangle.prototype.fit = function (rectangle)
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
};

Rectangle.prototype.enlarge = function (rect)
{

    if (rect === Rectangle.EMPTY)
    {
        return;
    }

    var x1 = Math.min(this.x, rect.x);
    var x2 = Math.max(this.x + this.width, rect.x + rect.width);
    var y1 = Math.min(this.y, rect.y);
    var y2 = Math.max(this.y + this.height, rect.y + rect.height);
    this.x = x1;
    this.width = x2 - x1;
    this.y = y1;
    this.height = y2 - y1;
};
