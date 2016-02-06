var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * This lowers the color depth of your image by the given amount, producing an image with a smaller palette.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function ColorStepFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fs.readFileSync(__dirname + '/colorStep.frag', 'utf8'),
        // custom uniforms
        {
            step: { type: '1f', value: 5 }
        }
    );
}

ColorStepFilter.prototype = Object.create(core.AbstractFilter.prototype);
ColorStepFilter.prototype.constructor = ColorStepFilter;
module.exports = ColorStepFilter;

Object.defineProperties(ColorStepFilter.prototype, {
    /**
     * The number of steps to reduce the palette by.
     *
     * @member {number}
     * @memberof PIXI.filters.ColorStepFilter#
     */
    step: {
        get: function ()
        {
            return this.uniforms.step.value;
        },
        set: function (value)
        {
            this.uniforms.step.value = value;
        }
    }
});
