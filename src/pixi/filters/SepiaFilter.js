/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



PIXI.SepiaFilter = function()
{
	// set the uniforms
	this.uniforms = {
		sepia: {type: 'f', value: 1},
	};
	
	this.fragmentSrc = [
	  "precision mediump float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform float sepia;",
	  "uniform sampler2D uSampler;",
	 	   
	  "const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);",
	  "void main(void) {",
	    "gl_FragColor = texture2D(uSampler, vTextureCoord);",
		"gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);",
	    "gl_FragColor = gl_FragColor * vColor;",
	  "}"
	];
	
}

Object.defineProperty(PIXI.SepiaFilter.prototype, 'sepia', {
    get: function() {
        return this.uniforms.sepia.value;
    },
    set: function(value) {
    	this.uniforms.sepia.value = value;
    }
});
