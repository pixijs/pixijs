/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



PIXI.GreyFilter = function()
{
	// set the uniforms
	this.uniforms = {
		grey: {type: 'f', value: 1},
	};
	
	this.fragmentSrc = [
	  "precision mediump float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform sampler2D uSampler;",
	  "uniform float grey;",
	  "void main(void) {",
	    "gl_FragColor = texture2D(uSampler, vTextureCoord);",
		"gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), grey);",
	    "gl_FragColor = gl_FragColor * vColor;",
	  "}"
	];
	
	this.primitiveFragmentSrc = [
	  "precision mediump float;",
	  "varying vec4 vColor;",
	  "uniform float grey;",
	  "void main(void) {",
		"gl_FragColor = vColor;",
		"gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), grey);",
		"gl_FragColor = gl_FragColor * vColor;",
	  "}"
	];

}

Object.defineProperty(PIXI.GreyFilter.prototype, 'grey', {
    get: function() {
        return this.uniforms.grey.value;
    },
    set: function(value) {
    	this.uniforms.grey.value = value;
    }
});
