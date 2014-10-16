/**
 * The ConvolutionFilter class applies a matrix convolution filter effect. 
 * A convolution combines pixels in the input image with neighboring pixels to produce a new image. 
 * A wide variety of image effects can be achieved through convolutions, including blurring, edge detection, sharpening, embossing, and beveling.
 * The matrix should be specified as a 9 point Array. See http://docs.gimp.org/en/plug-in-convmatrix.html for more info.
 * 
 * @class ConvolutionFilter
 * @extends AbstractFilter
 * @constructor
 * @param matrix {Array} An array of values used for matrix transformation. Specified as a 9 point Array.
 * @param width {Number} Width of the object you are transforming
 * @param height {Number} Height of the object you are transforming
 */
PIXI.ConvolutionFilter = function(matrix, width, height)
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        m : {type: '1fv', value: new Float32Array(matrix)},
        texelSizeX: {type: '1f', value: 1 / width},
        texelSizeY: {type: '1f', value: 1 / height}
    };

    this.fragmentSrc = [
        'precision mediump float;',
        'varying mediump vec2 vTextureCoord;',
        'uniform sampler2D texture;',
        'uniform float texelSizeX;',
        'uniform float texelSizeY;',
        'uniform float m[9];',

        'vec2 px = vec2(texelSizeX, texelSizeY);',

        'void main(void) {',
            'vec4 c11 = texture2D(texture, vTextureCoord - px);', // top left
            'vec4 c12 = texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y - px.y));', // top center
            'vec4 c13 = texture2D(texture, vec2(vTextureCoord.x + px.x, vTextureCoord.y - px.y));', // top right

            'vec4 c21 = texture2D(texture, vec2(vTextureCoord.x - px.x, vTextureCoord.y) );', // mid left
            'vec4 c22 = texture2D(texture, vTextureCoord);', // mid center
            'vec4 c23 = texture2D(texture, vec2(vTextureCoord.x + px.x, vTextureCoord.y) );', // mid right

            'vec4 c31 = texture2D(texture, vec2(vTextureCoord.x - px.x, vTextureCoord.y + px.y) );', // bottom left
            'vec4 c32 = texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y + px.y) );', // bottom center
            'vec4 c33 = texture2D(texture, vTextureCoord + px );', // bottom right

            'gl_FragColor = ',
            'c11 * m[0] + c12 * m[1] + c22 * m[2] +',
            'c21 * m[3] + c22 * m[4] + c23 * m[5] +',
            'c31 * m[6] + c32 * m[7] + c33 * m[8];',
            'gl_FragColor.a = c22.a;',
        '}'
    ];

};

PIXI.ConvolutionFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.ConvolutionFilter.prototype.constructor = PIXI.ConvolutionFilter;

/**
 * An array of values used for matrix transformation. Specified as a 9 point Array.
 *
 * @property matrix
 * @type Array
 */
Object.defineProperty(PIXI.ConvolutionFilter.prototype, 'matrix', {
    get: function() {
        return this.uniforms.m.value;
    },
    set: function(value) {
        this.uniforms.m.value = new Float32Array(value);
    }
});

/**
 * Width of the object you are transforming
 *
 * @property width
 * @type Number
 */
Object.defineProperty(PIXI.ConvolutionFilter.prototype, 'width', {
    get: function() {
        return this.uniforms.texelSizeX.value;
    },
    set: function(value) {
        this.uniforms.texelSizeX.value = 1/value;
    }
});

/**
 * Height of the object you are transforming
 *
 * @property height
 * @type Number
 */
Object.defineProperty(PIXI.ConvolutionFilter.prototype, 'height', {
    get: function() {
        return this.uniforms.texelSizeY.value;
    },
    set: function(value) {
        this.uniforms.texelSizeY.value = 1/value;
    }
});
