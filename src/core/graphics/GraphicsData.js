/**
 * A GraphicsData object.
 *
 * @class
 * @memberof PIXI
 */
export default class GraphicsData
{
    /**
     *
     * @param {number} lineWidth - the width of the line to draw
     * @param {number} lineColor - the color of the line to draw
     * @param {number} lineAlpha - the alpha of the line to draw
     * @param {number} fillColor - the color of the fill
     * @param {number} fillAlpha - the alpha of the fill
     * @param {boolean} fill - whether or not the shape is filled with a colour
     * @param {boolean} nativeLines - the method for drawing lines
     * @param {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Polygon} shape - The shape object to draw.
     */
    constructor(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, nativeLines, shape)
    {
        /**
         * the width of the line to draw
         * @member {number}
         */
        this.lineWidth = lineWidth;

        /**
         * if true the liens will be draw using LINES instead of TRIANGLE_STRIP
         * @member {boolean}
         */
        this.nativeLines = nativeLines;

        /**
         * the color of the line to draw
         * @member {number}
         */
        this.lineColor = lineColor;

        /**
         * the alpha of the line to draw
         * @member {number}
         */
        this.lineAlpha = lineAlpha;

        /**
         * cached tint of the line to draw
         * @member {number}
         */
        this._lineTint = lineColor;

        /**
         * the color of the fill
         * @member {number}
         */
        this.fillColor = fillColor;

        /**
         * the alpha of the fill
         * @member {number}
         */
        this.fillAlpha = fillAlpha;

        /**
         * cached tint of the fill
         * @member {number}
         */
        this._fillTint = fillColor;

        /**
         * whether or not the shape is filled with a colour
         * @member {boolean}
         */
        this.fill = fill;

        this.holes = [];

        /**
         * The shape object to draw.
         * @member {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle}
         */
        this.shape = shape;

        /**
         * The type of the shape, see the Const.Shapes file for all the existing types,
         * @member {number}
         */
        this.type = shape.type;
    }

    /**
     * Creates a new GraphicsData object with the same values as this one.
     *
     * @return {PIXI.GraphicsData} Cloned GraphicsData object
     */
    clone()
    {
        return new GraphicsData(
            this.lineWidth,
            this.lineColor,
            this.lineAlpha,
            this.fillColor,
            this.fillAlpha,
            this.fill,
            this.nativeLines,
            this.shape
        );
    }

    /**
     * Adds a hole to the shape.
     *
     * @param {PIXI.Rectangle|PIXI.Circle} shape - The shape of the hole.
     */
    addHole(shape)
    {
        this.holes.push(shape);
    }

    /**
     * Destroys the Graphics data.
     */
    destroy()
    {
        this.shape = null;
        this.holes = null;
    }
}
