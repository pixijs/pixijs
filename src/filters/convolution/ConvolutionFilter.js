var core = require('../../core');
var glslify  = require('glslify');

/**
 * The ConvolutionFilter class applies a matrix convolution filter effect.
 * A convolution combines pixels in the input image with neighboring pixels to produce a new image.
 * A wide variety of image effects can be achieved through convolutions, including blurring, edge
 * detection, sharpening, embossing, and beveling. The matrix should be specified as a 9 point Array.
 * See http://docs.gimp.org/en/plug-in-convmatrix.html for more info.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param matrix {number[]} An array of values used for matrix transformation. Specified as a 9 point Array.
 * @param width {number} Width of the object you are transforming
 * @param height {number} Height of the object you are transforming
 */
function ConvolutionFilter(matrix, width, height)
{
    core.Filter.call(this,
        // vertex shader
        glslify('../fragments/default.vert'),
        // fragment shader
        glslify('./convolution.frag')
    );

    this.matrix = matrix;
    this.width = width;
    this.height = height;
}

ConvolutionFilter.prototype = Object.create(core.Filter.prototype);
ConvolutionFilter.prototype.constructor = ConvolutionFilter;
module.exports = ConvolutionFilter;

Object.defineProperties(ConvolutionFilter.prototype, {
    /**
     * An array of values used for matrix transformation. Specified as a 9 point Array.
     *
     * @member {number[]}
     * @memberof PIXI.filters.ConvolutionFilter#
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.matrix;
        },
        set: function (value)
        {
            this.uniforms.matrix = new Float32Array(value);
        }
    },

    /**
     * Width of the object you are transforming
     *
     * @member {number}
     * @memberof PIXI.filters.ConvolutionFilter#
     */
    width: {
        get: function ()
        {
            return 1/this.uniforms.texelSize[0];
        },
        set: function (value)
        {
            this.uniforms.texelSize[0] = 1/value;
        }
    },

    /**
     * Height of the object you are transforming
     *
     * @member {number}
     * @memberof PIXI.filters.ConvolutionFilter#
     */
    height: {
        get: function ()
        {
            return 1/this.uniforms.texelSize[1];
        },
        set: function (value)
        {
            this.uniforms.texelSize[1] = 1/value;
        }
    }
});
