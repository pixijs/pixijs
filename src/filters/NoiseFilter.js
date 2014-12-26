var AbstractFilter = require('./AbstractFilter');

/**
 * @author Vico @vicocotea
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 */

/**
 * A Noise effect filter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function NoiseFilter() {
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        noise: { type: '1f', value: 0.5 }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform float noise;',
        'uniform sampler2D uSampler;',

        'float rand(vec2 co) {',
        '    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
        '}',

        'void main() {',
        '    vec4 color = texture2D(uSampler, vTextureCoord);',

        '    float diff = (rand(vTextureCoord) - 0.5) * noise;',
        '    color.r += diff;',
        '    color.g += diff;',
        '    color.b += diff;',

        '    gl_FragColor = color;',
        '}'
    ];
};

NoiseFilter.prototype = Object.create(AbstractFilter.prototype);
NoiseFilter.prototype.constructor = NoiseFilter;
module.exports = NoiseFilter;

Object.defineProperties(NoiseFilter.prototype, {
    /**
     * The amount of noise to apply.
     *
     * @member {number}
     * @memberof NoiseFilter#
     * @default 0.5
     */
    noise: {
        get: function () {
            return this.uniforms.noise.value;
        },
        set: function (value) {
            this.dirty = true;
            this.uniforms.noise.value = value;
        }
    }
});
