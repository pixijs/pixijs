import { Filter } from '@pixi/core';
import { settings } from '@pixi/settings';
import { BlurFilterPass } from './BlurFilterPass';
import { CLEAR_MODES } from '@pixi/constants';

import type { FilterSystem, RenderTexture } from '@pixi/core';
import type { BLEND_MODES } from '@pixi/constants';

/**
 * The BlurFilter applies a Gaussian blur to an object.
 *
 * The strength of the blur can be set for the x-axis and y-axis separately.
 *
 * @memberof PIXI.filters
 */
export class BlurFilter extends Filter
{
    public blurXFilter: BlurFilterPass;
    public blurYFilter: BlurFilterPass;

    private _repeatEdgePixels: boolean;

    /**
     * @param strength - The strength of the blur filter.
     * @param quality - The quality of the blur filter.
     * @param [resolution=PIXI.settings.FILTER_RESOLUTION] - The resolution of the blur filter.
     * @param kernelSize - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(strength = 8, quality = 4, resolution = settings.FILTER_RESOLUTION, kernelSize = 5)
    {
        super();

        this.blurXFilter = new BlurFilterPass(true, strength, quality, resolution, kernelSize);
        this.blurYFilter = new BlurFilterPass(false, strength, quality, resolution, kernelSize);

        this.resolution = resolution;
        this.quality = quality;
        this.blur = strength;

        this.repeatEdgePixels = false;
    }

    /**
     * Applies the filter.
     *
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - How to clear
     */
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void
    {
        const xStrength = Math.abs(this.blurXFilter.strength);
        const yStrength = Math.abs(this.blurYFilter.strength);

        if (xStrength && yStrength)
        {
            const renderTarget = filterManager.getFilterTexture();

            this.blurXFilter.apply(filterManager, input, renderTarget, CLEAR_MODES.CLEAR);
            this.blurYFilter.apply(filterManager, renderTarget, output, clearMode);

            filterManager.returnFilterTexture(renderTarget);
        }
        else if (yStrength)
        {
            this.blurYFilter.apply(filterManager, input, output, clearMode);
        }
        else
        {
            this.blurXFilter.apply(filterManager, input, output, clearMode);
        }
    }

    protected updatePadding(): void
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
     * @default 2
     */
    get blur(): number
    {
        return this.blurXFilter.blur;
    }

    set blur(value: number)
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.updatePadding();
    }

    /**
     * Sets the number of passes for blur. More passes means higher quality bluring.
     *
     * @default 1
     */
    get quality(): number
    {
        return this.blurXFilter.quality;
    }

    set quality(value: number)
    {
        this.blurXFilter.quality = this.blurYFilter.quality = value;
    }

    /**
     * Sets the strength of the blurX property
     *
     * @default 2
     */
    get blurX(): number
    {
        return this.blurXFilter.blur;
    }

    set blurX(value: number)
    {
        this.blurXFilter.blur = value;
        this.updatePadding();
    }

    /**
     * Sets the strength of the blurY property
     *
     * @default 2
     */
    get blurY(): number
    {
        return this.blurYFilter.blur;
    }

    set blurY(value: number)
    {
        this.blurYFilter.blur = value;
        this.updatePadding();
    }

    /**
     * Sets the blendmode of the filter
     *
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES
    {
        return this.blurYFilter.blendMode;
    }

    set blendMode(value: BLEND_MODES)
    {
        this.blurYFilter.blendMode = value;
    }

    /**
     * If set to true the edge of the target will be clamped
     *
     * @default false
     */
    get repeatEdgePixels(): boolean
    {
        return this._repeatEdgePixels;
    }

    set repeatEdgePixels(value: boolean)
    {
        this._repeatEdgePixels = value;
        this.updatePadding();
    }
}
