import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './alpha.frag';
import source from './alpha.wgsl';

import type { FilterOptions } from '../../Filter';

/**
 * Options for AlphaFilter
 * @category filters
 * @standard
 */
export interface AlphaFilterOptions extends FilterOptions
{
    /**
     * Amount of alpha from 0 to 1, where 0 is transparent
     * @default 1
     */
    alpha: number;
}

/**
 * Simplest filter - applies alpha.
 *
 * Use this instead of Container's alpha property to avoid visual layering of individual elements.
 * AlphaFilter applies alpha evenly across the entire display object and any opaque elements it contains.
 * If elements are not opaque, they will blend with each other anyway.
 *
 * Very handy if you want to use common features of all filters:
 *
 * 1. Assign a blendMode to this filter, blend all elements inside display object with background.
 *
 * 2. To use clipping in display coordinates, assign a filterArea to the same container that has this filter.
 * @category filters
 * @standard
 * @noInheritDoc
 * @example
 * import { AlphaFilter } from 'pixi.js';
 *
 * const filter = new AlphaFilter({ alpha: 0.5 });
 * sprite.filters = filter;
 *
 * // update alpha
 * filter.alpha = 0.8;
 */
export class AlphaFilter extends Filter
{
    /**
     * Default options for the AlphaFilter.
     * @example
     * ```ts
     * AlphaFilter.defaultOptions = {
     *     alpha: 0.5, // Default alpha value
     * };
     * // Use default options
     * const filter = new AlphaFilter(); // Uses default alpha of 0.5
     * ```
     */
    public static defaultOptions: AlphaFilterOptions = {
        /**
         * Amount of alpha transparency to apply.
         * - 0 = fully transparent
         * - 1 = fully opaque (default)
         * @default 1
         */
        alpha: 1,
    };

    constructor(options?: AlphaFilterOptions)
    {
        options = { ...AlphaFilter.defaultOptions, ...options };

        const gpuProgram = GpuProgram.from({
            vertex: {
                source,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source,
                entryPoint: 'mainFragment',
            },
        });

        const glProgram = GlProgram.from({
            vertex,
            fragment,
            name: 'alpha-filter'
        });

        const { alpha, ...rest } = options;

        const alphaUniforms = new UniformGroup({
            uAlpha: { value: alpha, type: 'f32' },
        });

        super({
            ...rest,
            gpuProgram,
            glProgram,
            resources: {
                alphaUniforms
            },
        });
    }

    /**
     * The alpha value of the filter.
     * Controls the transparency of the filtered display object.
     * @example
     * ```ts
     * // Create filter with initial alpha
     * const filter = new AlphaFilter({ alpha: 0.5 });
     *
     * // Update alpha value dynamically
     * filter.alpha = 0.8;
     * ```
     * @default 1
     * @remarks
     * - 0 = fully transparent
     * - 1 = fully opaque
     * - Values are clamped between 0 and 1
     */
    get alpha(): number { return this.resources.alphaUniforms.uniforms.uAlpha; }
    set alpha(value: number) { this.resources.alphaUniforms.uniforms.uAlpha = value; }
}
