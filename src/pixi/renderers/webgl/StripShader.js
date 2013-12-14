/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


PIXI.StripShader = function()
{
	// the webGL program..
	this.program;
	
    this.fragmentSrc = [
      "precision mediump float;",
      "varying vec2 vTextureCoord;",
      "varying float vColor;",
      "uniform float alpha;",
      "uniform sampler2D uSampler;",
      "void main(void) {",
        "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));",
        "gl_FragColor = gl_FragColor * alpha;",
      "}"
    ];

    this.vertexSrc = [
      "attribute vec2 aVertexPosition;",
      "attribute vec2 aTextureCoord;",
      "attribute float aColor;",
      "uniform mat3 translationMatrix;",
      "uniform vec2 projectionVector;",
      "varying vec2 vTextureCoord;",
      "varying vec2 offsetVector;",
      "varying float vColor;",
      "void main(void) {",
        "vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);",
        "v -= offsetVector.xyx;",
        "gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / projectionVector.y + 1.0 , 0.0, 1.0);",
        "vTextureCoord = aTextureCoord;",
        "vColor = aColor;",
      "}"
    ];
}

PIXI.StripShader.prototype.init = function()
{
	var program = PIXI.compileProgram(this.vertexSrc, this.fragmentSrc)
	
	var gl = PIXI.gl;
	
    gl.useProgram(program);

	// get and store the uniforms for the shader
	this.uSampler = gl.getUniformLocation(program, "uSampler");
	this.projectionVector = gl.getUniformLocation(program, "projectionVector");
	this.offsetVector = gl.getUniformLocation(program, "offsetVector");
	this.colorAttribute = gl.getAttribLocation(program, "aColor");
	//this.dimensions = gl.getUniformLocation(this.program, "dimensions");
	
	// get and store the attributes
	this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
	this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
	  
    this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
    this.alpha = gl.getUniformLocation(program, "alpha");
  
	this.program = program;
}
