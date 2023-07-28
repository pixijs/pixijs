import { Filter } from '../../rendering/filters/shared/Filter';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { RendererType } from '../../types';
import { BlurFilterPass } from './BlurFilterPass';

import type { FilterOptions } from '../../rendering/filters/shared/Filter';
import type { FilterSystem } from '../../rendering/filters/shared/FilterSystem';
import type { RenderSurface } from '../../rendering/renderers/gpu/renderTarget/GpuRenderTargetSystem';
import type { BLEND_MODES } from '../../rendering/renderers/shared/state/const';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

export interface BlurFilterOptions extends Partial<FilterOptions>
{
    strength?: number;
    quality?: number;
    resolution?: number;
    kernelSize?: number;
}

/**
 * The BlurFilter applies a Gaussian blur to an object.
 *
 * The strength of the blur can be set for the x-axis and y-axis separately.
 * @memberof PIXI
 */
export class BlurFilter extends Filter
{
    static defaultOptions: Partial<BlurFilterOptions> = {
        strength: 8,
        quality: 4,
        kernelSize: 5,
    };

    public blurXFilter: BlurFilterPass;
    public blurYFilter: BlurFilterPass;

    private _repeatEdgePixels = false;

    /**
     * @param options - The options of the blur filter.
     * @param options.strength - The strength of the blur filter.
     * @param options.quality - The quality of the blur filter.
     * @param options.kernelSize - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(options: BlurFilterOptions = {})
    {
        options = { ...BlurFilterPass.defaultOptions, ...options };

        super({
            ...options,
            compatibleRenderers: RendererType.WEBGL | RendererType.WEBGPU,
            resources: {}
        });

        this.blurXFilter = new BlurFilterPass({ horizontal: false, ...options });
        this.blurYFilter = new BlurFilterPass({ horizontal: true, ...options });

        this.quality = options.quality;
        this.blur = options.strength;

        this.repeatEdgePixels = false;
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - How to clear
     */
    public apply(
        filterManager: FilterSystem,
        input: Texture,
        output: RenderSurface,
        clearMode: boolean
    ): void
    {
        const xStrength = Math.abs(this.blurXFilter.strength);
        const yStrength = Math.abs(this.blurYFilter.strength);

        if (xStrength && yStrength)
        {
            const tempTexture = TexturePool.getSameSizeTexture(input);

            this.blurXFilter.apply(filterManager, input, tempTexture, true);
            this.blurYFilter.apply(filterManager, tempTexture, output, clearMode);

            TexturePool.returnTexture(tempTexture);
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
            this.padding = Math.max(Math.abs(this.blurXFilter.blur), Math.abs(this.blurYFilter.blur)) * 2;
        }
    }

    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
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
