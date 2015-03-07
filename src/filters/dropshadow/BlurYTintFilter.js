var core = require('../../core'),
    blurFactor = 1 / 7000;
var fs = require('fs');

/**
 * The BlurYTintFilter applies a vertical Gaussian blur to an object.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function BlurYTintFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/blurYTint.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + '/blurYTint.frag', 'utf8'),
        // set the uniforms
        {
            blur: { type: '1f', value: 1 / 512 },
            color: { type: 'c', value: [0,0,0]},
            alpha: { type: '1f', value: 0.7 },
            offset: { type: '2f', value:[5, 5]}
        }
    );
}

BlurYTintFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYTintFilter.prototype.constructor = BlurYTintFilter;
module.exports = BlurYTintFilter;

Object.defineProperties(BlurYTintFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof BlurYTintFilter#
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
