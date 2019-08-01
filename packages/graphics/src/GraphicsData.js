/**
 * A class to contain data useful for Graphics objects
 *
 * @class
 * @memberof PIXI
 */
export class GraphicsData
{
    /**
     *
     * @param {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Polygon} shape - The shape object to draw.
     * @param {PIXI.FillStyle} [fillStyle] - the width of the line to draw
     * @param {PIXI.LineStyle} [lineStyle] - the color of the line to draw
     * @param {PIXI.Matrix} [matrix] - Transform matrix
     */
    constructor(shape, fillStyle = null, lineStyle = null, matrix = null)
    {
        /**
         * The shape object to draw.
         * @member {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle}
         */
        this.shape = shape;

        /**
         * The style of the line.
         * @member {PIXI.LineStyle}
         */
        this.lineStyle = lineStyle;

        /**
         * The style of the fill.
         * @member {PIXI.FillStyle}
         */
        this.fillStyle = fillStyle;

        /**
         * The transform matrix.
         * @member {PIXI.Matrix}
         */
        this.matrix = matrix;

        /**
         * The type of the shape, see the Const.Shapes file for all the existing types,
         * @member {number}
         */
        this.type = shape.type;

        /**
         * The collection of points.
         * @member {number[]}
         */
        this.points = [];

        /**
         * The collection of holes.
         * @member {PIXI.GraphicsData[]}
         */
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
            this.fillStyle,
            this.lineStyle,
            this.matrix
        );
    }

    /**
     * Destroys the Graphics data.
     */
    destroy()
    {
        this.shape = null;
        this.holes.length = 0;
        this.holes = null;
        this.points.length = 0;
        this.points = null;
        this.lineStyle = null;
        this.fillStyle = null;
    }
}
