var core = require('../../core');
var glslify  = require('glslify');

/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function GodrayFilter()
{
    core.Filter.call(this,
        // vertex shader

        glslify('./godray.vert', 'utf8'),
        // fragment shader
        glslify('./godray.frag', 'utf8')
    );

    this.uniforms.exposure = 0.0034;
    this.uniforms.decay = 1.0;
    this.uniforms.density = 0.84;
    this.uniforms.weight = 5.65;  

    this.uniforms.lightPositionOnScreen[0] = 0.5;///0.5;
    this.uniforms.lightPositionOnScreen[1] = 0.5;//;
}

GodrayFilter.prototype = Object.create(core.Filter.prototype);
GodrayFilter.prototype.constructor = GodrayFilter;
module.exports = GodrayFilter;

GodrayFilter.prototype.apply = function (filterManager, input, output, clear)
{

    filterManager.applyFilter(this, input, output, clear);
};

Object.defineProperties(GodrayFilter.prototype, {
    /**
     * This point describes the the offset of the twist.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.GodrayFilter#
     */
    offset: {
        get: function ()
        {
            return this.uniforms.offset;
        },
        set: function (value)
        {
            this.uniforms.offset = value;
        }
    },

    /**
     * This radius of the twist.
     *
     * @member {number}
     * @memberof PIXI.filters.GodrayFilter#
     */
    radius: {
        get: function ()
        {
            return this.uniforms.radius;
        },
        set: function (value)
        {
            this.uniforms.radius = value;
        }
    },

    /**
     * This angle of the twist.
     *
     * @member {number}
     * @memberof PIXI.filters.GodrayFilter#
     */
    angle: {
        get: function ()
        {
            return this.uniforms.angle;
        },
        set: function (value)
        {
            this.uniforms.angle = value;
        }
    }
});
