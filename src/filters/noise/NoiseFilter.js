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

        this.noise = Math.random();
    }

    /**
     * The amount of noise to apply, this value should be in the range (0, 1].
     *
     * @member {number}
     * @default 0.5
     */
    get noise()
    {
        return this.uniforms.uNoise;
    }

    set noise(value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uNoise = value;
    }
}
