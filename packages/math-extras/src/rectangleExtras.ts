import { Rectangle } from '@pixi/math';

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

Rectangle.prototype.containsRect = function containsRect(other: Rectangle): boolean
{
    if (other.width <= 0 || other.height <= 0)
    {
        return other.x > this.x && other.y > this.y && other.right < this.right && other.bottom < this.bottom;
    }

    return other.x >= this.x && other.y >= this.y && other.right <= this.right && other.bottom <= this.bottom;
};

Rectangle.prototype.equals = function equals(other: Rectangle): boolean
{
    if (other === this)
    {
        return true;
    }

    return other && this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
};

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
