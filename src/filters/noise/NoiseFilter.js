import core from '../../core';
const glslify = require('glslify');

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
class NoiseFilter extends core.Filter
{
    constructor()
    {
        super(
            // vertex shader
            glslify('../fragments/default.vert'),
            // fragment shader
            glslify('./noise.frag')
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
    set noise(value)
    {
        this.uniforms.noise = value;
    }
}

export default NoiseFilter;