/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



PIXI.DisplacementFilter = function(texture)
{
	// set the uniforms
	
	this.uniforms = {
		displacementMap: {type: 'sampler2D', value:texture},
		scale:			 {type: 'f2', value:{x:30, y:30}},
		mapDimensions:   {type: 'f2', value:{x:texture.width, y:texture.height}}
	};
	
	this.fragmentSrc = [
	  "precision mediump float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform sampler2D displacementMap;",
	  "uniform sampler2D uSampler;",
	  "uniform vec2 scale;",
	  "uniform vec2 mapDimensions;",// = vec2(256.0, 256.0);",
	  "const vec2 textureDimensions = vec2(245.0, 263.0);",
	  
	  "void main(void) {",
	  
	  	"vec2 matSample = texture2D(displacementMap, vTextureCoord * (textureDimensions/mapDimensions)).xy;",
		"matSample -= 0.5;",	  
	 	"matSample *= scale;",
	 	"matSample /= textureDimensions;",
	    "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));",
		"gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);",
	    "gl_FragColor = gl_FragColor * vColor;",
	    
	  "}"
	];
	
}

Object.defineProperty(PIXI.DisplacementFilter.prototype, 'map', {
    get: function() {
        return this.uniforms.displacementMap.value;
    },
    set: function(value) {
    	this.uniforms.displacementMap.value = value;
    }
});

Object.defineProperty(PIXI.DisplacementFilter.prototype, 'scale', {
    get: function() {
        return this.uniforms.scale.value;
    },
    set: function(value) {
    	this.uniforms.scale.value = value;
    }
});