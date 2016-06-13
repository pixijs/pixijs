var core = require('../../core');
var glslify  = require('glslify');

/**
 * The ColorMatrixFilter class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function ShockwaveFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./shockwave.frag'),
        // custom uniforms
        {
            center: { type: 'v2', value: { x: 0.5, y: 0.5 } },
            params: { type: 'v3', value: { x: 10, y: 0.8, z: 0.1 } },
            time: { type: '1f', value: 0 }
        }
    );

    this.center = [0.5, 0.5];
    this.params = [10, 0.8, 0.1];
    this.time = 0;
}

ShockwaveFilter.prototype = Object.create(core.Filter.prototype);
ShockwaveFilter.prototype.constructor = ShockwaveFilter;
module.exports = ShockwaveFilter;

Object.defineProperties(ShockwaveFilter.prototype, {
    /**
     * Sets the center of the shockwave in normalized screen coords. That is
     * (0,0) is the top-left and (1,1) is the bottom right.
     *
     * @member {object<string, number>}
     * @memberof PIXI.filters.ShockwaveFilter#
     */
    center: {
        get: function ()
        {
            return this.uniforms.center;
        },
        set: function (value)
        {
            this.uniforms.center = value;
        }
    },
    /**
     * Sets the params of the shockwave. These modify the look and behavior of
     * the shockwave as it ripples out.
     *
     * @member {object<string, number>}
     * @memberof PIXI.filters.ShockwaveFilter#
     */
    params: {
        get: function ()
        {
            return this.uniforms.params;
        },
        set: function (value)
        {
            this.uniforms.params = value;
        }
    },
    /**
     * Sets the elapsed time of the shockwave. This controls the speed at which
     * the shockwave ripples out.
     *
     * @member {number}
     * @memberof PIXI.filters.ShockwaveFilter#
     */
    time: {
        get: function ()
        {
            return this.uniforms.time;
        },
        set: function (value)
        {
            this.uniforms.time = value;
        }
    }
});
