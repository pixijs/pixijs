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
	var program = PIXI.compileProgram(this.vertexSrc || PIXI.PixiShader.defaultVertexSrc, this.fragmentSrc)
	
	var gl = PIXI.gl;
	
    gl.useProgram(program);
	
	// get and store the uniforms for the shader
	this.uSampler = gl.getUniformLocation(program, "uSampler");
	this.projectionVector = gl.getUniformLocation(program, "projectionVector");
	this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    //this.dimensions = gl.getUniformLocation(this.program, "dimensions");
    
    // get and store the attributes
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
	this.colorAttribute = gl.getAttribLocation(program, "aColor");
	this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
	  
    // add those custom shaders!
    for (var key in this.uniforms)
    {
       
    	// get the uniform locations..
	//	program[key] = 
        this.uniforms[key].uniformLocation = gl.getUniformLocation(program, key);

      
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
			gl.uniform1f(this.uniforms[key].uniformLocation, this.uniforms[key].value);
    	}
    	if(type == "f2")
    	{
    	//	console.log(this.program[key])
			gl.uniform2f(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y);
    	}
        else if(type == "f4")
        {
           // console.log(this.uniforms[key].value)
            gl.uniform4fv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
    	else if(type == "mat4")
    	{
    		gl.uniformMatrix4fv(this.uniforms[key].uniformLocation, false, this.uniforms[key].value);
    	}
    	else if(type == "sampler2D")
    	{
    		// first texture...
    		var texture = this.uniforms[key].value;
    		
    		gl.activeTexture(gl.TEXTURE1);
	    	gl.bindTexture(gl.TEXTURE_2D, texture.baseTexture._glTexture);
	    	
    		gl.uniform1i(this.uniforms[key].uniformLocation, 1);
    		
    		// activate texture..
    		// gl.uniformMatrix4fv(this.program[key], false, this.uniforms[key].value);
    		// gl.uniformMatrix4fv(this.program[key], false, this.uniforms[key].value);
    	}
    }
    
}

PIXI.PixiShader.defaultVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "attribute vec2 aTextureCoord;",
  "attribute float aColor;",
  
  "uniform vec2 projectionVector;",
 "uniform vec2 offsetVector;",
  "varying vec2 vTextureCoord;",
  
  "varying float vColor;",

  "const vec2 center = vec2(-1.0, 1.0);",
  "void main(void) {",
    "gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);",
    "vTextureCoord = aTextureCoord;",
    "vColor = aColor;",
  "}"
];
