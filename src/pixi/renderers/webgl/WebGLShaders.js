
/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/*
 * the default suoer fast shader!
 */

PIXI.shaderFragmentSrc = [
  "precision mediump float;",
  "varying vec2 vTextureCoord;",
  "varying float vColor;",
  "uniform sampler2D uSampler;",
  "void main(void) {",
    "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));",
    "gl_FragColor = gl_FragColor * vColor;",
  "}"
];

PIXI.shaderVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "attribute vec2 aTextureCoord;",
  "attribute float aColor;",
  //"uniform mat4 uMVMatrix;",
  
  "uniform vec2 projectionVector;",
  "varying vec2 vTextureCoord;",
  "varying float vColor;",
  "void main(void) {",
   // "gl_Position = uMVMatrix * vec4(aVertexPosition, 1.0, 1.0);",
    "gl_Position = vec4( aVertexPosition.x / projectionVector.x -1.0, aVertexPosition.y / -projectionVector.y + 1.0 , 0.0, 1.0);",
    "vTextureCoord = aTextureCoord;",
    "vColor = aColor;",
  "}"
];

/*
 * the triangle strip shader..
 */

PIXI.stripShaderFragmentSrc = [
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


PIXI.stripShaderVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "attribute vec2 aTextureCoord;",
  "attribute float aColor;",
  "uniform mat3 translationMatrix;",
  "uniform vec2 projectionVector;",
  "varying vec2 vTextureCoord;",
  "varying float vColor;",
  "void main(void) {",
	"vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);",
    "gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);",
    "vTextureCoord = aTextureCoord;",
    "vColor = aColor;",
  "}"
];


/*
 * primitive shader..
 */

PIXI.primitiveShaderFragmentSrc = [
  "precision mediump float;",
  "varying vec4 vColor;",
  "void main(void) {",
    "gl_FragColor = vColor;",
  "}"
];

PIXI.primitiveShaderVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "attribute vec4 aColor;",
  "uniform mat3 translationMatrix;",
  "uniform vec2 projectionVector;",
  "uniform float alpha;",
  "varying vec4 vColor;",
  "void main(void) {",
  	"vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);",
    "gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);",
    "vColor = aColor  * alpha;",
  "}"
];

PIXI.initPrimitiveShader = function() 
{
	var gl = PIXI.gl;

	var shaderProgram = PIXI.compileProgram(PIXI.primitiveShaderVertexSrc, PIXI.primitiveShaderFragmentSrc)
	
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");
    
    shaderProgram.projectionVector = gl.getUniformLocation(shaderProgram, "projectionVector");
    shaderProgram.translationMatrix = gl.getUniformLocation(shaderProgram, "translationMatrix");
    
	shaderProgram.alpha = gl.getUniformLocation(shaderProgram, "alpha");

	PIXI.primitiveProgram = shaderProgram;
}

PIXI.initDefaultShader = function() 
{
	var gl = this.gl;
	var shaderProgram = PIXI.compileProgram(PIXI.shaderVertexSrc, PIXI.shaderFragmentSrc)
	
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.projectionVector = gl.getUniformLocation(shaderProgram, "projectionVector");
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");

   // shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    
	PIXI.shaderProgram = shaderProgram;
}

PIXI.initDefaultStripShader = function() 
{
	var gl = this.gl;
	var shaderProgram = PIXI.compileProgram(PIXI.stripShaderVertexSrc, PIXI.stripShaderFragmentSrc)
	
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.projectionVector = gl.getUniformLocation(shaderProgram, "projectionVector");
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	shaderProgram.translationMatrix = gl.getUniformLocation(shaderProgram, "translationMatrix");
	shaderProgram.alpha = gl.getUniformLocation(shaderProgram, "alpha");

	shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");

    shaderProgram.projectionVector = gl.getUniformLocation(shaderProgram, "projectionVector");
    
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    
	PIXI.stripShaderProgram = shaderProgram;
}

PIXI.CompileVertexShader = function(gl, shaderSrc)
{
  return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
}

PIXI.CompileFragmentShader = function(gl, shaderSrc)
{
  return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
}

PIXI._CompileShader = function(gl, shaderSrc, shaderType)
{
  var src = shaderSrc.join("\n");
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


PIXI.compileProgram = function(vertexSrc, fragmentSrc)
{
	var gl = PIXI.gl;
	var fragmentShader = PIXI.CompileFragmentShader(gl, fragmentSrc);
	var vertexShader = PIXI.CompileVertexShader(gl, vertexSrc);
	
	var shaderProgram = gl.createProgram();
	
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

	return shaderProgram;
} 


PIXI.activateDefaultShader = function()
{
	var gl = PIXI.gl;
	var shaderProgram = PIXI.shaderProgram;
	
	gl.useProgram(shaderProgram);
	
	
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    gl.enableVertexAttribArray(shaderProgram.colorAttribute);
}

	

PIXI.activatePrimitiveShader = function()
{
	var gl = PIXI.gl;
	
	gl.disableVertexAttribArray(PIXI.shaderProgram.textureCoordAttribute);
    gl.disableVertexAttribArray(PIXI.shaderProgram.colorAttribute);
    
	gl.useProgram(PIXI.primitiveProgram);
	
	gl.enableVertexAttribArray(PIXI.primitiveProgram.vertexPositionAttribute);
	gl.enableVertexAttribArray(PIXI.primitiveProgram.colorAttribute);
} 

