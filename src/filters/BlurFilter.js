var AbstractFilter = require('../core/renderers/webGL/filters/AbstractFilter'),
    BlurXFilter = require('./BlurXFilter'),
    BlurYFilter = require('./BlurYFilter');

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function BlurFilter()
{
    AbstractFilter.call(this);

    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();

    this.defaultFilter = new AbstractFilter();
}

BlurFilter.prototype = Object.create( AbstractFilter.prototype );
BlurFilter.prototype.constructor = BlurFilter;
module.exports = BlurFilter;

BlurFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    var renderTarget = filterManager.getRenderTarget(true);

    this.blurXFilter.applyFilter(renderer, input, renderTarget);

    this.blurYFilter.applyFilter(renderer, renderTarget, output);

    filterManager.returnRenderTarget( renderTarget );
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
     * @memberOf BlurFilter#
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
            this.blurYFilter.blur = value;
        }
    }
});
