var core = require('../../core'),
    blurFactor = 1 / 7000;

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function BlurXFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        require('fs').readFileSync(__dirname + '/blurX.frag', 'utf8'),
        // set the uniforms
        {
            blur: { type: '1f', value: 1 / 512 }
        }
    );
}

BlurXFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;

Object.defineProperties(BlurXFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof BlurXFilter#
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
