import { Shader } from '../../renderers/shared/shader/Shader';
import { State } from '../../renderers/shared/state/State';

import type { RenderSurface } from '../../renderers/gpu/renderTarget/GpuRenderTargetSystem';
import type { ShaderWithResourcesDescriptor } from '../../renderers/shared/shader/Shader';
import type { BLEND_MODES } from '../../renderers/shared/state/const';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { FilterSystem } from './FilterSystem';

export interface FilterOptions extends ShaderWithResourcesDescriptor
{
    blendMode?: BLEND_MODES;
    resolution?: number;
    padding?: number;
    antialias?: FilterAntiAlias | boolean;
    blendRequired?: boolean;
}

export type FilterAntiAlias = 'on' | 'off' | 'inherit';

export class Filter extends Shader
{
    /**
     * The default filter settings
     * @static
     */
    static readonly defaultOptions: Partial<FilterOptions> = {
        blendMode: 'normal',
        resolution: 1,
        padding: 0,
        antialias: 'inherit',
        blendRequired: false,
    };

    /**
     * The padding of the filter. Some filters require extra space to breath such as a blur.
     * Increasing this will add extra width and height to the bounds of the object that the
     * filter is applied to.
     * @default 0
     */
    public padding: number;

    /**
     * should the filter use antialiasing?
     * @default inherit
     */
    public antialias: FilterAntiAlias;

    /** If enabled is true the filter is applied, if false it will not. */
    public enabled = true;

    /**
     * The WebGL state the filter requires to render.
     * @internal
     */
    _state = State.for2d();

    /**
     * The resolution of the filter. Setting this to be lower will lower the quality but
     * increase the performance of the filter.
     * @default PIXI.Filter.defaultOptions.resolution
     */
    public resolution: number;

    /**
     * Whether or not this filter requires the previous render texture for blending.
     * @default false
     */
    public blendRequired: boolean;

    constructor(options: FilterOptions)
    {
        options = { ...Filter.defaultOptions, ...options };

        super(options);

        this.padding = options.padding;

        // check if is boolean
        if (typeof options.antialias === 'boolean')
        {
            this.antialias = options.antialias ? 'on' : 'off';
        }
        else
        {
            this.antialias = options.antialias ?? 'inherit';
        }

        this.resolution = options.resolution;
        this.blendRequired = options.blendRequired;

        this.addResource('filterUniforms', 0, 0);
        this.addResource('uSampler', 0, 1);
    }

    /**
     * Applies the filter
     * @param filterManager - The renderer to retrieve the filter from
     * @param input - The input render target.
     * @param output - The target to output to.
     * @param clearMode - Should the output be cleared before rendering to it
     */
    public apply(
        filterManager: FilterSystem,
        input: Texture,
        output: RenderSurface,
        clearMode: boolean
    ): void
    {
        filterManager.applyFilter(this, input, output, clearMode);
    }

    /**
     * Sets the blend mode of the filter.
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES
    {
        return this._state.blendMode;
    }

    set blendMode(value: BLEND_MODES)
    {
        this._state.blendMode = value;
    }
}
