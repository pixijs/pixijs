var AbstractFilter = require('./AbstractFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftXFilter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function TiltShiftXFilter() {
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        blur:           { type: '1f', value: 100 },
        gradientBlur:   { type: '1f', value: 600 },
        start:          { type: '2f', value: { x: 0,    y: window.screenHeight / 2 } },
        end:            { type: '2f', value: { x: 600,  y: window.screenHeight / 2 } },
        delta:          { type: '2f', value: { x: 30,   y: 30 } },
        texSize:        { type: '2f', value: { x: window.screenWidth, y: window.screenHeight } }
    };

    this.updateDelta();

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',

        'uniform sampler2D uSampler;',
        'uniform float blur;',
        'uniform float gradientBlur;',
        'uniform vec2 start;',
        'uniform vec2 end;',
        'uniform vec2 delta;',
        'uniform vec2 texSize;',

        'float random(vec3 scale, float seed) {',
        '   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);',
        '}',

        'void main(void) {',
        '    vec4 color = vec4(0.0);',
        '    float total = 0.0;',

        '    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);',
        '    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));',
        '    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;',

        '    for (float t = -30.0; t <= 30.0; t++) {',
        '        float percent = (t + offset - 0.5) / 30.0;',
        '        float weight = 1.0 - abs(percent);',
        '        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);',
        '        sample.rgb *= sample.a;',
        '        color += sample * weight;',
        '        total += weight;',
        '    }',

        '    gl_FragColor = color / total;',
        '    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;',
        '}'
    ];
}

TiltShiftXFilter.prototype = Object.create(AbstractFilter.prototype);
TiltShiftXFilter.prototype.constructor = TiltShiftXFilter;
module.exports = TiltShiftXFilter;

/**
 * Updates the filter delta values.
 *
 */
TiltShiftXFilter.prototype.updateDelta = function () {
    var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
    var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
    var d = Math.sqrt(dx * dx + dy * dy);

    this.uniforms.delta.value.x = dx / d;
    this.uniforms.delta.value.y = dy / d;
};


Object.defineProperties(TiltShiftXFilter.prototype, {
    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof TilttShiftXFilter#
     */
    blur: {
        get: function () {
            return this.uniforms.blur.value;
        },
        set: function (value) {
            this.uniforms.blur.value = value;
        }
    },

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof TilttShiftXFilter#
     */
    gradientBlur: {
        get: function () {
            return this.uniforms.gradientBlur.value;
        },
        set: function (value) {
            this.uniforms.gradientBlur.value = value;
        }
    },

    /**
     * The X value to start the effect at.
     *
     * @member {number}
     * @memberof TilttShiftXFilter#
     */
    start: {
        get: function () {
            return this.uniforms.start.value;
        },
        set: function (value) {
            this.uniforms.start.value = value;
            this.updateDelta();
        }
    },

    /**
     * The X value to end the effect at.
     *
     * @member {number}
     * @memberof TilttShiftXFilter#
     */
    end: {
        get: function () {
            return this.uniforms.end.value;
        },
        set: function (value) {
            this.uniforms.end.value = value;
            this.updateDelta();
        }
    }
});
