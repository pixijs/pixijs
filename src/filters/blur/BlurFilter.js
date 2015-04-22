var core = require('../../core'),
    BlurDirFilter = require('./BlurDirFilter');

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function BlurFilter()
{
    core.AbstractFilter.call(this);
    this.defaultFilter = new core.AbstractFilter();

    this.blurFilters = [
        new BlurDirFilter( 1, 0),
        new BlurDirFilter(-1, 0),
        new BlurDirFilter( 0, 1),
        new BlurDirFilter( 0,-1),
        new BlurDirFilter( 0.7, 0.7),
        new BlurDirFilter(-0.7, 0.7),
        new BlurDirFilter( 0.7,-0.7),
        new BlurDirFilter(-0.7,-0.7)
    ];

}

BlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurFilter.prototype.constructor = BlurFilter;
module.exports = BlurFilter;

BlurFilter.prototype.applyFilter = function (renderer, input, output)
{
    var renderTarget = renderer.filterManager.getRenderTarget(true);

    for (var e = 0; e < this.blurFilters.length; e++) {
        this.blurFilters[e].applyFilter(renderer, input, renderTarget);
    }

    this.defaultFilter.applyFilter(renderer, renderTarget, output);

    renderer.filterManager.returnRenderTarget(renderTarget);

};

Object.defineProperties(BlurFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf BlurFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurFilters[0].blur;
        },
        set: function (value)
        {
            this.padding = value * 0.5;
            for (var i = 0; i < this.blurFilters.length; i++) {
                this.blurFilters[i].blur = value;
            }
        }
    },

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @memberof BlurYFilter#
     * @default 1
     */
    passes: {
        get: function ()
        {
            return this.blurFilters[0].passes;
        },
        set: function (value)
        {
            for (var i = 0; i < this.blurFilters.length; i++) {
                this.blurFilters[i].passes = value;
            }
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf BlurFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurFilters[0].blur;
        },
        set: function (value)
        {
            this.blurFilters[0].blur = value;
            this.blurFilters[1].blur = value;

            this.blurFilters[4].blur = value * this.blurFilters[2].blur;
            this.blurFilters[5].blur = value * this.blurFilters[2].blur;

            this.blurFilters[6].blur = value * this.blurFilters[3].blur;
            this.blurFilters[7].blur = value * this.blurFilters[3].blur;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf BlurFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYFilter.blur;
        },
        set: function (value)
        {
            this.blurFilters[2].blur = value;
            this.blurFilters[3].blur = value;

            this.blurFilters[4].blur = value * this.blurFilters[0].blur;
            this.blurFilters[5].blur = value * this.blurFilters[0].blur;

            this.blurFilters[6].blur = value * this.blurFilters[1].blur;
            this.blurFilters[7].blur = value * this.blurFilters[1].blur;
        }
    }
});
