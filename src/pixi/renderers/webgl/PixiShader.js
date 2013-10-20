/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


PIXI.PixiShader = function()
{
	// the webGL program..
	this.program;
	
	this.fragmentSrc = [
	  "precision lowp float;",
	  "varying vec2 vTextureCoord;",
	  "varying float vColor;",
	  "uniform sampler2D uSampler;",
	  "void main(void) {",
	    "gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;",
	  "}"
	];
	
}

PIXI.PixiShader.prototype.init = function()
{
	var program = PIXI.compileProgram(this.vertexSrc || PIXI.shaderVertexSrc, this.fragmentSrc)
	
	var gl = PIXI.gl;
	
    gl.useProgram(program);
	
	// get the default shader bits!
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
	program.colorAttribute = gl.getAttribLocation(program, "aColor");
    program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    
    program.projectionVector = gl.getUniformLocation(program, "projectionVector");
    program.samplerUniform = gl.getUniformLocation(program, "uSampler");
    
    // add those custom shaders!
    for (var key in this.uniforms)
    {
    	// get the uniform locations..
		program[key] = gl.getUniformLocation(program, key);
    }
    
	this.program = program;
}

PIXI.PixiShader.prototype.syncUniforms = function()
{
	var gl = PIXI.gl;
	
	for (var key in this.uniforms) 
    {
    	//var 
    	var type = this.uniforms[key].type;
    	
    	// need to grow this!
    	if(type == "f")
    	{
			gl.uniform1f(this.program[key], this.uniforms[key].value);
    	}
    	if(type == "f2")
    	{
			gl.uniform2f(this.program[key], this.uniforms[key].value.x, this.uniforms[key].value.y);
    	}
    	else if(type == "mat4")
    	{
    		gl.uniformMatrix4fv(this.program[key], false, this.uniforms[key].value);
    	}
    	else if(type == "sampler2D")
    	{
    		// first texture...
    		var texture = this.uniforms[key].value;
    		
    		gl.activeTexture(gl.TEXTURE1);
	    	gl.bindTexture(gl.TEXTURE_2D, texture.baseTexture._glTexture);
	    	
    		gl.uniform1i(this.program[key], 1);
    		
    		
    		// activate texture..
    		// gl.uniformMatrix4fv(this.program[key], false, this.uniforms[key].value);
    		// gl.uniformMatrix4fv(this.program[key], false, this.uniforms[key].value);
    	}
    }
    
}

