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
 * @memberof filters
 */
export interface AlphaFilterOptions
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
 * @memberof filters
 */
export class AlphaFilter extends Filter
{
    public static readonly defaultOptions: AlphaFilterOptions & Partial<FilterOptions> = {
        ...Filter.defaultOptions,
        alpha: 1,
    };

    constructor(options?: AlphaFilterOptions)
    {
        options = { ...AlphaFilter.defaultOptions, ...options };

        const gpuProgram = new GpuProgram({
            vertex: {
                source,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source,
                entryPoint: 'mainFragment',
            },
        });

        const glProgram = new GlProgram({
            vertex,
            fragment,
            name: 'alpha-filter'
        });

        const alphaUniforms = new UniformGroup({
            uAlpha: { value: options.alpha, type: 'f32' },
        });

        super({
            gpuProgram,
            glProgram,
            resources: {
                alphaUniforms
            }
        });
    }

    /**
     * Coefficient for alpha multiplication
     * @default 1
     */
    get alpha(): number { return this.resources.alphaUniforms.uniforms.uAlpha; }
    set alpha(value: number) { this.resources.alphaUniforms.uniforms.uAlpha = value; }
}
