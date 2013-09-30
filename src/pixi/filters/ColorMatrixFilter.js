/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.ColorMatrixFilter = function()
{
	// set the uniforms
	this.uniforms = {
		matrix: {type: 'mat4', value: [1,0,0,0,
									   0,1,0,0,
									   0,0,1,0,
									   0,0,0,1]},
	};
	
	this.fragmentSrc = [
	  "precision mediump float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform float invert;",
	  "uniform mat4 matrix;",
	  "uniform sampler2D uSampler;",
	  "void main(void) {",
	    "gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;",
	    "gl_FragColor = gl_FragColor * vColor;",
	  "}"
	];
	
}


Object.defineProperty(PIXI.ColorMatrixFilter.prototype, 'matrix', {
    get: function() {
        return this.uniforms.matrix.value;
    },
    set: function(value) {
    	this.uniforms.matrix.value = value;
    }
});