import core from '../../core';
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
class BlurFilter extends core.Filter
{
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
    set blur(value)
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
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
        return  this.blurXFilter.quality;
    }
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
    set blurX(value)
    {
        this.blurXFilter.blur = value;
        this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
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
    set blurY(value)
    {
        this.blurYFilter.blur = value;
        this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
    }
}

export default BlurFilter;
