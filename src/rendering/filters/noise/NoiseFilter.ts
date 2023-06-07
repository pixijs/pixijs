import { GlProgram } from '../../renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { Filter } from '../Filter';
import fragment from './noise.frag';
import vertex from './noise.vert';
import source from './noise.wgsl';

export interface NoiseFilterOptions
{
    noise?: number;
    seed?: number;
}

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @memberof PIXI.filters
 * @author Vico @vicocotea
 */
export class NoiseFilter extends Filter
{
    static readonly DEFAULT: NoiseFilterOptions = {
        noise: 0.5,
        seed: undefined,
    };

    /**
     * @param options
     */
    constructor(options: NoiseFilterOptions = {})
    {
        options = { ...NoiseFilter.DEFAULT, ...options };

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
            name: 'noise-filter'
        });

        super({
            gpuProgram,
            glProgram,
            resources: {
                noiseUniforms: new UniformGroup({
                    uNoise: { value: options.noise, type: 'f32' },
                    uSeed: { value: options.seed ?? Math.random(), type: 'f32' },
                })
            },
            resolution: 1,
        });

        const noise = options.noise ?? 0.5;
        const seed = options.seed ?? Math.random();

        this.noise = noise;
        this.seed = seed;
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
