/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


PIXI.PrimitiveShader = function()
{
	// the webGL program..
	this.program;
    	
    this.fragmentSrc = [
      "precision mediump float;",
      "varying vec4 vColor;",
      "void main(void) {",
        "gl_FragColor = vColor;",
      "}"
    ];

    this.vertexSrc  = [
      "attribute vec2 aVertexPosition;",
      "attribute vec4 aColor;",
      "uniform mat3 translationMatrix;",
      "uniform vec2 projectionVector;",
      "uniform vec2 offsetVector;",
      "uniform float alpha;",
      "varying vec4 vColor;",
      "void main(void) {",
        "vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);",
        "v -= offsetVector.xyx;",
        "gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);",
        "vColor = aColor  * alpha;",
      "}"
    ];
	
}

PIXI.PrimitiveShader.prototype.init = function()
{
	var program = PIXI.compileProgram(this.vertexSrc, this.fragmentSrc);
	
	var gl = PIXI.gl;
	
  gl.useProgram(program);
	
	// get and store the uniforms for the shader
	this.projectionVector = gl.getUniformLocation(program, "projectionVector");
	this.offsetVector = gl.getUniformLocation(program, "offsetVector");
  
  // get and store the attributes
  this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
	this.colorAttribute = gl.getAttribLocation(program, "aColor");
	
  this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
  this.alpha = gl.getUniformLocation(program, "alpha");

	this.program = program;
}
