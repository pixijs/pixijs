var core = require('../../core');
var glslify  = require('glslify');

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
function NoiseFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./noise.frag')
    );

    this.noise = 0.5;
}

NoiseFilter.prototype = Object.create(core.Filter.prototype);
NoiseFilter.prototype.constructor = NoiseFilter;
module.exports = NoiseFilter;

Object.defineProperties(NoiseFilter.prototype, {
    /**
     * The amount of noise to apply.
     *
     * @member {number}
     * @memberof PIXI.filters.NoiseFilter#
     * @default 0.5
     */
    noise: {
        get: function ()
        {
            return this.uniforms.noise;
        },
        set: function (value)
        {
            this.uniforms.noise = value;
        }
    }
});
