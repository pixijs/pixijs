var AbstractFilter = require('../core/renderers/webGL/filters/AbstractFilter'),
    blurFactor = 1 / 7000;

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function BlurXFilter()
{
    AbstractFilter.call(this,
    // vertex shader
    null,
    // fragment shader
    [
        'precision lowp float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform float blur;',
        'uniform sampler2D uSampler;',

        'void main(void)',
        '{',
        '   vec4 sum = vec4(0.0);',

        '   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;',

        '   gl_FragColor = sum;',
        '}'
    ].join('\n'),
    // set the uniforms
    {
        blur: { type: '1f', value: 1 / 512 }
    });

}

BlurXFilter.prototype = Object.create( AbstractFilter.prototype );
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;

Object.defineProperties(BlurXFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof BlurXFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.uniforms.blur.value / blurFactor;
        },
        set: function (value)
        {
            this.uniforms.blur.value = blurFactor * value;
        }
    }
});
