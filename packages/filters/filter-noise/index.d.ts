import { Filter } from '@pixi/core';

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @author Vico @vicocotea
 */
export declare class NoiseFilter extends Filter {
    /**
     * @param {number} [noise=0.5] - The noise intensity, should be a normalized value in the range [0, 1].
     * @param {number} [seed] - A random seed for the noise generation. Default is `Math.random()`.
     */
    constructor(noise?: number, seed?: number);
    /**
     * The amount of noise to apply, this value should be in the range (0, 1].
     *
     * @member {number}
     * @default 0.5
     */
    get noise(): number;
    set noise(value: number);
    /**
     * A seed value to apply to the random noise generation. `Math.random()` is a good value to use.
     *
     * @member {number}
     */
    get seed(): number;
    set seed(value: number);
}

export { }
