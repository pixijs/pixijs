import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './noise.frag';
import source from './noise.wgsl';

import type { FilterOptions } from '../../Filter';

/**
 * Configuration options for the NoiseFilter.
 *
 * The NoiseFilter adds random noise to the rendered content. The noise effect can be
 * controlled through the noise intensity and an optional seed value for reproducible results.
 * @example
 * ```ts
 * // Basic noise effect
 * const options: NoiseFilterOptions = {
 *     noise: 0.5,
 *     seed: Math.random()
 * };
 *
 * // Create filter with options
 * const noiseFilter = new NoiseFilter(options);
 * ```
 * @category filters
 * @standard
 */
export interface NoiseFilterOptions extends FilterOptions
{
    /**
     * The amount of noise to apply. Should be in range (0, 1]:
     * - 0.1 = subtle noise
     * - 0.5 = moderate noise (default)
     * - 1.0 = maximum noise
     * @default 0.5
     * @example
     * ```ts
     * // Moderate noise effect
     * const noiseFilter = new NoiseFilter({ noise: 0.5 });
     * ```
     */
    noise?: number;
    /**
     * A seed value to apply to the random noise generation.
     * Using the same seed will generate the same noise pattern.
     * @default Math.random()
     * @example
     * ```ts
     * // Using a fixed seed for reproducible noise
     * const noiseFilter = new NoiseFilter({ seed: 12345 });
     * ```
     */
    seed?: number;
}

/**
 * A filter that adds configurable random noise to rendered content.
 *
 * This filter generates pixel noise based on a noise intensity value and an optional seed.
 * It can be used to create various effects like film grain, static, or texture variation.
 *
 * Based on: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @example
 * ```ts
 * import { NoiseFilter } from 'pixi.js';
 *
 * // Create with options
 * const filter = new NoiseFilter({
 *     noise: 0.5,    // 50% noise intensity
 *     seed: 12345    // Fixed seed for consistent noise
 * });
 *
 * // Apply to a display object
 * sprite.filters = [filter];
 *
 * // Adjust noise dynamically
 * filter.noise = 0.8;    // Increase noise
 * filter.seed = Math.random(); // New random pattern
 * ```
 * @category filters
 * @author Vico: vicocotea
 * @standard
 * @noInheritDoc
 */
export class NoiseFilter extends Filter
{
    /**
     * The default configuration options for the NoiseFilter.
     *
     * These values will be used when no specific options are provided to the constructor.
     * You can override any of these values by passing your own options object.
     * @example
     * ```ts
     * NoiseFilter.defaultOptions.noise = 0.7; // Change default noise to 0.7
     * const filter = new NoiseFilter(); // Will use noise 0.7 by default
     * ```
     */
    public static defaultOptions: NoiseFilterOptions = {
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
     * The amount of noise to apply to the filtered content.
     *
     * This value controls the intensity of the random noise effect:
     * - Values close to 0 produce subtle noise
     * - Values around 0.5 produce moderate noise
     * - Values close to 1 produce strong noise
     * @default 0.5
     * @example
     * ```ts
     * const noiseFilter = new NoiseFilter();
     *
     * // Set to subtle noise
     * noiseFilter.noise = 0.2;
     *
     * // Set to maximum noise
     * noiseFilter.noise = 1.0;
     * ```
     */
    get noise(): number
    {
        return this.resources.noiseUniforms.uniforms.uNoise;
    }

    set noise(value: number)
    {
        this.resources.noiseUniforms.uniforms.uNoise = value;
    }

    /**
     * The seed value used for random noise generation.
     *
     * This value determines the noise pattern:
     * - Using the same seed will generate identical noise patterns
     * - Different seeds produce different but consistent patterns
     * - `Math.random()` can be used for random patterns
     * @default Math.random()
     * @example
     * ```ts
     * const noiseFilter = new NoiseFilter();
     *
     * // Use a fixed seed for consistent noise
     * noiseFilter.seed = 12345;
     *
     * // Generate new random pattern
     * noiseFilter.seed = Math.random();
     * ```
     */
    get seed(): number
    {
        return this.resources.noiseUniforms.uniforms.uSeed;
    }

    set seed(value: number)
    {
        this.resources.noiseUniforms.uniforms.uSeed = value;
    }
}
