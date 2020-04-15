import { FillStyle } from './FillStyle';
import { LINE_JOIN, LINE_CAP } from '@pixi/constants';

/**
 * Represents the line style for Graphics.
 * @memberof PIXI
 * @class
 * @extends PIXI.FillStyle
 */
export class LineStyle extends FillStyle
{
    /**
     * The width (thickness) of any lines drawn.
     *
     * @member {number}
     * @default 0
     */
    public width = 0;

    /**
     * The alignment of any lines drawn (0.5 = middle, 1 = outer, 0 = inner).
     *
     * @member {number}
     * @default 0.5
     */
    public alignment = 0.5;

    /**
     * If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     *
     * @member {boolean}
     * @default false
     */
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

    /**
     * Miter limit.
     *
     * @member {number}
     * @default 10
     */
    public miterLimit = 10;

    /**
     * Clones the object
     *
     * @return {PIXI.LineStyle}
     */
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

    /**
     * Reset the line style to default.
     */
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
