import FillStyle from './FillStyle';

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

        this.native = false;
    }
}
