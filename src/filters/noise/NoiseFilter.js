import * as core from '../../core';
import { readFileSync } from 'fs';
import { join } from 'path';

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
export default class NoiseFilter extends core.Filter
{
    /**
     *
     */
    constructor()
    {
        super(
            // vertex shader
            readFileSync(join(__dirname, '../fragments/default.vert'), 'utf8'),
            // fragment shader
            readFileSync(join(__dirname, './noise.frag'), 'utf8')
        );

        this.noise = 0.5;
    }

    /**
     * The amount of noise to apply.
     *
     * @member {number}
     * @memberof PIXI.filters.NoiseFilter#
     * @default 0.5
     */
    get noise()
    {
        return this.uniforms.noise;
    }

    /**
     * Sets the amount of noise to apply.
     *
     * @param {number} value - The value to set to.
     */
    set noise(value)
    {
        this.uniforms.noise = value;
    }
}
