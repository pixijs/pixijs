var AbstractFilter = require('./AbstractFilter');

/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
function PixelateFilter() {
    AbstractFilter.call(this);

    // set the uniforms
    this.uniforms = {
        invert:     { type: '1f',   value: 0 },
        dimensions: { type: '4fv',  value: new Float32Array([10000, 100, 10, 10]) },
        pixelSize:  { type: '2f',   value: { x: 10, y: 10 } }
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform vec2 testDim;',
        'uniform vec4 dimensions;',
        'uniform vec2 pixelSize;',
        'uniform sampler2D uSampler;',

        'void main(void) {',
        '   vec2 coord = vTextureCoord;',

        '   vec2 size = dimensions.xy/pixelSize;',

        '   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;',
        '   gl_FragColor = texture2D(uSampler, color);',
        '}'
    ];
}

PixelateFilter.prototype = Object.create(AbstractFilter.prototype);
PixelateFilter.prototype.constructor = PixelateFilter;
module.exports = PixelateFilter;

Object.defineProperties(PixelateFilter.prototype, {
    /**
     * This a point that describes the size of the blocks. x is the width of the block and y is the height.
     *
     * @member {Point}
     * @memberof PixelateFilter#
     */
    size: {
        get: function () {
            return this.uniforms.pixelSize.value;
        },
        set: function (value) {
            this.uniforms.pixelSize.value = value;
        }
    }
});
