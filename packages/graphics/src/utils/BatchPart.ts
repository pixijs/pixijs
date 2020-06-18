import type { LineStyle } from '../styles/LineStyle';
import type { FillStyle } from '../styles/FillStyle';

/**
 * A structure to hold interim batch objects for Graphics.
 * @class
 * @memberof PIXI.graphicsUtils
 */
export class BatchPart
{
    public style: LineStyle | FillStyle;
    public start: number;
    public size: number;
    public attribStart: number;
    public attribSize: number;

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
    public begin(style: LineStyle | FillStyle, startIndex: number, attribStart: number): void
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
    public end(endIndex: number, endAttrib: number): void
    {
        this.attribSize = endAttrib - this.attribStart;
        this.size = endIndex - this.start;
    }

    public reset(): void
    {
        this.style = null;
        this.size = 0;
        this.start = 0;
        this.attribStart = 0;
        this.attribSize = 0;
    }
}
