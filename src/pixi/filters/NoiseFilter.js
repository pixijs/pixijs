/**
 * @author Vico @vicocotea
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 */

/**
 * A Noise effect filter.
 * 
 * @class NoiseFilter
 * @extends AbstractFilter
 * @constructor
 */
PIXI.NoiseFilter = function()
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        noise: {type: '1f', value: 0.5}
    };

    this.fragmentSrc = [
        'precision mediump float;',
        'uniform sampler2D uSampler;',
        'uniform float noise;',
        'varying vec2 vTextureCoord;',

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

PIXI.NoiseFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.NoiseFilter.prototype.constructor = PIXI.NoiseFilter;

/**
 * The amount of noise to apply.
 * @property noise
 * @type Number
*/
Object.defineProperty(PIXI.NoiseFilter.prototype, 'noise', {
    get: function() {
        return this.uniforms.noise.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.noise.value = value;
    }
});
