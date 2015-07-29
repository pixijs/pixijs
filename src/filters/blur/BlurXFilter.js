var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurXFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/blurX.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + '/blur.frag', 'utf8'),
        // set the uniforms
        {
            strength: { type: '1f', value: 1 }
        }
    );

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    this.passes = 1;

    this.strength = 4;
}

BlurXFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;

BlurXFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    if(this.passes === 1)
    {
        renderer.filterManager.applyFilter(shader, input, output, clear);
    }
    else
    {
        var renderTarget = renderer.filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            renderer.filterManager.applyFilter(shader, flip, flop, true);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        renderer.filterManager.applyFilter(shader, flip, output, clear);

        renderer.filterManager.returnRenderTarget(renderTarget);
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
            this.padding =  Math.abs(value) * 0.5;
            this.strength = value;
        }
    }
});
