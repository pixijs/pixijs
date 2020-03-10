import { Filter } from '@pixi/core';
import { settings } from '@pixi/settings';
import { BlurFilterPass } from './BlurFilterPass';
import { CLEAR_MODES } from '@pixi/constants';

import type { RenderTexture, systems } from '@pixi/core';
import type { BLEND_MODES } from '@pixi/constants';

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
    public blurXFilter: BlurFilterPass;
    public blurYFilter: BlurFilterPass;

    private _repeatEdgePixels: boolean;

    /**
     * @param {number} [strength=8] - The strength of the blur filter.
     * @param {number} [quality=4] - The quality of the blur filter.
     * @param {number} [resolution=1] - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(strength = 8, quality = 4, resolution = settings.RESOLUTION, kernelSize = 5)
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
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {PIXI.CLEAR_MODES} clearMode - How to clear
     */
    apply(filterManager: systems.FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void
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
     * @member {number}
     * @default 2
     */
    get blur(): number
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
    get quality(): number
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
    get blurX(): number
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
    get blurY(): number
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
    get blendMode(): BLEND_MODES
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
     * @member {boolean}
     * @default false
     */
    get repeatEdgePixels(): boolean
    {
        return this._repeatEdgePixels;
    }

    set repeatEdgePixels(value)
    {
        this._repeatEdgePixels = value;
        this.updatePadding();
    }
}
