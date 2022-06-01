import { Filter, defaultFilterVertex } from '@pixi/core';
import fragment from './noise.frag';

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @memberof PIXI.filters
 * @author Vico @vicocotea
 */
export class NoiseFilter extends Filter
{
    /**
     * @param {number} [noise=0.5] - The noise intensity, should be a normalized value in the range [0, 1].
     * @param {number} [seed] - A random seed for the noise generation. Default is `Math.random()`.
     */
    constructor(noise = 0.5, seed = Math.random())
    {
        super(defaultFilterVertex, fragment, {
            uNoise: 0,
            uSeed: 0,
        });

        this.noise = noise;
        this.seed = seed;
    }

    /**
     * The amount of noise to apply, this value should be in the range (0, 1].
     * @default 0.5
     */
    get noise(): number
    {
        return this.uniforms.uNoise;
    }

    set noise(value: number)
    {
        this.uniforms.uNoise = value;
    }

    /** A seed value to apply to the random noise generation. `Math.random()` is a good value to use. */
    get seed(): number
    {
        return this.uniforms.uSeed;
    }

    set seed(value: number)
    {
        this.uniforms.uSeed = value;
    }
}
