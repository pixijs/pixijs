import { GpuProgram } from '../../renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { Filter } from '../Filter';
import source from './alpha.wgsl';

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
 */
export class AlphaFilter extends Filter
{
    static readonly DEFAULT_OPTIONS: AlphaFilterOptions = {
        alpha: 1
    };

    constructor(options?: AlphaFilterOptions)
    {
        options = { ...AlphaFilter.DEFAULT_OPTIONS, ...options };

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

        const filterUniforms = new UniformGroup({
            uAlpha: { value: options.alpha, type: 'f32' },
        });

        super({
            gpuProgram,
            resources: {
                filterUniforms
            }
        });
    }

    /**
     * Coefficient for alpha multiplication
     * @default 1
     */
    get alpha(): number { return this.resources.filterUniforms.uniforms.uAlpha; }
    set alpha(value: number) { this.resources.filterUniforms.uniforms.uAlpha = value; }
}
