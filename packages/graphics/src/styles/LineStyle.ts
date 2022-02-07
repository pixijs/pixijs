import { FillStyle } from './FillStyle';
import { LINE_JOIN, LINE_CAP } from '../const';

/**
 * Represents the line style for Graphics.
 *
 * @memberof PIXI
 */
export class LineStyle extends FillStyle
{
    /** The width (thickness) of any lines drawn. */
    public width = 0;

    /** The alignment of any lines drawn (0.5 = middle, 1 = outer, 0 = inner). WebGL only. */
    public alignment = 0.5;

    /** If true the lines will be draw using LINES instead of TRIANGLE_STRIP. */
    public native = false;

    /**
     * Line cap style.
     *
     * @member {PIXI.LINE_CAP}
     * @default PIXI.LINE_CAP.BUTT
     */
    public cap = LINE_CAP.BUTT;

    /**
     * Line join style.
     *
     * @member {PIXI.LINE_JOIN}
     * @default PIXI.LINE_JOIN.MITER
     */
    public join = LINE_JOIN.MITER;

    /** Miter limit. */
    public miterLimit = 10;

    /** Clones the object. */
    public clone(): LineStyle
    {
        const obj = new LineStyle();

        obj.color = this.color;
        obj.alpha = this.alpha;
        obj.texture = this.texture;
        obj.matrix = this.matrix;
        obj.visible = this.visible;
        obj.width = this.width;
        obj.alignment = this.alignment;
        obj.native = this.native;
        obj.cap = this.cap;
        obj.join = this.join;
        obj.miterLimit = this.miterLimit;

        return obj;
    }

    /** Reset the line style to default. */
    public reset(): void
    {
        super.reset();

        // Override default line style color
        this.color = 0x0;

        this.alignment = 0.5;
        this.width = 0;
        this.native = false;
    }
}
