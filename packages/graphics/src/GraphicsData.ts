import type { Matrix, SHAPES, IShape } from '@pixi/math';
import type { FillStyle } from './styles/FillStyle';
import type { LineStyle } from './styles/LineStyle';

/**
 * A class to contain data useful for Graphics objects
 *
 * @class
 * @memberof PIXI
 */
export class GraphicsData
{
    shape: IShape;
    lineStyle: LineStyle;
    fillStyle: FillStyle;
    matrix: Matrix;
    type: SHAPES;
    points: number[];
    holes: Array<GraphicsData>;
    /**
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.FillStyle} [fillStyle] - the width of the line to draw
     * @param {PIXI.LineStyle} [lineStyle] - the color of the line to draw
     * @param {PIXI.Matrix} [matrix] - Transform matrix
     */
    constructor(shape: IShape, fillStyle: FillStyle = null, lineStyle: LineStyle = null, matrix: Matrix = null)
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
    public clone(): GraphicsData
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
     *
     */
    public destroy(): void
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
