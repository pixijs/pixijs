var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var glslify  = require('glslify');

/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function PixelateFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./pixelate.frag')
    );

    this.size = [0,0];

}

PixelateFilter.prototype = Object.create(core.Filter.prototype);
PixelateFilter.prototype.constructor = PixelateFilter;
module.exports = PixelateFilter;

Object.defineProperties(PixelateFilter.prototype, {
    /**
     * This a point that describes the size of the blocks.
     * x is the width of the block and y is the height.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.PixelateFilter#
     */
    size: {
        get: function ()
        {
            return this.uniforms.size;
        },
        set: function (value)
        {
            this.uniforms.size.value = value;
        }
    }
});
