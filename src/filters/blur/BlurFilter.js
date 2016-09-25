import * as core from '../../core';
import BlurXFilter from './BlurXFilter';
import BlurYFilter from './BlurYFilter';

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export default class BlurFilter extends core.Filter
{
    /**
     * @param {number} strength - The strength of the blur filter.
     * @param {number} quality - The quality of the blur filter.
     * @param {number} resolution - The reoslution of the blur filter.
     */
    constructor(strength, quality, resolution)
    {
        super();

        this.blurXFilter = new BlurXFilter();
        this.blurYFilter = new BlurYFilter();
        this.resolution = 1;

        this.padding = 0;
        this.resolution = resolution || 1;
        this.quality = quality || 4;
        this.blur = strength || 8;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.FilterManager} filterManager - The manager.
     * @param {PIXI.RenderTarget} input - The input target.
     * @param {PIXI.RenderTarget} output - The output target.
     */
    apply(filterManager, input, output)
    {
        const renderTarget = filterManager.getRenderTarget(true);

        this.blurXFilter.apply(filterManager, input, renderTarget, true);
        this.blurYFilter.apply(filterManager, renderTarget, output, false);

        filterManager.returnRenderTarget(renderTarget);
    }

    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    get blur()
    {
        return this.blurXFilter.blur;
    }

    /**
     * Sets the strength of the blur.
     *
     * @param {number} value - The value to set.
     */
    set blur(value)
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.padding = Math.max(Math.abs(this.blurYFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 1
     */
    get quality()
    {
        return this.blurXFilter.quality;
    }

    /**
     * Sets the quality of the blur.
     *
     * @param {number} value - The value to set.
     */
    set quality(value)
    {
        this.blurXFilter.quality = this.blurYFilter.quality = value;
    }

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    get blurX()
    {
        return this.blurXFilter.blur;
    }

    /**
     * Sets the strength of the blurX.
     *
     * @param {number} value - The value to set.
     */
    set blurX(value)
    {
        this.blurXFilter.blur = value;
        this.padding = Math.max(Math.abs(this.blurYFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    get blurY()
    {
        return this.blurYFilter.blur;
    }

    /**
     * Sets the strength of the blurY.
     *
     * @param {number} value - The value to set.
     */
    set blurY(value)
    {
        this.blurYFilter.blur = value;
        this.padding = Math.max(Math.abs(this.blurYFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }
}
