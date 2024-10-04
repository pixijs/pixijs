import { GlProgram } from '../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../rendering/renderers/gpu/shader/GpuProgram';
import { Shader } from '../rendering/renderers/shared/shader/Shader';
import { State } from '../rendering/renderers/shared/state/State';

import type { RenderSurface } from '../rendering/renderers/shared/renderTarget/RenderTargetSystem';
import type {
    IShaderWithResources,
    ShaderFromResources,
    ShaderWithResources
} from '../rendering/renderers/shared/shader/Shader';
import type { BLEND_MODES } from '../rendering/renderers/shared/state/const';
import type { Texture } from '../rendering/renderers/shared/texture/Texture';
import type { FilterSystem } from './FilterSystem';

/**
 * Filters provide additional shading and post-processing effects to any display object and its children
 * they are attached to.
 *
 * You attached filters to a display object using its `filters` array property.
 *
 * ```js
 * import { Sprite, BlurFilter, HardMixBlend } from 'pixi.js';
 *
 * const sprite = Sprite.from('myTexture.png');
 *
 * // single filter
 * sprite.filters = new BlurFilter({ strength: 8 });
 *
 * // or multiple filters
 * sprite.filters = [new BlurFilter({ strength: 8 }), new HardMixBlend()];
 * ```
 *
 * Pixi has a number of built-in filters which can be used in your game or application:
 *
 * - {@link filters.AlphaFilter} - Applies alpha to the display object and any of its children.
 * - {@link filters.BlurFilter} - Applies a Gaussian blur to the display object.
 * - {@link filters.BlurFilterPass} - Applies a blur pass to an object.
 * - {@link filters.ColorBurnBlend} - Blend mode to add color burn to display objects.
 * - {@link filters.ColorDodgeBlend} - Blend mode to add color dodge to display objects.
 * - {@link filters.ColorMatrixFilter} - Transform the color channels by matrix multiplication.
 * - {@link filters.DarkenBlend} - Blend mode to darken display objects.
 * - {@link filters.DisplacementFilter} - Applies a displacement map to distort an object.
 * - {@link filters.DivideBlend} - Blend mode to divide display objects.
 * - {@link filters.HardMixBlend} - Blend mode to hard mix display objects.
 * - {@link filters.LinearBurnBlend} - Blend mode to add linear burn to display objects.
 * - {@link filters.LinearDodgeBlend} - Blend mode to add linear dodge to display objects.
 * - {@link filters.LinearLightBlend} - Blend mode to add linear light to display objects.
 * - {@link filters.NoiseFilter} - Applies random noise to an object.
 * - {@link filters.PinLightBlend} - Blend mode to add pin light to display objects.
 * - {@link filters.SubtractBlend} - Blend mode to subtract display objects.
 *
 * <br/>
 * For more available filters, check out the
 *  {@link https://pixijs.io/filters/docs/ pixi-filters} repository.
 *
 * You can also check out the awesome {@link https://pixijs.io/filters/examples/ Filter demo} to see
 * filters in action and combine them!
 * @namespace filters
 */

/**
 * The options to use when creating a new filter.
 * @memberof filters
 */
export interface FilterOptions
{
    /** optional blend mode used by the filter when rendering (defaults to 'normal') */
    blendMode?: BLEND_MODES;
    /**
     * the resolution the filter should be rendered at. The lower the resolution, the more performant
     * the filter will be, but the lower the quality of the output. (default 1)
     * If 'inherit', the resolution of the render target is used.
     * Consider lowering this for things like blurs filters
     */
    resolution?: number | 'inherit';
    /**
     * the amount of pixels to pad the container with when applying the filter. For example a blur extends the
     * container out as it blurs, so padding is applied to ensure that extra detail is rendered as well
     * without clipping occurring. (default 0)
     */
    padding?: number;
    /**
     * If true the filter will make use of antialiasing. Although it looks better this can have a performance impact.
     * If set to 'inherit', the filter will detect the antialiasing of the render target and change this automatically.
     * Definitely don't set this to true if the render target has antialiasing set to false. As it will antialias,
     * but you won't see the difference. (default 'off')
     *
     * This can be a boolean or [FilterAntialias]{@link filters.FilterAntialias} string.
     */
    antialias?: FilterAntialias | boolean;
    /**
     * If this is set to true, the filter system will grab a snap shot of the area being rendered
     * to and pass this into the shader. This is useful for blend modes that need to be aware of the pixels
     * they are rendering to. Only use if you need that data, otherwise its an extra gpu copy you don't need!
     * (default false)
     */
    blendRequired?: boolean;
    /**
     * If this is set to true, the filter system will clip filter texture into viewport
     * This is useful for filters that applied to whole texture.
     * (default true)
     */
    clipToViewport?: boolean;
}

/** Filter options mixed with shader resources. A filter needs a shader and some resources to work. */
export type FilterWithShader = FilterOptions & IShaderWithResources;

/**
 * The antialiasing mode of the filter. This can be either:
 * - `on` - the filter is always antialiased regardless of the render target settings
 * - `off` - (default) the filter is never antialiased regardless of the render target settings
 * - `inherit` - the filter uses the antialias settings of the render target
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
    public static readonly defaultOptions: FilterOptions = {
        blendMode: 'normal',
        resolution: 1,
        padding: 0,
        antialias: 'off',
        blendRequired: false,
        clipToViewport: true,
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
    public resolution: number | 'inherit';

    /**
     * Whether or not this filter requires the previous render texture for blending.
     * @default false
     */
    public blendRequired: boolean;

    /**
     * Clip texture into viewport or not
     * @default true
     */
    public clipToViewport: boolean;

    /**
     * @param options - The optional parameters of this filter.
     */
    constructor(options: FilterWithShader)
    {
        options = { ...Filter.defaultOptions, ...options };

        super(options as ShaderWithResources);

        this.blendMode = options.blendMode;
        this.padding = options.padding;

        // check if is boolean
        if (typeof options.antialias === 'boolean')
        {
            this.antialias = options.antialias ? 'on' : 'off';
        }
        else
        {
            this.antialias = options.antialias;
        }

        this.resolution = options.resolution;
        this.blendRequired = options.blendRequired;
        this.clipToViewport = options.clipToViewport;

        this.addResource('uTexture', 0, 1);
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

    /**
     * A short hand function to create a filter based of a vertex and fragment shader src.
     * @param options
     * @returns A shiny new PixiJS filter!
     */
    public static from(options: FilterOptions & ShaderFromResources): Filter
    {
        const { gpu, gl, ...rest } = options;

        let gpuProgram: GpuProgram;
        let glProgram: GlProgram;

        if (gpu)
        {
            gpuProgram = GpuProgram.from(gpu);
        }

        if (gl)
        {
            glProgram = GlProgram.from(gl);
        }

        return new Filter({
            gpuProgram,
            glProgram,
            ...rest
        });
    }
}
