import { Filter, defaultFilterVertex } from '@pixi/core';
import fragment from './noise.frag';

/**
 * @author Vico @vicocotea
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 */

/**
 * A Noise effect filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
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
     *
     * @member {number}
     * @default 0.5
     */
    get noise(): number
    {
        return this.uniforms.uNoise;
    }

    set noise(value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uNoise = value;
    }

    /**
     * A seed value to apply to the random noise generation. `Math.random()` is a good value to use.
     *
     * @member {number}
     */
    get seed(): number
    {
        return this.uniforms.uSeed;
    }

    set seed(value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uSeed = value;
    }
}
