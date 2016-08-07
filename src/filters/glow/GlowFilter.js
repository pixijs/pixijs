var core = require('../../core');
var glslify  = require('glslify');
var CONST = require('../../core/const');
var filters = require('../index');

var BlurXFilter = require('../blur/BlurXFilter');
    BlurYFilter = require('../blur/BlurYFilter');
    VoidFilter = require('../void/VoidFilter');

/**
 * The GlowFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends core.Filter
 * @memberof core.filters
 */
function GlowFilter()
{
    core.Filter.call(this,
    	// vertex shader
        glslify('./glow.vert'),
        // fragment shader
        glslify('./glow.frag')
    );


    this.padding = 300
    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();

    this.blurXFilter.resolution = this.blurYFilter.resolution = 0.1
    this.blurXFilter.blur = 15;
    this.blurYFilter.blur = 15;

  //  this.blurXFilter.passes = 1;
//    this.blurYFilter.passes = 1;
    this.blendMode = CONST.BLEND_MODES.ADD;

    this.defaultFilter = new VoidFilter();

    this.uniforms.center.x = 0.1;
    this.uniforms.center.y = 0.1;

    this.uniforms.haloScale = 0.8;
    this.uniforms.haloStrength = 1.0;
 //   this.resolution = 0.1
//    var renderTexture = n
}

GlowFilter.prototype = Object.create(core.Filter.prototype);
GlowFilter.prototype.constructor = GlowFilter;
module.exports = GlowFilter;

GlowFilter.prototype.apply = function (filterManager, input, output)
{
	var target = filterManager.filterData.stack[filterManager.filterData.index].target;

//	this.blurXFilter.blur = this.uniforms.strength * 15;
  //  this.blurYFilter.blur = this.uniforms.strength * 15;

    var renderTarget = filterManager.getRenderTarget(true, 0.5);
    var renderTarget2 = filterManager.getRenderTarget(true, 0.5);

    //TODO - copyTexSubImage2D could be used here?
    this.defaultFilter.apply(filterManager, input, output, true);
    this.defaultFilter.apply(filterManager, input, renderTarget, true);

    this.blurXFilter.apply(filterManager, renderTarget, renderTarget2, true);
    this.blurYFilter.apply(filterManager, renderTarget2, renderTarget, true);

    this.uniforms.center.x = target.position.x;
    this.uniforms.center.y = target.position.y;


  //  var renderer = filterManager.renderer;
  //  var gl = renderer.gl;

/*
   	// filterManager
   	//filterManager.renderer.

    renderer._activeTextureLocation = 1
   	gl.activeTexture(gl.TEXTURE0 + 1 );
   	renderTarget2.texture.bind();
*/

    this.uniforms.uBlurSampler = renderTarget;


    filterManager.applyFilter(this, input, output, false);

    filterManager.returnRenderTarget(renderTarget);
    filterManager.returnRenderTarget(renderTarget2);
};

Object.defineProperties(GlowFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf core.filters.GlowFilter#
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
     * @memberOf core.filters.GlowFilter#
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
     * @memberOf core.filters.GlowFilter#
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
