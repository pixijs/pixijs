import { FillStyle } from './FillStyle';

/**
 * Represents the line style for Graphics.
 * @memberof PIXI
 * @class
 * @extends PIXI.FillStyle
 */
export class LineStyle extends FillStyle
{
    /**
     * Clones the object
     *
     * @return {PIXI.LineStyle}
     */
    clone()
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

        return obj;
    }
    /**
     * Reset the line style to default.
     */
    reset()
    {
        super.reset();

        // Override default line style color
        this.color = 0x0;

        /**
         * The width (thickness) of any lines drawn.
         *
         * @member {number}
         * @default 0
         */
        this.width = 0;

        /**
         * The alignment of any lines drawn (0.5 = middle, 1 = outter, 0 = inner).
         *
         * @member {number}
         * @default 0
         */
        this.alignment = 0.5;

        /**
         * If true the lines will be draw using LINES instead of TRIANGLE_STRIP
         *
         * @member {boolean}
         * @default false
         */
        this.native = false;
    }
}
