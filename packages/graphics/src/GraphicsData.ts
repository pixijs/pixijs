import type { Matrix, SHAPES, IShape } from '@pixi/math';
import type { FillStyle } from './styles/FillStyle';
import type { LineStyle } from './styles/LineStyle';

/**
 * A class to contain data useful for Graphics objects
 *
 * @memberof PIXI
 */
export class GraphicsData
{
    /**
     * The shape object to draw.
     *
     * @member {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle}
     */
    shape: IShape;

    /** The style of the line. */
    lineStyle: LineStyle;

    /** The style of the fill. */
    fillStyle: FillStyle;

    /** The transform matrix. */
    matrix: Matrix;

    /** The type of the shape, see the Const.Shapes file for all the existing types, */
    type: SHAPES;

    /** The collection of points. */
    points: number[] = [];

    /** The collection of holes. */

    holes: Array<GraphicsData> = [];

    /**
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param fillStyle - the width of the line to draw
     * @param lineStyle - the color of the line to draw
     * @param matrix - Transform matrix
     */
    constructor(shape: IShape, fillStyle: FillStyle = null, lineStyle: LineStyle = null, matrix: Matrix = null)
    {
        this.shape = shape;
        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;
        this.matrix = matrix;
        this.type = shape.type;
    }

    /**
     * Creates a new GraphicsData object with the same values as this one.
     *
     * @return - Cloned GraphicsData object
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

    /** Destroys the Graphics data. */
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
