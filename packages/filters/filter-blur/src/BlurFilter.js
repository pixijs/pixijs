import { Filter } from '@pixi/core';
import { settings } from '@pixi/settings';
import { BlurFilterPass } from './BlurFilterPass';

/**
 * The BlurFilter applies a Gaussian blur to an object.
 *
 * The strength of the blur can be set for the x-axis and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export class BlurFilter extends Filter
{
    /**
     * @param {number} [strength=8] - The strength of the blur filter.
     * @param {number} [quality=4] - The quality of the blur filter.
     * @param {number} [resolution] - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(strength, quality, resolution, kernelSize)
    {
        super();

        this.blurXFilter = new BlurFilterPass(true, strength, quality, resolution, kernelSize);
        this.blurYFilter = new BlurFilterPass(false, strength, quality, resolution, kernelSize);

        this.resolution = resolution || settings.RESOLUTION;
        this.quality = quality || 4;
        this.blur = strength || 8;

        this.repeatEdgePixels = false;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     */
    apply(filterManager, input, output, clear)
    {
        const xStrength = Math.abs(this.blurXFilter.strength);
        const yStrength = Math.abs(this.blurYFilter.strength);

        if (xStrength && yStrength)
        {
            const renderTarget = filterManager.getFilterTexture();

            this.blurXFilter.apply(filterManager, input, renderTarget, true);
            this.blurYFilter.apply(filterManager, renderTarget, output, clear);

            filterManager.returnFilterTexture(renderTarget);
        }
        else if (yStrength)
        {
            this.blurYFilter.apply(filterManager, input, output, clear);
        }
        else
        {
            this.blurXFilter.apply(filterManager, input, output, clear);
        }
    }

    updatePadding()
    {
        if (this._repeatEdgePixels)
        {
            this.padding = 0;
        }
        else
        {
            this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
        }
    }

    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @default 2
     */
    get blur()
    {
        return this.blurXFilter.blur;
    }

    set blur(value) // eslint-disable-line require-jsdoc
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.updatePadding();
    }

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    get quality()
    {
        return this.blurXFilter.quality;
    }

    set quality(value) // eslint-disable-line require-jsdoc
    {
        this.blurXFilter.quality = this.blurYFilter.quality = value;
    }

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @default 2
     */
    get blurX()
    {
        return this.blurXFilter.blur;
    }

    set blurX(value) // eslint-disable-line require-jsdoc
    {
        this.blurXFilter.blur = value;
        this.updatePadding();
    }

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @default 2
     */
    get blurY()
    {
        return this.blurYFilter.blur;
    }

    set blurY(value) // eslint-disable-line require-jsdoc
    {
        this.blurYFilter.blur = value;
        this.updatePadding();
    }

    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode()
    {
        return this.blurYFilter.blendMode;
    }

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        this.blurYFilter.blendMode = value;
    }

    /**
     * If set to true the edge of the target will be clamped
     *
     * @member {bool}
     * @default false
     */
    get repeatEdgePixels()
    {
        return this._repeatEdgePixels;
    }

    set repeatEdgePixels(value)
    {
        this._repeatEdgePixels = value;
        this.updatePadding();
    }
}
