/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
class Point {
    constructor(x, y)
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
    }

    /**
     * Creates a clone of this point
     *
     * @return {PIXI.Point} a copy of the point
     */
    clone()
    {
        return new Point(this.x, this.y);
    }

    /**
     * Copies x and y from the given point
     *
     * @param p {PIXI.Point}
     */
    copy(p) {
        this.set(p.x, p.y);
    }

    /**
     * Returns true if the given point is equal to this point
     *
     * @param p {PIXI.Point}
     * @returns {boolean} Whether the given point equal to this point
     */
    equals(p) {
        return (p.x === this.x) && (p.y === this.y);
    }

    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param [x=0] {number} position of the point on the x axis
     * @param [y=0] {number} position of the point on the y axis
     */
    set(x, y)
    {
        this.x = x || 0;
        this.y = y || ( (y !== 0) ? this.x : 0 ) ;
    }

}

module.exports = Point;
