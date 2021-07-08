import { Rectangle } from '@pixi/math';

/**
 * Determines whether the `other` Rectangle intersects with `this` Rectangle object.
 * Returns true only if the area of the intersection is >0, this means that Rectangles
 * sharing a side are not overlapping. Another side effect is that an arealess rectangle
 * (width or height equal to zero) can't intersect any other rectangle.
 *
 * _Note: Only available with **@pixi/math-extras**._
 *
 * @method intersects
 * @memberof PIXI.Rectangle#
 * @param {Rectangle} other - The Rectangle to intersect with `this`.
 * @returns {boolean} A value of `true` if the `other` Rectangle intersects with `this`; otherwise `false`.
 */
Rectangle.prototype.intersects = function intersects(other: Rectangle): boolean
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
};

/**
 * Determines whether the `other` Rectangle is contained within `this` Rectangle object.
 * Rectangles that occupy the same space are considered to be containing each other.
 * Rectangles without area (width or height equal to zero) can't contain anything,
 * not even other arealess rectangles.
 *
 * _Note: Only available with **@pixi/math-extras**._
 *
 * @method containsRect
 * @memberof PIXI.Rectangle#
 * @param {Rectangle} other - The Rectangle to fit inside `this`.
 * @returns {boolean} A value of `true` if `this` Rectangle contains `other`; otherwise `false`.
 */
Rectangle.prototype.containsRect = function containsRect(other: Rectangle): boolean
{
    if (other.width <= 0 || other.height <= 0)
    {
        return other.x > this.x && other.y > this.y && other.right < this.right && other.bottom < this.bottom;
    }

    return other.x >= this.x && other.y >= this.y && other.right <= this.right && other.bottom <= this.bottom;
};

/**
 * Accepts `other` Rectangle and returns true if the given Rectangle is equal to `this` Rectangle.
 *
 * _Note: Only available with **@pixi/math-extras**._
 *
 * @method equals
 * @memberof PIXI.Rectangle#
 * @param {Rectangle} other - The Rectangle to compare with `this`
 * @returns {boolean} Returns true if all `x`, `y`, `width`, and `height` are equal.
 */
Rectangle.prototype.equals = function equals(other: Rectangle): boolean
{
    if (other === this)
    {
        return true;
    }

    return other && this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
};

/**
 * If the area of the intersection between the Rectangles `other` and `this` is not zero,
 * returns the area of intersection as a Rectangle object. Otherwise, return an empty Rectangle
 * with its properties set to zero.
 * Rectangles without area (width or height equal to zero) can't intersect or be intersected
 * and will always return an empty rectangle with its properties set to zero.
 *
 * _Note: Only available with **@pixi/math-extras**._
 *
 * @method intersects
 * @memberof PIXI.Rectangle#
 * @param {Rectangle} other - The Rectangle to intersect with `this`.
 * @param {Rectangle} [outRect] - A Rectangle object in which to store the value,
 * optional (otherwise will create a new Rectangle).
 * @returns {Rectangle} The intersection of `this` and `other`.
 */
Rectangle.prototype.intersection = function intersection<T extends Rectangle>(other: Rectangle, outRect?: T): T
{
    if (!outRect)
    {
        (outRect as any) = new Rectangle();
    }

    const x0 = this.x < other.x ? other.x : this.x;
    const x1 = this.right > other.right ? other.right : this.right;

    if (x1 <= x0)
    {
        outRect.x = outRect.y = outRect.width = outRect.height = 0;

        return outRect;
    }

    const y0 = this.y < other.y ? other.y : this.y;
    const y1 = this.bottom > other.bottom ? other.bottom : this.bottom;

    if (y1 <= y0)
    {
        outRect.x = outRect.y = outRect.width = outRect.height = 0;

        return outRect;
    }

    outRect.x = x0;
    outRect.y = y0;
    outRect.width = x1 - x0;
    outRect.height = y1 - y0;

    return outRect;
};

/**
 * Adds `this` and `other` Rectangles together to create a new Rectangle object filling
 * the horizontal and vertical space between the two rectangles.
 *
 * _Note: Only available with **@pixi/math-extras**._
 *
 * @method intersects
 * @memberof PIXI.Rectangle#
 * @param {Rectangle} other - The Rectangle to unite with `this`.
 * @param {Rectangle} [outRect] - A Rectangle object in which to store the value,
 * optional (otherwise will create a new Rectangle).
 * @returns {Rectangle} The union of `this` and `other`.
 */
Rectangle.prototype.union = function union<T extends Rectangle>(other: Rectangle, outRect?: T): T
{
    if (!outRect)
    {
        (outRect as any) = new Rectangle();
    }

    const x1 = Math.min(this.x, other.x);
    const x2 = Math.max(this.x + this.width, other.x + other.width);
    const y1 = Math.min(this.y, other.y);
    const y2 = Math.max(this.y + this.height, other.y + other.height);

    outRect.x = x1;
    outRect.y = y1;
    outRect.width = x2 - x1;
    outRect.height = y2 - y1;

    return outRect;
};
