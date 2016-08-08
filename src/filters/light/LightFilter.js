var core = require('../../core');
var glslify  = require('glslify');

/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.
 *
 * @class
 * @extends core.Filter
 * @memberof core.Filters
 */
function LightFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./light.frag')
    );

    this.radius = 40;
    this.lightScale = 0.6;
    this.uniforms.dark = [0.3, 0.3, 0.3, 1];
    this.uniforms.light = [1, 1, 1, 1];

    this.maxDistance = 70;
    this.padding = 100;

    this.lightPosition = new PIXI.Point();
}

LightFilter.prototype = Object.create(core.Filter.prototype);
LightFilter.prototype.constructor = LightFilter;
module.exports = LightFilter;


LightFilter.prototype.apply = function (filterManager, input, output)
{
    console.log(filterManager)
    var target = filterManager.filterData.stack[filterManager.filterData.index].target;
    var bounds = target.getBounds(true);

    this.radius =  300;
    console.log(this.radius/ bounds.width);

    light.uniforms.offset.x = target.position.x;
    light.uniforms.offset.y = target.position.y;

    this.uniforms.scale.x = (this.radius / bounds.width) *  1/this.lightScale;
    this.uniforms.scale.y = (this.radius / bounds.height) *  1/this.lightScale;

    var centerX = target.position.x - this.lightPosition.x;
    var centerY = target.position.y - this.lightPosition.y;

    var dist = Math.sqrt(centerX * centerX + centerY * centerY);

    var nx = centerX / dist;
    var ny = centerY / dist;

    var intensity = map(dist, 0, 1000/2, 0, this.maxDistance)
    var maxDist = intensity;

    this.uniforms.direction.x = nx * -maxDist;
    this.uniforms.direction.y = ny * -maxDist;


    filterManager.applyFilter(this, input, output, true);

}

Object.defineProperties(LightFilter.prototype, {
    /**
     * This point describes the the offset of the twist.
     *
     * @member {PIXI.Point}
     * @memberof core.Filters.LightFilter#
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
     * @memberof core.Filters.LightFilter#
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

    dark: {
        get: function ()
        {
            return  core.utils.rgb2hex( this.uniforms.dark );
        },
        set: function (value)
        {
            this.uniforms.dark = core.utils.hex2rgb(value, this.uniforms.dark);
        }
    },

    light: {
        get: function ()
        {
            return core.utils.rgb2hex( this.uniforms.light );
        },
        set: function (value)
        {
            this.uniforms.light = core.utils.hex2rgb(value, this.uniforms.light);
        }
    }
});
