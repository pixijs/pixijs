var AbstractFilter = require('../core/renderers/webGL/filters/AbstractFilter');

/**
 * This greyscales the palette of your Display Objects.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function GrayFilter()
{
    AbstractFilter.call(this,
    null,
    // fragment
    [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform sampler2D uSampler;',
        'uniform float gray;',

        'void main(void)',
        '{',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
        '   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);',
     //   '   gl_FragColor = gl_FragColor;',
        '}'
    ].join('\n'),
    // set the uniforms
    {
        gray: { type: '1f', value: 1 }
    });

}

GrayFilter.prototype = Object.create(AbstractFilter.prototype);
GrayFilter.prototype.constructor = GrayFilter;
module.exports = GrayFilter;

Object.defineProperties(GrayFilter.prototype, {
    /**
     * The strength of the gray. 1 will make the object black and white, 0 will make the object its normal color.
     *
     * @member {number}
     * @memberof GrayFilter#
     */
    gray: {
        get: function ()
        {
            return this.uniforms.gray.value;
        },
        set: function (value)
        {
            this.uniforms.gray.value = value;
        }
    }
});
