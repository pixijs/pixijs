/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.SmartBlurFilter = function()
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        blur: {type: '1f', value: 1/512},
    };

    this.fragmentSrc = [
        'precision mediump float;',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        //'uniform vec2 delta;',
        'const vec2 delta = vec2(1.0/10.0, 0.0);',
        //'uniform float darkness;',

        'float random(vec3 scale, float seed) {',
        '   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);',
        '}',


        'void main(void) {',
        '   vec4 color = vec4(0.0);',
        '   float total = 0.0;',

        '   float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);',

        '   for (float t = -30.0; t <= 30.0; t++) {',
        '       float percent = (t + offset - 0.5) / 30.0;',
        '       float weight = 1.0 - abs(percent);',
        '       vec4 sample = texture2D(uSampler, vTextureCoord + delta * percent);',
        '       sample.rgb *= sample.a;',
        '       color += sample * weight;',
        '       total += weight;',
        '   }',

        '   gl_FragColor = color / total;',
        '   gl_FragColor.rgb /= gl_FragColor.a + 0.00001;',
        //'   gl_FragColor.rgb *= darkness;',
        '}'
    ];
};

PIXI.SmartBlurFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.SmartBlurFilter.prototype.constructor = PIXI.SmartBlurFilter;

Object.defineProperty(PIXI.SmartBlurFilter.prototype, 'blur', {
    get: function() {
        return this.uniforms.blur.value;
    },
    set: function(value) {
        this.uniforms.blur.value = value;
    }
});
