var AbstractFilter = require('./AbstractFilter'),
    math =  require('../../../math');

/**
 * The AlphaMaskFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 * @param texture {Texture} The texture used for the displacement map * must be power of 2 texture at the moment
 */
function AlphaMaskFilter(sprite)
{
    var maskMatrix = new math.Matrix();

    AbstractFilter.call(this,
    // vertex shader
    [
        'attribute vec2 aVertexPosition;',
        'attribute vec2 aTextureCoord;',
        'attribute vec4 aColor;',

        'uniform mat3 projectionMatrix;',
        'uniform mat3 otherMatrix;',

        'varying vec2 vMaskCoord;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'void main(void)',
        '{',
        '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
        '   vTextureCoord = aTextureCoord;',
        '   vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ].join('\n'),
    // fragment shader
    [
        'precision lowp float;',

        'varying vec2 vMaskCoord;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform sampler2D uSampler;',
        'uniform sampler2D mask;',

        'void main(void)',
        '{',
        '   vec4 original =  texture2D(uSampler, vTextureCoord);',
        '   vec4 masky =  texture2D(mask, vMaskCoord);',
        '   original *= (masky.r * masky.a);',
        '   gl_FragColor =  original;',
        '}'
    ].join('\n'),
    // uniforms
    {
        mask:           { type: 'sampler2D',    value: sprite.texture },
        otherMatrix:    { type: 'mat3', value: maskMatrix.toArray(true) }
    });

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;
}

AlphaMaskFilter.prototype = Object.create(AbstractFilter.prototype);
AlphaMaskFilter.prototype.constructor = AlphaMaskFilter;
module.exports = AlphaMaskFilter;

AlphaMaskFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);

    this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);

    shader = this.getShader(renderer);
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};


Object.defineProperties(AlphaMaskFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {Texture}
     * @memberof AlphaMaskFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.mask.value;
        },
        set: function (value)
        {
            this.uniforms.mask.value = value;
        }
    },

    /**
     * The offset used to move the displacement map.
     *
     * @member {Point}
     * @memberof AlphaMaskFilter#
     */
    offset: {
        get: function()
        {
            return this.uniforms.offset.value;
        },
        set: function(value)
        {
            this.uniforms.offset.value = value;
        }
    }
});
