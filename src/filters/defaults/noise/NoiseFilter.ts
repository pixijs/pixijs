import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './noise.frag';
import source from './noise.wgsl';

import type { FilterOptions } from '../../Filter';

/**
 * Options for NoiseFilter
 * @memberof filters
 */
export interface NoiseFilterOptions extends FilterOptions
{
    /** The amount of noise to apply, this value should be in the range (0, 1]. */
    noise?: number;
    /** A seed value to apply to the random noise generation. `Math.random()` is a good value to use. */
    seed?: number;
}

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @memberof filters
 * @author Vico @vicocotea
 */
export class NoiseFilter extends Filter
{
    public static readonly defaultOptions: NoiseFilterOptions = {
        noise: 0.5,
    };

    /**
     * @param options - The options of the noise filter.
     */
    constructor(options: NoiseFilterOptions = {})
    {
        options = { ...NoiseFilter.defaultOptions, ...options };

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
            name: 'noise-filter'
        });

        const { noise, seed, ...rest } = options;

        super({
            ...rest,
            gpuProgram,
            glProgram,
            resources: {
                noiseUniforms: new UniformGroup({
                    uNoise: { value: 1, type: 'f32' },
                    uSeed: { value: 1, type: 'f32' },
                })
            },
        });

        this.noise = noise;
        this.seed = seed ?? Math.random();
    }

    /**
     * The amount of noise to apply, this value should be in the range (0, 1].
     * @default 0.5
     */
    get noise(): number
    {
        return this.resources.noiseUniforms.uniforms.uNoise;
    }

    set noise(value: number)
    {
        this.resources.noiseUniforms.uniforms.uNoise = value;
    }

    /** A seed value to apply to the random noise generation. `Math.random()` is a good value to use. */
    get seed(): number
    {
        return this.resources.noiseUniforms.uniforms.uSeed;
    }

    set seed(value: number)
    {
        this.resources.noiseUniforms.uniforms.uSeed = value;
    }
}
