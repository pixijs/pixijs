/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * An RGB Split Filter.
 * 
 * @class RGBSplitFilter
 * @extends AbstractFilter
 * @constructor
 */
PIXI.RGBSplitFilter = function()
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        red: {type: '2f', value: {x:20, y:20}},
        green: {type: '2f', value: {x:-20, y:20}},
        blue: {type: '2f', value: {x:20, y:-20}},
        dimensions:   {type: '4fv', value:[0,0,0,0]}
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

        'void main(void) {',
        '   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;',
        '   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;',
        '   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;',
        '   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;',
        '}'
    ];
};

PIXI.RGBSplitFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.RGBSplitFilter.prototype.constructor = PIXI.RGBSplitFilter;

/**
 * Red channel offset.
 * 
 * @property red
 * @type Point
 */
Object.defineProperty(PIXI.RGBSplitFilter.prototype, 'red', {
    get: function() {
        return this.uniforms.red.value;
    },
    set: function(value) {
        this.uniforms.red.value = value;
    }
});

/**
 * Green channel offset.
 * 
 * @property green
 * @type Point
 */
Object.defineProperty(PIXI.RGBSplitFilter.prototype, 'green', {
    get: function() {
        return this.uniforms.green.value;
    },
    set: function(value) {
        this.uniforms.green.value = value;
    }
});

/**
 * Blue offset.
 * 
 * @property blue
 * @type Point
 */
Object.defineProperty(PIXI.RGBSplitFilter.prototype, 'blue', {
    get: function() {
        return this.uniforms.blue.value;
    },
    set: function(value) {
        this.uniforms.blue.value = value;
    }
});
