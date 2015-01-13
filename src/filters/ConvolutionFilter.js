var AbstractFilter = require('./AbstractFilter');

/**
 * The ConvolutionFilter class applies a matrix convolution filter effect.
 * A convolution combines pixels in the input image with neighboring pixels to produce a new image.
 * A wide variety of image effects can be achieved through convolutions, including blurring, edge
 * detection, sharpening, embossing, and beveling. The matrix should be specified as a 9 point Array.
 * See http://docs.gimp.org/en/plug-in-convmatrix.html for more info.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 * @param matrix {number[]} An array of values used for matrix transformation. Specified as a 9 point Array.
 * @param width {number} Width of the object you are transforming
 * @param height {number} Height of the object you are transforming
 */
function ConvolutionFilter(matrix, width, height)
{
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        matrix:     { type: '1fv', value: new Float32Array(matrix) },
        texelSizeX: { type: '1f', value: 1 / width },
        texelSizeY: { type: '1f', value: 1 / height }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying mediump vec2 vTextureCoord;',

        'uniform sampler2D texture;',
        'uniform float texelSizeX;',
        'uniform float texelSizeY;',
        'uniform float matrix[9];',

        'vec2 px = vec2(texelSizeX, texelSizeY);',

        'void main(void)',
        '{',
        '   vec4 c11 = texture2D(texture, vTextureCoord - px);', // top left
        '   vec4 c12 = texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y - px.y));', // top center
        '   vec4 c13 = texture2D(texture, vec2(vTextureCoord.x + px.x, vTextureCoord.y - px.y));', // top right

        '   vec4 c21 = texture2D(texture, vec2(vTextureCoord.x - px.x, vTextureCoord.y) );', // mid left
        '   vec4 c22 = texture2D(texture, vTextureCoord);', // mid center
        '   vec4 c23 = texture2D(texture, vec2(vTextureCoord.x + px.x, vTextureCoord.y) );', // mid right

        '   vec4 c31 = texture2D(texture, vec2(vTextureCoord.x - px.x, vTextureCoord.y + px.y) );', // bottom left
        '   vec4 c32 = texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y + px.y) );', // bottom center
        '   vec4 c33 = texture2D(texture, vTextureCoord + px );', // bottom right

        '   gl_FragColor = ',
        '       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +',
        '       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +',
        '       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];',
        '   gl_FragColor.a = c22.a;',
        '}'
    ];
}

ConvolutionFilter.prototype = Object.create(AbstractFilter.prototype);
ConvolutionFilter.prototype.constructor = ConvolutionFilter;
module.exports = ConvolutionFilter;

Object.defineProperties(ConvolutionFilter.prototype, {
    /**
     * An array of values used for matrix transformation. Specified as a 9 point Array.
     *
     * @member {number[]}
     * @memberof ConvolutionFilter#
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.matrix.value;
        },
        set: function (value)
        {
            this.uniforms.matrix.value = new Float32Array(value);
        }
    },

    /**
     * Width of the object you are transforming
     *
     * @member {number}
     * @memberof ConvolutionFilter#
     */
    width: {
        get: function ()
        {
            return this.uniforms.texelSizeX.value;
        },
        set: function (value)
        {
            this.uniforms.texelSizeX.value = 1/value;
        }
    },

    /**
     * Height of the object you are transforming
     *
     * @member {number}
     * @memberof ConvolutionFilter#
     */
    height: {
        get: function ()
        {
            return this.uniforms.texelSizeY.value;
        },
        set: function (value)
        {
            this.uniforms.texelSizeY.value = 1/value;
        }
    }
});
