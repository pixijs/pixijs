var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var glslify  = require('glslify');

/**
 * This greyscales the palette of your Display Objects.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function GrayFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('./gray.vert', 'utf8'),
        // fragment shader
        glslify('./gray.frag', 'utf8')
    );

    this.uniforms.gray = 1;
    
    this.glShaderKey = 'gray';
}

GrayFilter.prototype = Object.create(core.Filter.prototype);
GrayFilter.prototype.constructor = GrayFilter;
module.exports = GrayFilter;

Object.defineProperties(GrayFilter.prototype, {
    /**
     * The strength of the gray. 1 will make the object black and white, 0 will make the object its normal color.
     *
     * @member {number}
     * @memberof PIXI.filters.GrayFilter#
     */
    gray: {
        get: function ()
        {
            return this.uniforms.gray;
        },
        set: function (value)
        {
            this.uniforms.gray = value;
        }
    }
});
