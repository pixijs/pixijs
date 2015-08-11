var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftAxisFilter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function TiltShiftAxisFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        fs.readFileSync(__dirname + '/tiltShift.frag', 'utf8'),
        // custom uniforms
        {
            blur:           { type: '1f', value: 100 },
            gradientBlur:   { type: '1f', value: 600 },
            start:          { type: 'v2', value: { x: 0,    y: window.innerHeight / 2 } },
            end:            { type: 'v2', value: { x: 600,  y: window.innerHeight / 2 } },
            delta:          { type: 'v2', value: { x: 30,   y: 30 } },
            texSize:        { type: 'v2', value: { x: window.innerWidth, y: window.innerHeight } }
        }
    );

    this.updateDelta();
}

TiltShiftAxisFilter.prototype = Object.create(core.AbstractFilter.prototype);
TiltShiftAxisFilter.prototype.constructor = TiltShiftAxisFilter;
module.exports = TiltShiftAxisFilter;

/**
 * Updates the filter delta values.
 * This is overridden in the X and Y filters, does nothing for this class.
 *
 */
TiltShiftAxisFilter.prototype.updateDelta = function ()
{
    this.uniforms.delta.value.x = 0;
    this.uniforms.delta.value.y = 0;
};

Object.defineProperties(TiltShiftAxisFilter.prototype, {
    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    blur: {
        get: function ()
        {
            return this.uniforms.blur.value;
        },
        set: function (value)
        {
            this.uniforms.blur.value = value;
        }
    },

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    gradientBlur: {
        get: function ()
        {
            return this.uniforms.gradientBlur.value;
        },
        set: function (value)
        {
            this.uniforms.gradientBlur.value = value;
        }
    },

    /**
     * The X value to start the effect at.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    start: {
        get: function ()
        {
            return this.uniforms.start.value;
        },
        set: function (value)
        {
            this.uniforms.start.value = value;
            this.updateDelta();
        }
    },

    /**
     * The X value to end the effect at.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    end: {
        get: function ()
        {
            return this.uniforms.end.value;
        },
        set: function (value)
        {
            this.uniforms.end.value = value;
            this.updateDelta();
        }
    }
});
