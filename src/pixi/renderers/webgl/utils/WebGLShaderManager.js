/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.WebGLShaderManager = function(gl)
{
    this.gl = gl;
    
    // this shader is used for the default sprite rendering
    this.defaultShader = new PIXI.PixiShader(gl);
    //PIXI.defaultShader = this.defaultShader;

    var shaderProgram = this.defaultShader.program;

    gl.useProgram(shaderProgram);

    gl.enableVertexAttribArray(this.defaultShader.aVertexPosition);
    gl.enableVertexAttribArray(this.defaultShader.colorAttribute);
    gl.enableVertexAttribArray(this.defaultShader.aTextureCoord);

    // the next one is used for rendering primatives
    this.primitiveShader = new PIXI.PrimitiveShader(gl);
   

    // the final one is used for the rendering strips
    //this.stripShader = new PIXI.StripShader(gl);
};


PIXI.WebGLShaderManager.prototype.activatePrimitiveShader = function()
{
    var gl = this.gl;

    gl.useProgram(this.primitiveShader.program);

    gl.disableVertexAttribArray(this.defaultShader.aVertexPosition);
    gl.disableVertexAttribArray(this.defaultShader.colorAttribute);
    gl.disableVertexAttribArray(this.defaultShader.aTextureCoord);

    gl.enableVertexAttribArray(this.primitiveShader.aVertexPosition);
    gl.enableVertexAttribArray(this.primitiveShader.colorAttribute);
};

PIXI.WebGLShaderManager.prototype.deactivatePrimitiveShader = function()
{
    var gl = this.gl;

    gl.useProgram(this.defaultShader.program);

    gl.disableVertexAttribArray(this.primitiveShader.aVertexPosition);
    gl.disableVertexAttribArray(this.primitiveShader.colorAttribute);

    gl.enableVertexAttribArray(this.defaultShader.aVertexPosition);
    gl.enableVertexAttribArray(this.defaultShader.colorAttribute);
    gl.enableVertexAttribArray(this.defaultShader.aTextureCoord);
};