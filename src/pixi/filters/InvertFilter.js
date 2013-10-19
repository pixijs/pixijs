/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.InvertFilter = function()
{
	// set the uniforms
	this.uniforms = {
		invert: {type: 'f', value: 0.5},
	};
	
	this.fragmentSrc = [
	  "precision mediump float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform float invert;",
	  "uniform sampler2D uSampler;",
	  "void main(void) {",
	    "gl_FragColor = texture2D(uSampler, vTextureCoord);",
		"gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, invert);",
		//"gl_FragColor.rgb = gl_FragColor.rgb  * gl_FragColor.a;",
	    "gl_FragColor = gl_FragColor * vColor;",
	  "}"
	];
	
}


Object.defineProperty(PIXI.InvertFilter.prototype, 'invert', {
    get: function() {
        return this.uniforms.invert.value;
    },
    set: function(value) {
    	this.uniforms.invert.value = value;
    }
});