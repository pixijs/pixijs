var core = require('../../core'),
    blurFactor = 1 / 7000;

/**
 * The BlurYFilter applies a vertical Gaussian blur to an object.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function BlurYFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        require('fs').readFileSync(__dirname + '/blurY.frag', 'utf8'),
        // set the uniforms
        {
            blur: { type: '1f', value: 1 / 512 }
        }
    );
}

BlurYFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

Object.defineProperties(BlurYFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof BlurYFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.uniforms.blur.value / blurFactor;
        },
        set: function (value)
        {
            this.uniforms.blur.value = blurFactor * value;
        }
    }
});
