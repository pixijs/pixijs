var core = require('../../core');
var glslify  = require('glslify');

/**
 * An RGB Split Filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function RGBSplitFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./rgb-split.frag')
    );

    this.red = [-10, 0];
    this.green = [0, 10];
    this.blue = [0, 0];
}

RGBSplitFilter.prototype = Object.create(core.Filter.prototype);
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
            return this.uniforms.red;
        },
        set: function (value)
        {
            this.uniforms.red = value;
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
            return this.uniforms.green;
        },
        set: function (value)
        {
            this.uniforms.green = value;
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
