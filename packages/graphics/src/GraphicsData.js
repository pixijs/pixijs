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
     * @param {number} lineAlignment - the alignment of the line.
     */
    constructor(shape, fillStyle, lineStyle, matrix)
    {
        /**
         * The shape object to draw.
         * @member {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle}
         */
        this.shape = shape;

        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;

        this.matrix = matrix;

        /**
         * The type of the shape, see the Const.Shapes file for all the existing types,
         * @member {number}
         */
        this.type = shape.type;

        this.points = [];
        this.holes = [];
    }

    /**
     * Creates a new GraphicsData object with the same values as this one.
     *
     * @return {PIXI.GraphicsData} Cloned GraphicsData object
     */
    clone()
    {
        return new GraphicsData(
            this.shape,
            this.lineStyle,
            this.fillStyle
        );
    }

    /**
     * Destroys the Graphics data.
     */
    destroy()
    {
        this.shape = null;
        this.holes = null;

        this.lineStyle = null;
        this.fillStyle = null;
    }
}
