var AbstractFilter = require('./AbstractFilter');

/**
 * An RGB Split Filter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function RGBSplitFilter()
{
    AbstractFilter.call(this);

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        red:        { type: '2f', value: { x: 20, y: 20 } },
        green:      { type: '2f', value: { x: -20, y: 20 } },
        blue:       { type: '2f', value: { x: 20, y: -20 } },
        dimensions: { type: '4fv', value: [0, 0, 0, 0] }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform vec2 red;',
        'uniform vec2 green;',
        'uniform vec2 blue;',
        'uniform vec4 dimensions;',
        'uniform sampler2D uSampler;',

        'void main(void)',
        '{',
        '   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;',
        '   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;',
        '   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;',
        '   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;',
        '}'
    ];
}

RGBSplitFilter.prototype = Object.create(AbstractFilter.prototype);
RGBSplitFilter.prototype.constructor = RGBSplitFilter;
module.exports = RGBSplitFilter;

Object.defineProperties(RGBSplitFilter.prototype, {
    /**
     * Red channel offset.
     *
     * @member {Point}
     * @memberof RGBSplitFilter#
     */
    red: {
        get: function ()
        {
            return this.uniforms.red.value;
        },
        set: function (value)
        {
            this.uniforms.red.value = value;
        }
    },

    /**
     * Green channel offset.
     *
     * @member {Point}
     * @memberof RGBSplitFilter#
     */
    green: {
        get: function ()
        {
            return this.uniforms.green.value;
        },
        set: function (value)
        {
            this.uniforms.green.value = value;
        }
    },

    /**
     * Blue offset.
     *
     * @member {Point}
     * @memberof RGBSplitFilter#
     */
    blue: {
        get: function ()
        {
            return this.uniforms.blue.value;
        },
        set: function (value)
        {
            this.uniforms.blue.value = value;
        }
    }
});
