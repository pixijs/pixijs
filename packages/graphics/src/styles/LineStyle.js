import FillStyle from './FillStyle';

/**
 * Represents the line style for Graphics.
 * @memberof PIXI
 * @class
 * @extends PIXI.FillStyle
 */
export default class LineStyle extends FillStyle
{
    constructor()
    {
        super();

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

    /**
     * Reset the line style to default.
     */
    reset()
    {
        super.reset();
        this.alignment = 0.5;
        this.native = false;
        this.width = 0;
    }
}
