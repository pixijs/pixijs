var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function PixelateFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fs.readFileSync(__dirname + '/pixelate.frag', 'utf8'),
        // custom uniforms
        {
            dimensions: { type: '4fv',  value: new Float32Array([0, 0, 0, 0]) },
            pixelSize:  { type: 'v2',   value: { x: 10, y: 10 } }
        }
    );
}

PixelateFilter.prototype = Object.create(core.AbstractFilter.prototype);
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
            return this.uniforms.pixelSize.value;
        },
        set: function (value)
        {
            this.uniforms.pixelSize.value = value;
        }
    }
});
