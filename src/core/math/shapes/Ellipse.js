let Rectangle = require('./Rectangle'),
    CONST = require('../../const');

/**
 * The Ellipse object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of the ellipse
 * @param y {number} The Y coordinate of the center of the ellipse
 * @param width {number} The half width of this ellipse
 * @param height {number} The half height of this ellipse
 */
class Ellipse {
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
         * @default CONST.SHAPES.ELIP
         * @see PIXI.SHAPES
         */
        this.type = CONST.SHAPES.ELIP;
    }

    /**
     * Creates a clone of this Ellipse instance
     *
     * @return {PIXI.Ellipse} a copy of the ellipse
     */
    clone()
    {
        return new Ellipse(this.x, this.y, this.width, this.height);
    }

    /**
     * Checks whether the x and y coordinates given are contained within this ellipse
     *
     * @param x {number} The X coordinate of the point to test
     * @param y {number} The Y coordinate of the point to test
     * @return {boolean} Whether the x/y coords are within this ellipse
     */
    contains(x, y)
    {
        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }

        //normalize the coords to an ellipse with center 0,0
        let normx = ((x - this.x) / this.width),
            normy = ((y - this.y) / this.height);

        normx *= normx;
        normy *= normy;

        return (normx + normy <= 1);
    }

    /**
     * Returns the framing rectangle of the ellipse as a Rectangle object
     *
     * @return {PIXI.Rectangle} the framing rectangle
     */
    getBounds()
    {
        return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
    }
}

module.exports = Ellipse;
