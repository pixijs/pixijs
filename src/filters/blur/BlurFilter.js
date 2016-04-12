var core = require('../../core'),
    BlurXFilter = require('./BlurXFilter'),
    BlurYFilter = require('./BlurYFilter');

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function BlurFilter()
{
    core.Filter.call(this);

    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();
    this.resolution = 0.25;//0.25;//0.25//1//01.26;
    this.blurYFilter.passes = this.blurXFilter.passes = 1;
    this.blurYFilter.strength = this.blurXFilter.strength = 4;//4// 4

    this.padding = 20;

}

BlurFilter.prototype = Object.create(core.Filter.prototype);
BlurFilter.prototype.constructor = BlurFilter;
module.exports = BlurFilter;

BlurFilter.prototype.apply = function (filterManager, input, output)
{

    var renderTarget = filterManager.getRenderTarget(true);

    this.blurXFilter.apply(filterManager, input, renderTarget, true);
    this.blurYFilter.apply(filterManager, renderTarget, output);

    filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(BlurFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
            this.blurXFilter.blur = this.blurYFilter.blur = value;
        }
    },

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 1
     */
    passes: {
        get: function ()
        {
            return  this.blurXFilter.passes;
        },
        set: function (value)
        {

            this.blurXFilter.passes = this.blurYFilter.passes = value;
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
            this.blurXFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYFilter.blur;
        },
        set: function (value)
        {
            this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
            this.blurYFilter.blur = value;
        }
    }
});
