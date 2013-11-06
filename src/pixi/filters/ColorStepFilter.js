/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * 
 * This turns your displayObjects to black and white.
 * @class ColorStepFilter
 * @contructor
 */
PIXI.ColorStepFilter = function()
{
	PIXI.AbstractFilter.call( this );
	
	this.passes = [this];
	
	// set the uniforms
	this.uniforms = {
		step: {type: 'f', value: 5},
	};
	
	this.fragmentSrc = [
	  "precision mediump float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform sampler2D uSampler;",
	  "uniform float step;",
	  "void main(void) {",
	    "vec4 color = texture2D(uSampler, vTextureCoord);",
	    "color = floor(color * step) / step;",
	    "gl_FragColor = color * vColor;",
	  "}"
	];
}

PIXI.ColorStepFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.ColorStepFilter.prototype.constructor = PIXI.ColorStepFilter;

/**
The number of steps.
@property step
*/
Object.defineProperty(PIXI.ColorStepFilter.prototype, 'step', {
    get: function() {
        return this.uniforms.step.value;
    },
    set: function(value) {
    	this.uniforms.step.value = value;
    }
});
