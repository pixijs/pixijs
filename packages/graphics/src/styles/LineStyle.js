import FillStyle from './FillStyle';

/**
 * Represents the line style for Graphics.
 * @memberof PIXI
 * @class
 * @extends PIXI.FillStyle
 */
export default class LineStyle extends FillStyle
{
    /**
     * Clones the object
     *
     * @return {PIXI.LineStyle}
     */
    clone()
    {
        return this.copyTo(new LineStyle());
    }

    /**
     * Changes the values of the given lineStyle to be the same as the ones in this matrix
     *
     * @param {object} obj - The style to copy to.
     * @return {object} The style given in parameter with its values updated.
     */
    copyTo(obj)
    {
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
