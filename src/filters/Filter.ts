import { Shader } from '../rendering/renderers/shared/shader/Shader';
import { State } from '../rendering/renderers/shared/state/State';

import type { RenderSurface } from '../rendering/renderers/shared/renderTarget/RenderTargetSystem';
import type { ShaderWithResourcesDescriptor } from '../rendering/renderers/shared/shader/Shader';
import type { BLEND_MODES } from '../rendering/renderers/shared/state/const';
import type { Texture } from '../rendering/renderers/shared/texture/Texture';
import type { FilterSystem } from './FilterSystem';

/**
 * @namespace filters
 */

/**
 * The options to use when creating a new filter.
 * @memberof filters
 */
export interface FilterOptions extends ShaderWithResourcesDescriptor
{
    /** optional blend mode used by the filter when rendererig (defaults to 'normal') */
    blendMode?: BLEND_MODES;
    /**
     * the resolution the filter should be rendered at. The lower the resolution, the more performant
     * the filter will be, but the lower the quality of the output. (defaults to the renderers resolution)
     * Consider lowering this for things like blurs filters
     */
    resolution?: number;
    /**
     * the amount of pixels to pad the container with when applying the filter. For example a blur extends the
     * container out as it blurs, so padding is applied to ensure that extra detail is rendered as well
     * without clipping occurring. (default 0)
     */
    padding?: number;
    /**
     * If true the filter will make use of antialiasing. Although it looks better this can have a performance impact.
     * By default, the filter will detect the antialiasing of the renderer and change this automatically.
     * Definitely don't set this to true if the renderer has antialiasing set to false. As it will antialias,
     * but you won't see the difference.
     *
     * This can be a boolean or [FilterAntialias]{@link filters.FilterAntialias} string.
     */
    antialias?: FilterAntialias | boolean;
    /**
     * If this is set to true, the filter system will grab a snap shot oif the are being rendered
     * to and pass this into the shader. This is useful for blend modes that need to be aware of the pixels
     * they are rendering to. Only use if you need that data, otherwise its an extra gpu copy you don't need!
     * (default false)
     */
    blendRequired?: boolean;
}

/**
 * The antialiasing mode of the filter. This can be either:
 * - `on` - the filter is always antialiased regardless of the renderer settings
 * - `off` - the filter is never antialiased regardless of the renderer settings
 * - `inherit` - (default) the filter uses the antialias settings of the renderer
 * @memberof filters
 */
export type FilterAntialias = 'on' | 'off' | 'inherit';

/**
 * The Filter class is the base for all filter effects used in Pixi.js
 * As it extends a shader, it requires that a glProgram is parsed in to work with WebGL and a gpuProgram for WebGPU.
 * If you don't proved one, then the filter is skipped and just rendered as if it wasn't there for that renderer.
 *
 * A filter can be applied to anything that extends Container in Pixi.js which also includes Sprites, Graphics etc.
 *
 * Its worth noting Performance-wise filters can be pretty expensive if used too much in a single scene.
 * The following happens under the hood when a filter is applied:
 *
 * .1. Break the current batch
 * <br>
 * .2. The target is measured using getGlobalBounds
 * (recursively go through all children and figure out how big the object is)
 * <br>
 * .3. Get the closest Po2 Textures from the texture pool
 * <br>
 * .4. Render the target to that texture
 * <br>
 * .5. Render that texture back to the main frame buffer as a quad using the filters program.
 * <br>
 * <br>
 * Some filters (such as blur) require multiple passes too which can result in an even bigger performance hit. So be careful!
 * Its not generally the complexity of the shader that is the bottle neck,
 * but all the framebuffer / shader switching that has to take place.
 * One filter applied to a container with many objects is MUCH faster than many filter applied to many objects.
 * @class
 * @memberof filters
 */
export class Filter extends Shader
{
    /**
     * The default filter settings
     * @static
     */
    public static readonly defaultOptions: Partial<FilterOptions> = {
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
    public antialias: FilterAntialias;

    /** If enabled is true the filter is applied, if false it will not. */
    public enabled = true;

    /**
     * The gpu state the filter requires to render.
     * @internal
     * @ignore
     */
    public _state = State.for2d();

    /**
     * The resolution of the filter. Setting this to be lower will lower the quality but
     * increase the performance of the filter.
     * @default 1
     */
    public resolution: number;

    /**
     * Whether or not this filter requires the previous render texture for blending.
     * @default false
     */
    public blendRequired: boolean;

    /**
     * @param options - The optional parameters of this filter.
     */
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
     * Get the blend mode of the filter.
     * @default "normal"
     */
    get blendMode(): BLEND_MODES
    {
        return this._state.blendMode;
    }

    /** Sets the blend mode of the filter. */
    set blendMode(value: BLEND_MODES)
    {
        this._state.blendMode = value;
    }
}
