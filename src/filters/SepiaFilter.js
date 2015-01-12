var AbstractFilter = require('./AbstractFilter');

/**
 * This applies a sepia effect to your Display Objects.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function SepiaFilter()
{
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        sepia: { type: '1f', value: 1 }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform float sepia;',
        'uniform sampler2D uSampler;',

        'const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);',

        'void main(void)
        {',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
        '   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);',
        '}'
    ];
}

SepiaFilter.prototype = Object.create(AbstractFilter.prototype);
SepiaFilter.prototype.constructor = SepiaFilter;
module.exports = SepiaFilter;

Object.defineProperties(SepiaFilter.prototype, {
    /**
     * The strength of the sepia. 1 will apply the full sepia effect, 0 will make the object its normal color.
     *
     * @member {number}
     * @memberof SepiaFilter#
     */
    sepia: {
        get: function ()
        {
            return this.uniforms.sepia.value;
        },
        set: function (value)
        {
            this.uniforms.sepia.value = value;
        }
    }
});
