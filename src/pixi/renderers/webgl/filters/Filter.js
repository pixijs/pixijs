/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


PIXI.Filter = function()
{
	// build a program
	/*
	this.vertexSrc = [
	  "attribute vec2 aVertexPosition;",
	  "attribute vec2 aTextureCoord;",
	  
	  "uniform vec2 projectionVector;",
	  "uniform vec2 dimensions;",
	  "uniform vec2 offsetVector;",
	  
	  "varying vec2 vTextureCoord;",
	  "const vec2 center = vec2(-1.0, 1.0);",

	  "void main(void) {",
	  
	  	"vec2 tempVector = aVertexPosition;",
	  	"tempVector *= dimensions;",
	  
	  	"tempVector.y -= dimensions.y;",
	  	"tempVector += offsetVector;",

	  	"tempVector /= projectionVector;",

	  	"tempVector *= 2.0;",

	  	"tempVector += center;",
	  	
	     "gl_Position = vec4( tempVector, 0.0, 1.0);",
	    "vTextureCoord = aTextureCoord;",
	  "}"
	];*/
	
	this.vertexSrc = [
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

	this.fragmentSrc = [
	  "precision lowp float;",
	  "varying vec2 vTextureCoord;",
	  "uniform sampler2D uSampler;",
	  
	  "void main(void) {",
	    "gl_FragColor = texture2D(uSampler, vTextureCoord).grba;",
	  "}"
	];
	
	
	// build program
	this.program = PIXI.compileProgram(this.vertexSrc, this.fragmentSrc);
	
	var gl = PIXI.gl;
	
	// get and store the uniforms for the shader
	this.uSampler = gl.getUniformLocation(this.program, "uSampler");
	this.projectionVector = gl.getUniformLocation(this.program, "projectionVector");
	this.offsetVector = gl.getUniformLocation(this.program, "offsetVector");
	//this.dimensions = gl.getUniformLocation(this.program, "dimensions");
	
	// get and store the attributes
	this.aVertexPosition = gl.getAttribLocation(this.program, "aVertexPosition");
	this.aTextureCoord = gl.getAttribLocation(this.program, "aTextureCoord");

}

PIXI.Filter.prototype.begin = function()
{
	var gl = PIXI.gl;
	
	gl.bindTexture(gl.TEXTURE_2D,  this.texture);
	
	var filterArea = this.target.filterArea;
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  filterArea.width, filterArea.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
   
	// set view port
	gl.viewport(0, 0, filterArea.width, filterArea.height);	
	
	// update projection
	gl.uniform2f(PIXI.currentShader.projectionVector, filterArea.width/2, -filterArea.height/2);
	gl.uniform2f(PIXI.currentShader.offsetVector, -filterArea.x, -filterArea.y);

	gl.colorMask(true, true, true, true); 
	gl.clearColor(0,0,0, 0);     
	gl.clear(gl.COLOR_BUFFER_BIT);
}


PIXI.Filter.prototype.end = function(x, y, offsetX, offsetY)
{
	var gl = PIXI.gl;
	
	// set the filter proram..
	gl.useProgram(this.program);
	
	var filterArea =  this.target.filterArea;
	
	// set the uniforms..
	gl.uniform2f(this.projectionVector, x, y)
	gl.uniform2f(this.offsetVector,  filterArea.x - offsetX, -(filterArea.y-offsetY))
	gl.uniform2f(this.dimensions, filterArea.width, filterArea.height);
	
	// bind the buffers..	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

   	gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(this.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
	// set texture
    gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	
	// draw the filter...
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );
	
    gl.useProgram(PIXI.defaultShader.program);
}



// API
