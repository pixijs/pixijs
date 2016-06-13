var core = require('../../core');
var glslify  = require('glslify');

/**
 * An RGB Split Filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function EmbossFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./emboss.frag')
    );

    this.strength = 5;
}

EmbossFilter.prototype = Object.create(core.Filter.prototype);
EmbossFilter.prototype.constructor = EmbossFilter;
module.exports = EmbossFilter;

Object.defineProperties(EmbossFilter.prototype, {
    /**
     * Strength of Emboss.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.EmbossFilter#
     */
    strength: {
        get: function ()
        {
            return this.uniforms.strength;
        },
        set: function (value)
        {
            this.uniforms.strength = value;
        }
    },


});
