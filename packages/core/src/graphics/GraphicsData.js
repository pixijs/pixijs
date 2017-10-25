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
         * @member {number} the width of the line to draw
         */
        this.lineWidth = lineWidth;
        /**
         * @member {boolean} if true the liens will be draw using LINES instead of TRIANGLE_STRIP
         */
        this.nativeLines = nativeLines;

        /**
         * @member {number} the color of the line to draw
         */
        this.lineColor = lineColor;

        /**
         * @member {number} the alpha of the line to draw
         */
        this.lineAlpha = lineAlpha;

        /**
         * @member {number} cached tint of the line to draw
         */
        this._lineTint = lineColor;

        /**
         * @member {number} the color of the fill
         */
        this.fillColor = fillColor;

        /**
         * @member {number} the alpha of the fill
         */
        this.fillAlpha = fillAlpha;

        /**
         * @member {number} cached tint of the fill
         */
        this._fillTint = fillColor;

        /**
         * @member {boolean} whether or not the shape is filled with a colour
         */
        this.fill = fill;

        this.holes = [];

        /**
         * @member {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} The shape object to draw.
         */
        this.shape = shape;

        /**
         * @member {number} The type of the shape, see the Const.Shapes file for all the existing types,
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
