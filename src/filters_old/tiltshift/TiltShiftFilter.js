var core = require('../../core'),
    TiltShiftXFilter = require('./TiltShiftXFilter'),
    TiltShiftYFilter = require('./TiltShiftYFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShift Filter. Manages the pass of both a TiltShiftXFilter and TiltShiftYFilter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function TiltShiftFilter()
{
    core.AbstractFilter.call(this);

    this.tiltShiftXFilter = new TiltShiftXFilter();
    this.tiltShiftYFilter = new TiltShiftYFilter();
}

TiltShiftFilter.prototype = Object.create(core.AbstractFilter.prototype);
TiltShiftFilter.prototype.constructor = TiltShiftFilter;
module.exports = TiltShiftFilter;

TiltShiftFilter.prototype.applyFilter = function (renderer, input, output)
{
    var renderTarget = renderer.filterManager.getRenderTarget(true);

    this.tiltShiftXFilter.applyFilter(renderer, input, renderTarget);

    this.tiltShiftYFilter.applyFilter(renderer, renderTarget, output);

    renderer.filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(TiltShiftFilter.prototype, {
    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    blur: {
        get: function ()
        {
            return this.tiltShiftXFilter.blur;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
        }
    },

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    gradientBlur: {
        get: function ()
        {
            return this.tiltShiftXFilter.gradientBlur;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
        }
    },

    /**
     * The Y value to start the effect at.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    start: {
        get: function ()
        {
            return this.tiltShiftXFilter.start;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
        }
    },

    /**
     * The Y value to end the effect at.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    end: {
        get: function ()
        {
            return this.tiltShiftXFilter.end;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
        }
    }
});
