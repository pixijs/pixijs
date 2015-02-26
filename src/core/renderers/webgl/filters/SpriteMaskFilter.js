var AbstractFilter = require('./AbstractFilter'),
    math =  require('../../../math');

/**
 * The SpriteMaskFilter class 
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI
 * @param sprite {Sprite} the target sprite
 */
function SpriteMaskFilter(sprite)
{
    var maskMatrix = new math.Matrix();

    //TODO move this code out to a frag and vert file.
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
            mask:           { type: 'sampler2D', value: sprite.texture },
            otherMatrix:    { type: 'mat3', value: maskMatrix.toArray(true) }
        }
    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;
}

SpriteMaskFilter.prototype = Object.create(AbstractFilter.prototype);
SpriteMaskFilter.prototype.constructor = SpriteMaskFilter;
module.exports = SpriteMaskFilter;

/**
 * Applies the filter ? @alvin
 *
 * @param renderer {WebGLRenderer} A reference to the WebGL renderer
 * @param input {RenderTarget} 
 * @param output {RenderTarget} 
 */
SpriteMaskFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);

    this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);

    var shader = this.getShader(renderer);
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};


Object.defineProperties(SpriteMaskFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {Texture}
     * @memberof SpriteMaskFilter#
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
     * @memberof SpriteMaskFilter#
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
