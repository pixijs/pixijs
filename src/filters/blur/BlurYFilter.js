var core = require('../../core');
var fs = require('fs');

/**
 * The BlurYFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends AbstractFilter
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

    this._passes = 1;
    this.stength = 8;
}

BlurYFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

BlurYFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    if(this._passes === 1)
    {
        renderer.filterManager.applyFilter(shader, input, output, clear);
    }
    else
    {
        var renderTarget = renderer.filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this._passes-1; i++)
        {
            renderer.filterManager.applyFilter(shader, flip, flop, clear);

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
     * @memberof BlurYFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding = value;
            this.strength = value;
            this.uniforms.strength.value = value / 8 / this._passes;
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
            return  this._passes;
        },
        set: function (value)
        {
            this._passes = value;
            this.uniforms.strength.value = this.strength / 8 / this._passes;
        }
    }
});
