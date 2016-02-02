var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

/**
 * The BlurYFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurYFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        fs.readFileSync(__dirname + '/blurY.vert', 'utf8'),
        // fragment shader
        fs.readFileSync(__dirname + '/blur.frag', 'utf8'),
        // set the uniforms
        {
            strength: { type: '1f', value: 1 }
        }
    );

    this.passes = 1;
    this.strength = 4;
}

BlurYFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

BlurYFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    this.uniforms.strength.value = Math.abs(this.strength) / 4 / this.passes * (input.frame.height / input.size.height);

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
