var core = require('../../core');
var generateBlurVertSource  = require('./generateBlurVertSource');
var generateBlurFragSource  = require('./generateBlurFragSource');


/**
 * The BlurYFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function BlurYFilter()
{
    var vertSrc = generateBlurVertSource(11, false);
    var fragSrc = generateBlurFragSource(11);

    core.Filter.call(this,
        // vertex shader
        vertSrc,
        // fragment shader
        fragSrc
    );

    this.passes = 1;
    this.resolution = 1;//0.25;//0.5;//0.1//5;
    this.strength = 4;
}

BlurYFilter.prototype = Object.create(core.Filter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

BlurYFilter.prototype.apply = function (filterManager, input, output, clear)
{
    this.uniforms.strength = (1/output.destinationFrame.height) * (output.size.height/input.size.height); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    this.uniforms.strength *= this.strength;

    if(this.passes === 1)
    {
        filterManager.applyFilter(this, input, output, clear);
    }
    else
    {
        var renderTarget = filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            filterManager.applyFilter(this, flip, flop, true);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        filterManager.applyFilter(this, flip, output, clear);

        filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurYFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding = Math.abs(value) * 0.5;
            this.strength = value;
        }
    }
});
