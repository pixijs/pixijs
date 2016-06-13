var core = require('../../core');
var glslify  = require('glslify');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftAxisFilter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function TiltShiftAxisFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./tilt-shift.frag')

    );

    this.uniforms.blur = 100;
    this.uniforms.gradientBlur = 600;
    this.uniforms.start = new PIXI.Point(0, window.innerHeight / 2);
    this.uniforms.end = new PIXI.Point(600, window.innerHeight / 2);
    this.uniforms.delta = new PIXI.Point(30, 30);
    this.uniforms.texSize = new PIXI.Point(window.innerWidth, window.innerHeight);

    this.updateDelta();
}

TiltShiftAxisFilter.prototype = Object.create(core.Filter.prototype);
TiltShiftAxisFilter.prototype.constructor = TiltShiftAxisFilter;
module.exports = TiltShiftAxisFilter;

/**
 * Updates the filter delta values.
 * This is overridden in the X and Y filters, does nothing for this class.
 *
 */
TiltShiftAxisFilter.prototype.updateDelta = function ()
{
    this.uniforms.delta.x = 0;
    this.uniforms.delta.y = 0;
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
            return this.uniforms.blur;
        },
        set: function (value)
        {
            this.uniforms.blur = value;
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
            return this.uniforms.gradientBlur;
        },
        set: function (value)
        {
            this.uniforms.gradientBlur = value;
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
            return this.uniforms.start;
        },
        set: function (value)
        {
            this.uniforms.start = value;
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
            return this.uniforms.end;
        },
        set: function (value)
        {
            this.uniforms.end = value;
            this.updateDelta();
        }
    }
});
