var AbstractFilter = require('./AbstractFilter');

/**
 * The ColorMatrixFilter class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function ColorMatrixFilter()
{
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        matrix: { type: 'mat4', value: [1, 0, 0, 0,
                                        0, 1, 0, 0,
                                        0, 0, 1, 0,
                                        0, 0, 0, 1] }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform float invert;',
        'uniform mat4 matrix;',
        'uniform sampler2D uSampler;',

        'void main(void)',
        '{',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord) * 1.0;',
     //   '   gl_FragColor *= gl_FragCoord.x;',
//        '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',//texture2D(uSampler, vTextureCoord) * matrix;',
        '}'
    ].join('\n');
}

ColorMatrixFilter.prototype = Object.create(AbstractFilter.prototype);
ColorMatrixFilter.prototype.constructor = ColorMatrixFilter;
module.exports = ColorMatrixFilter;

Object.defineProperties(ColorMatrixFilter.prototype, {
    /**
     * Sets the matrix of the color matrix filter
     *
     * @member {number[]}
     * @memberof ColorMatrixFilter#
     * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.matrix.value;
        },
        set: function (value)
        {
            this.uniforms.matrix.value = value;
        }
    }
});
