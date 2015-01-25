var AbstractFilter = require('../core/renderers/webGL/utils/AbstractFilter'),
    blurFactor = 1 / 7000;

/**
 * The BlurYFilter applies a vertical Gaussian blur to an object.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function BlurYFilter()
{
    AbstractFilter.call(this,
    null,
    [
        'precision lowp float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform float blur;',
        'uniform sampler2D uSampler;',

        'void main(void)',
        '{',
        '   vec4 sum = vec4(0.0);',

        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;',
        '   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;',

        '   gl_FragColor = sum;',
        '}'
    ].join('\n'),

    // set the uniforms
    {
        blur: { type: '1f', value: 1 / 512 }
    });
}

BlurYFilter.prototype = Object.create(AbstractFilter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

Object.defineProperties(BlurYFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof BlurYFilter
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.uniforms.blur.value / blurFactor;
        },
        set: function (value)
        {
            //this.padding = value;
            this.uniforms.blur.value = blurFactor * value;
        }
    }
});
