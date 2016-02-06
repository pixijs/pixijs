var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * An RGB Split Filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function RGBSplitFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fs.readFileSync(__dirname + '/rgbSplit.frag', 'utf8'),
        // custom uniforms
        {
            red:        { type: 'v2', value: { x: 20, y: 20 } },
            green:      { type: 'v2', value: { x: -20, y: 20 } },
            blue:       { type: 'v2', value: { x: 20, y: -20 } },
            dimensions: { type: '4fv', value: [0, 0, 0, 0] }
        }
    );
}

RGBSplitFilter.prototype = Object.create(core.AbstractFilter.prototype);
RGBSplitFilter.prototype.constructor = RGBSplitFilter;
module.exports = RGBSplitFilter;

Object.defineProperties(RGBSplitFilter.prototype, {
    /**
     * Red channel offset.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.RGBSplitFilter#
     */
    red: {
        get: function ()
        {
            return this.uniforms.red.value;
        },
        set: function (value)
        {
            this.uniforms.red.value = value;
        }
    },

    /**
     * Green channel offset.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.RGBSplitFilter#
     */
    green: {
        get: function ()
        {
            return this.uniforms.green.value;
        },
        set: function (value)
        {
            this.uniforms.green.value = value;
        }
    },

    /**
     * Blue offset.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.RGBSplitFilter#
     */
    blue: {
        get: function ()
        {
            return this.uniforms.blue.value;
        },
        set: function (value)
        {
            this.uniforms.blue.value = value;
        }
    }
});
