var core = require('../../core');

/**
 * The ColorMatrixFilter class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI.filters
 */
function ShockwaveFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        require('fs').readFileSync(__dirname + '/shockwave.frag', 'utf8'),
        // custom uniforms
        {
            center: { type: 'v2', value: { x: 0.5, y: 0.5 } },
            params: { type: 'v3', value: { x: 10, y: 0.8, z: 0.1 } },
            time: { type: 'f', value: 0 }
        }
    );
}

ShockwaveFilter.prototype = Object.create(core.AbstractFilter.prototype);
ShockwaveFilter.prototype.constructor = ShockwaveFilter;
module.exports = ShockwaveFilter;

Object.defineProperties(ShockwaveFilter.prototype, {
    /**
     * Sets the center of the shockwave
     *
     * @member {object<string, number>}
     * @memberof ShockwaveFilter#
     */
    center: {
        get: function ()
        {
            return this.uniforms.center.value;
        },
        set: function (value)
        {
            this.uniforms.center.value = value;
        }
    },
    /**
     * Sets the params of the shockwave
     *
     * @member {object<string, number>}
     * @memberof ShockwaveFilter#
     */
    params: {
        get: function ()
        {
            return this.uniforms.params.value;
        },
        set: function (value)
        {
            this.uniforms.params.value = value;
        }
    },
    /**
     * Sets the elapsed time of the shockwave
     *
     * @member {number}
     * @memberof ShockwaveFilter#
     */
    time: {
        get: function ()
        {
            return this.uniforms.time.value;
        },
        set: function (value)
        {
            this.uniforms.time.value = value;
        }
    }
});
