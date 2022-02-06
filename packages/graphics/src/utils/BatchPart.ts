import type { LineStyle } from '../styles/LineStyle';
import type { FillStyle } from '../styles/FillStyle';

/**
 * A structure to hold interim batch objects for Graphics.
 *
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

    /** Begin batch part. */
    public begin(style: LineStyle | FillStyle, startIndex: number, attribStart: number): void
    {
        this.reset();
        this.style = style;
        this.start = startIndex;
        this.attribStart = attribStart;
    }

    /** End batch part. */
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
