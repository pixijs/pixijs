var AbstractFilter = require('./AbstractFilter');

/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function TwistFilter()
{
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        radius:     { type: '1f', value: 0.5},
        angle:      { type: '1f', value: 5},
        offset:     { type: '2f', value: { x: 0.5, y: 0.5 } }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform float radius;',
        'uniform float angle;',
        'uniform vec2 offset;',
        'uniform sampler2D uSampler;',

        'void main(void)',
        '{',
        '   vec2 coord = vTextureCoord - offset;',
        '   float distance = length(coord);',

        '   if (distance < radius)',
        '   {',
        '       float ratio = (radius - distance) / radius;',
        '       float angleMod = ratio * ratio * angle;',
        '       float s = sin(angleMod);',
        '       float c = cos(angleMod);',
        '       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);',
        '   }',

        '   gl_FragColor = texture2D(uSampler, coord+offset);',
        '}'
    ];
}

TwistFilter.prototype = Object.create(AbstractFilter.prototype);
TwistFilter.prototype.constructor = TwistFilter;
module.exports = TwistFilter;

Object.defineProperties(TwistFilter.prototype, {
    /**
     * This point describes the the offset of the twist.
     *
     * @member {Point}
     * @memberof TwistFilter#
     */
    offset: {
        get: function ()
        {
            return this.uniforms.offset.value;
        },
        set: function (value)
        {
            this.uniforms.offset.value = value;
        }
    },

    /**
     * This radius of the twist.
     *
     * @member {number}
     * @memberof TwistFilter#
     */
    radius: {
        get: function ()
        {
            return this.uniforms.radius.value;
        },
        set: function (value)
        {
            this.uniforms.radius.value = value;
        }
    },

    /**
     * This angle of the twist.
     *
     * @member {number}
     * @memberof TwistFilter#
     */
    angle: {
        get: function ()
        {
            return this.uniforms.angle.value;
        },
        set: function (value)
        {
            this.uniforms.angle.value = value;
        }
    }
});
