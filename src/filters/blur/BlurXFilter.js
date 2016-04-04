var core = require('../../core');
var generateBlurVertSource  = require('./generateBlurVertSource');
var generateBlurFragSource  = require('./generateBlurFragSource');
var getMaxBlurKernelSize    = require('./getMaxBlurKernelSize');

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function BlurXFilter()
{
    var vertSrc = generateBlurVertSource(5, true);
    var fragSrc = generateBlurFragSource(5);

    core.Filter.call(this,
        // vertex shader
        vertSrc,
        // fragment shader
        fragSrc
    );

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    this.passes = 1;
    this.resolution = 1;//0.25;//0.5;//0.1//5;
    this.strength = 4;

    this.firstRun = true;
}

BlurXFilter.prototype = Object.create(core.Filter.prototype);
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;

BlurXFilter.prototype.apply = function (filterManager, input, output, clear)
{
    if(this.firstRun)
    {
        var gl = filterManager.renderer.gl;
        var kernelSize = getMaxBlurKernelSize(gl);

        this.vertexSrc = generateBlurVertSource(kernelSize, true);
        this.fragmentSrc = generateBlurFragSource(kernelSize);

        this.firstRun = false;
    }



    this.uniforms.strength = (1/output.destinationFrame.width) * (output.size.width/input.size.width); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    // screen space!
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


Object.defineProperties(BlurXFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding =  Math.abs(value) * 2;
            this.strength = value;
        }
    }
});
