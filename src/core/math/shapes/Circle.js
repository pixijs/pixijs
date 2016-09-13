import Rectangle from './Rectangle';
import CONST from '../../const';

/**
 * The Circle object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of this circle
 * @param y {number} The Y coordinate of the center of this circle
 * @param radius {number} The radius of the circle
 */
class Circle
{
    constructor(x, y, radius)
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
        this.radius = radius || 0;

        /**
         * The type of the object, mainly used to avoid `instanceof` checks
         *
         * @member {number}
         * @readOnly
         * @default CONST.SHAPES.CIRC
         * @see PIXI.SHAPES
         */
        this.type = CONST.SHAPES.CIRC;
    }

    /**
     * Creates a clone of this Circle instance
     *
     * @return {PIXI.Circle} a copy of the Circle
     */
    clone()
    {
        return new Circle(this.x, this.y, this.radius);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this circle
     *
     * @param x {number} The X coordinate of the point to test
     * @param y {number} The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coordinates are within this Circle
     */
    contains(x, y)
    {
        if (this.radius <= 0)
        {
            return false;
        }

        let dx = (this.x - x),
            dy = (this.y - y),
            r2 = this.radius * this.radius;

        dx *= dx;
        dy *= dy;

        return (dx + dy <= r2);
    }

    /**
    * Returns the framing rectangle of the circle as a Rectangle object
    *
    * @return {PIXI.Rectangle} the framing rectangle
    */
    getBounds()
    {
        return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

export default Circle;