var core = require('../../core');
var glslify  = require('glslify');
var CONST = require('../../core/const');
var filters = require('../index');

var BlurXFilter = require('../blur/BlurXFilter');
    BlurYFilter = require('../blur/BlurYFilter');
    VoidFilter = require('../void/VoidFilter');

/**
 * The BloomFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends core.Filter
 * @memberof core.filters
 */
function BloomFilter()
{
    core.Filter.call(this);

    this.padding = 200
    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();

    this.blurXFilter.blur = 20;
    this.blurYFilter.blur = 20;

  //  this.blurXFilter.passes = 1;
//    this.blurYFilter.passes = 1;
 //   this.blurYFilter.blendMode = CONST.BLEND_MODES.SCREEN;

    this.defaultFilter = new VoidFilter();
}

BloomFilter.prototype = Object.create(core.Filter.prototype);
BloomFilter.prototype.constructor = BloomFilter;
module.exports = BloomFilter;

BloomFilter.prototype.apply = function (filterManager, input, output)
{
    var renderTarget = filterManager.getRenderTarget(true);

    //TODO - copyTexSubImage2D could be used here?
    this.defaultFilter.apply(filterManager, input, output, false);

    this.blurXFilter.apply(filterManager, input, renderTarget, true);
    this.blurYFilter.apply(filterManager, renderTarget, output, false);

    filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(BloomFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf core.filters.BloomFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = this.blurYFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf core.filters.BloomFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf core.filters.BloomFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYFilter.blur;
        },
        set: function (value)
        {
            this.blurYFilter.blur = value;
        }
    }
});
