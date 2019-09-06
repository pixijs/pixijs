/**
 * A structure to hold interim batch objects.
 *
 */
export class BatchPart
{
    constructor()
    {
        this.reset();
    }

    /**
     * Begin batch part
     *
     * @param {PIXI.FillStyle | PIXI.LineStyle} style
     * @param {number} startIndex
     * @param {number} attribStart
     */
    begin(style, startIndex, attribStart)
    {
        this.reset();
        this.style = style;
        this.start = startIndex;
        this.attribStart = attribStart;
    }

    /**
     * End batch part
     *
     * @param {number} endIndex
     * @param {number} endAttrib
     */
    end(endIndex, endAttrib)
    {
        this.attribSize = endAttrib - this.attribStart;
        this.size = endIndex - this.start;
    }

    reset()
    {
        this.style = null;
        this.size = 0;
        this.start = 0;
        this.attribStart = 0;
        this.attribSize = 0;
    }
}
